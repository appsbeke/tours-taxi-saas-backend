import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Organization,
  OrganizationStatus,
  SubscriptionPlan,
} from '../../entities/organization.entity';
import { OrganizationMember, OrganizationRole, MemberStatus } from '../../entities/organization-member.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private membersRepo: Repository<OrganizationMember>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createDto: {
    name: string;
    slug: string;
    billingEmail: string;
    ownerId: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  }): Promise<Organization> {
    // Check if slug is unique
    const existing = await this.organizationsRepo.findOne({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    // Create organization with trial
    const trialDays = 14;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    const organization = this.organizationsRepo.create({
      name: createDto.name,
      slug: createDto.slug,
      billingEmail: createDto.billingEmail,
      phone: createDto.phone,
      address: createDto.address,
      city: createDto.city,
      country: createDto.country,
      status: OrganizationStatus.TRIAL,
      subscriptionPlan: SubscriptionPlan.FREE,
      trialEndsAt,
      // Free tier limits
      maxVehicles: 5,
      maxDrivers: 10,
      maxGuides: 5,
      maxBookingsPerMonth: 100,
    });

    const savedOrg = await this.organizationsRepo.save(organization);

    // Add owner as first member
    const owner = this.membersRepo.create({
      organizationId: savedOrg.id,
      userId: createDto.ownerId,
      role: OrganizationRole.OWNER,
      status: MemberStatus.ACTIVE,
    });

    await this.membersRepo.save(owner);

    // Update user's organizationId
    await this.usersRepo.update(createDto.ownerId, {
      organizationId: savedOrg.id,
    });

    return savedOrg;
  }

  async findAll(options?: {
    status?: OrganizationStatus;
    plan?: SubscriptionPlan;
    limit?: number;
    offset?: number;
  }): Promise<{ organizations: Organization[]; total: number }> {
    const query = this.organizationsRepo.createQueryBuilder('org');

    if (options?.status) {
      query.andWhere('org.status = :status', { status: options.status });
    }

    if (options?.plan) {
      query.andWhere('org.subscriptionPlan = :plan', { plan: options.plan });
    }

    query.orderBy('org.createdAt', 'DESC');

    if (options?.limit) {
      query.take(options.limit);
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    const [organizations, total] = await query.getManyAndCount();

    return { organizations, total };
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationsRepo.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const organization = await this.organizationsRepo.findOne({
      where: { slug },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    id: string,
    updateDto: Partial<Organization>,
  ): Promise<Organization> {
    const organization = await this.findOne(id);

    // Prevent changing slug after creation (would break subdomains)
    if (updateDto.slug && updateDto.slug !== organization.slug) {
      throw new BadRequestException('Cannot change organization slug');
    }

    Object.assign(organization, updateDto);
    return this.organizationsRepo.save(organization);
  }

  async updateStatus(
    id: string,
    status: OrganizationStatus,
  ): Promise<Organization> {
    const organization = await this.findOne(id);
    organization.status = status;
    return this.organizationsRepo.save(organization);
  }

  async updatePlan(
    id: string,
    plan: SubscriptionPlan,
  ): Promise<Organization> {
    const organization = await this.findOne(id);
    organization.subscriptionPlan = plan;

    // Update limits based on plan
    switch (plan) {
      case SubscriptionPlan.FREE:
        organization.maxVehicles = 5;
        organization.maxDrivers = 10;
        organization.maxGuides = 5;
        organization.maxBookingsPerMonth = 100;
        break;
      case SubscriptionPlan.STARTER:
        organization.maxVehicles = 25;
        organization.maxDrivers = 50;
        organization.maxGuides = 20;
        organization.maxBookingsPerMonth = 1000;
        break;
      case SubscriptionPlan.PRO:
        organization.maxVehicles = 100;
        organization.maxDrivers = 999999;
        organization.maxGuides = 999999;
        organization.maxBookingsPerMonth = 999999;
        organization.apiAccessEnabled = true;
        organization.advancedAnalyticsEnabled = true;
        break;
      case SubscriptionPlan.ENTERPRISE:
        organization.maxVehicles = 999999;
        organization.maxDrivers = 999999;
        organization.maxGuides = 999999;
        organization.maxBookingsPerMonth = 999999;
        organization.apiAccessEnabled = true;
        organization.advancedAnalyticsEnabled = true;
        organization.whiteLabelEnabled = true;
        break;
    }

    return this.organizationsRepo.save(organization);
  }

  async delete(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationsRepo.softRemove(organization);
  }

  async getStats(id: string): Promise<any> {
    const organization = await this.findOne(id);

    // Get member counts by role
    const members = await this.membersRepo
      .createQueryBuilder('member')
      .select('member.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('member.organizationId = :orgId', { orgId: id })
      .andWhere('member.status = :status', { status: 'active' })
      .groupBy('member.role')
      .getRawMany();

    const memberCounts = members.reduce((acc, m) => {
      acc[m.role] = parseInt(m.count);
      return acc;
    }, {});

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        plan: organization.subscriptionPlan,
      },
      usage: {
        vehicles: {
          current: organization.currentVehicles,
          max: organization.maxVehicles,
          percentage: (organization.currentVehicles / organization.maxVehicles) * 100,
        },
        drivers: {
          current: organization.currentDrivers,
          max: organization.maxDrivers,
          percentage: (organization.currentDrivers / organization.maxDrivers) * 100,
        },
        guides: {
          current: organization.currentGuides,
          max: organization.maxGuides,
          percentage: (organization.currentGuides / organization.maxGuides) * 100,
        },
        bookings: {
          current: organization.currentMonthBookings,
          max: organization.maxBookingsPerMonth,
          percentage:
            (organization.currentMonthBookings / organization.maxBookingsPerMonth) * 100,
        },
      },
      members: memberCounts,
      trial: organization.isTrial()
        ? {
            active: true,
            endsAt: organization.trialEndsAt,
            daysRemaining: Math.ceil(
              (organization.trialEndsAt.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            ),
          }
        : null,
    };
  }

  async checkUsageLimit(
    organizationId: string,
    type: 'vehicle' | 'driver' | 'guide' | 'booking',
  ): Promise<boolean> {
    const org = await this.findOne(organizationId);

    switch (type) {
      case 'vehicle':
        return org.canAddVehicle();
      case 'driver':
        return org.canAddDriver();
      case 'guide':
        return org.canAddGuide();
      case 'booking':
        return org.canAddBooking();
      default:
        return false;
    }
  }

  async incrementUsage(
    organizationId: string,
    type: 'vehicle' | 'driver' | 'guide' | 'booking',
  ): Promise<void> {
    const org = await this.findOne(organizationId);

    switch (type) {
      case 'vehicle':
        org.currentVehicles++;
        break;
      case 'driver':
        org.currentDrivers++;
        break;
      case 'guide':
        org.currentGuides++;
        break;
      case 'booking':
        org.currentMonthBookings++;
        break;
    }

    await this.organizationsRepo.save(org);
  }

  async decrementUsage(
    organizationId: string,
    type: 'vehicle' | 'driver' | 'guide',
  ): Promise<void> {
    const org = await this.findOne(organizationId);

    switch (type) {
      case 'vehicle':
        org.currentVehicles = Math.max(0, org.currentVehicles - 1);
        break;
      case 'driver':
        org.currentDrivers = Math.max(0, org.currentDrivers - 1);
        break;
      case 'guide':
        org.currentGuides = Math.max(0, org.currentGuides - 1);
        break;
    }

    await this.organizationsRepo.save(org);
  }

  async resetMonthlyBookings(): Promise<void> {
    // Called by cron job at start of each month
    await this.organizationsRepo.update({}, { currentMonthBookings: 0 });
  }
}
