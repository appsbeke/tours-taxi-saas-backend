import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../entities/organization.entity';
import { SubscriptionTier, getPlanByTier } from '../subscriptions/subscription-plans.config';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

@Injectable()
export class DomainsService {
  private readonly VERIFICATION_SUBDOMAIN = '_tours-taxi-verify';
  private readonly TARGET_CNAME = 'yoursaas.com'; // Replace with your actual domain

  constructor(
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
  ) {}

  async setCustomDomain(
    organizationId: string,
    customDomain: string,
  ): Promise<Organization> {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if plan allows custom domain
    const plan = getPlanByTier(organization.subscriptionPlan as any as SubscriptionTier);
    if (!plan.features.customDomain) {
      throw new BadRequestException(
        'Your current plan does not support custom domains. Please upgrade.',
      );
    }

    // Validate domain format
    if (!this.isValidDomain(customDomain)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Check if domain is already in use
    const existingOrg = await this.organizationsRepo.findOne({
      where: { customDomain },
    });

    if (existingOrg && existingOrg.id !== organizationId) {
      throw new BadRequestException('This domain is already in use');
    }

    await this.organizationsRepo.update(organizationId, {
      customDomain,
      domainVerified: false,
    });

    return this.organizationsRepo.findOne({
      where: { id: organizationId },
    });
  }

  async removeCustomDomain(organizationId: string): Promise<Organization> {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await this.organizationsRepo.update(organizationId, {
      customDomain: null,
      domainVerified: false,
    });

    return this.organizationsRepo.findOne({
      where: { id: organizationId },
    });
  }

  async getDnsRecords(organizationId: string) {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.customDomain) {
      throw new BadRequestException('No custom domain configured');
    }

    const verificationToken = this.generateVerificationToken(organizationId);

    return {
      domain: organization.customDomain,
      records: [
        {
          type: 'CNAME',
          name: '@',
          value: this.TARGET_CNAME,
          ttl: 3600,
          purpose: 'Point your domain to our platform',
        },
        {
          type: 'TXT',
          name: this.VERIFICATION_SUBDOMAIN,
          value: `tours-taxi-verification=${verificationToken}`,
          ttl: 3600,
          purpose: 'Verify domain ownership',
        },
      ],
      verificationToken,
    };
  }

  async verifyDomain(organizationId: string): Promise<{
    verified: boolean;
    message: string;
  }> {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.customDomain) {
      throw new BadRequestException('No custom domain configured');
    }

    const expectedToken = this.generateVerificationToken(organizationId);
    const verificationDomain = `${this.VERIFICATION_SUBDOMAIN}.${organization.customDomain}`;

    try {
      // Check TXT record for verification
      const txtRecords = await this.getTxtRecords(verificationDomain);
      const verificationRecord = txtRecords.find((record) =>
        record.includes(`tours-taxi-verification=${expectedToken}`),
      );

      if (!verificationRecord) {
        return {
          verified: false,
          message: 'Verification TXT record not found or incorrect',
        };
      }

      // Check CNAME record
      const cnameValid = await this.verifyCname(organization.customDomain);
      if (!cnameValid) {
        return {
          verified: false,
          message: 'CNAME record not found or incorrect',
        };
      }

      // Mark as verified
      await this.organizationsRepo.update(organizationId, {
        domainVerified: true,
      });

      return {
        verified: true,
        message: 'Domain verified successfully',
      };
    } catch (error) {
      return {
        verified: false,
        message: `DNS verification failed: ${error.message}`,
      };
    }
  }

  private async getTxtRecords(domain: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      dns.resolveTxt(domain, (err, records) => {
        if (err) {
          reject(err);
        } else {
          // Flatten the array of arrays
          resolve(records.map((record) => record.join('')));
        }
      });
    });
  }

  private async verifyCname(domain: string): Promise<boolean> {
    try {
      const cnameRecords = await resolveCname(domain);
      return cnameRecords.some((record) =>
        record.includes(this.TARGET_CNAME),
      );
    } catch (error) {
      // If CNAME doesn't exist, check A record (direct IP pointing)
      try {
        const aRecords = await resolve4(domain);
        // In production, check if A record points to your platform's IP
        return aRecords.length > 0;
      } catch {
        return false;
      }
    }
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  }

  private generateVerificationToken(organizationId: string): string {
    // Generate a deterministic token based on organization ID
    // In production, use a more secure method (e.g., hash with secret)
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(organizationId + process.env.DOMAIN_VERIFICATION_SECRET || 'secret')
      .digest('hex')
      .substring(0, 32);
  }
}
