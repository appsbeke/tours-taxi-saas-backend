import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Organization, OrganizationStatus } from '../../entities/organization.entity';
import { Subscription } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { OrganizationMember } from '../../entities/organization-member.entity';
import { SubscriptionTier } from '../subscriptions/subscription-plans.config';

@Injectable()
export class PlatformAdminService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
    @InjectRepository(Subscription)
    private subscriptionsRepo: Repository<Subscription>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(OrganizationMember)
    private membersRepo: Repository<OrganizationMember>,
  ) {}

  async getDashboardStats() {
    const [
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      totalUsers,
      activeSubscriptions,
    ] = await Promise.all([
      this.organizationsRepo.count(),
      this.organizationsRepo.count({
        where: { status: OrganizationStatus.ACTIVE },
      }),
      this.organizationsRepo.count({
        where: { status: OrganizationStatus.SUSPENDED },
      }),
      this.usersRepo.count(),
      this.subscriptionsRepo.count({
        where: { status: 'active' },
      }),
    ]);

    const subscriptionsByTier = await this.organizationsRepo
      .createQueryBuilder('org')
      .select('org.subscriptionPlan', 'tier')
      .addSelect('COUNT(*)', 'count')
      .groupBy('org.subscriptionPlan')
      .getRawMany();

    return {
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
        suspended: suspendedOrganizations,
      },
      users: {
        total: totalUsers,
      },
      subscriptions: {
        active: activeSubscriptions,
        byTier: subscriptionsByTier,
      },
    };
  }

  async getAllOrganizations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrganizationStatus;
    tier?: SubscriptionTier;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.organizationsRepo
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.subscription', 'subscription')
      .leftJoinAndSelect('org.members', 'members')
      .leftJoinAndSelect('members.user', 'user');

    if (params.search) {
      query.where(
        'org.name ILIKE :search OR org.slug ILIKE :search OR org.billingEmail ILIKE :search',
        { search: `%${params.search}%` },
      );
    }

    if (params.status) {
      query.andWhere('org.status = :status', { status: params.status });
    }

    if (params.tier) {
      query.andWhere('org.subscriptionPlan = :tier', { tier: params.tier });
    }

    const [organizations, total] = await query
      .orderBy('org.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrganizationDetails(organizationId: string) {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
      relations: ['subscription', 'members', 'members.user'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Get usage stats
    const memberCount = await this.membersRepo.count({
      where: { organizationId },
    });

    return {
      organization,
      stats: {
        members: memberCount,
        // Additional stats can be added here
      },
    };
  }

  async updateOrganizationStatus(
    organizationId: string,
    status: OrganizationStatus,
    reason?: string,
  ) {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await this.organizationsRepo.update(organizationId, {
      status,
      // Store reason in settings or create audit log
    });

    return this.organizationsRepo.findOne({
      where: { id: organizationId },
    });
  }

  async upgradeOrganizationPlan(
    organizationId: string,
    newTier: SubscriptionTier,
  ) {
    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await this.organizationsRepo.update(organizationId, {
      subscriptionPlan: newTier as any,
    });

    return this.organizationsRepo.findOne({
      where: { id: organizationId },
    });
  }

  async getRevenueAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate || new Date();

    // Get all active subscriptions
    const subscriptions = await this.subscriptionsRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['organization'],
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = await this.calculateMRR();

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Revenue by tier
    const revenueByTier = await this.calculateRevenueByTier();

    return {
      mrr,
      arr,
      revenueByTier,
      totalSubscriptions: subscriptions.length,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const query = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.memberships', 'memberships');

    if (params.search) {
      query.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        { search: `%${params.search}%` },
      );
    }

    const [users, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async calculateMRR(): Promise<number> {
    const tierPrices: Record<string, number> = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.STARTER]: 99,
      [SubscriptionTier.PRO]: 299,
      [SubscriptionTier.ENTERPRISE]: 999, // Placeholder for enterprise
    };

    const organizations = await this.organizationsRepo.find({
      where: { status: OrganizationStatus.ACTIVE },
    });

    return organizations.reduce((total, org) => {
      return total + (tierPrices[org.subscriptionPlan] || 0);
    }, 0);
  }

  private async calculateRevenueByTier() {
    const tierPrices: Record<string, number> = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.STARTER]: 99,
      [SubscriptionTier.PRO]: 299,
      [SubscriptionTier.ENTERPRISE]: 999,
    };

    const orgsByTier = await this.organizationsRepo
      .createQueryBuilder('org')
      .select('org.subscriptionPlan', 'tier')
      .addSelect('COUNT(*)', 'count')
      .where('org.status = :status', { status: OrganizationStatus.ACTIVE })
      .groupBy('org.subscriptionPlan')
      .getRawMany();

    return orgsByTier.map((item) => ({
      tier: item.tier,
      count: parseInt(item.count),
      revenue: parseInt(item.count) * tierPrices[item.tier],
    }));
  }
}
