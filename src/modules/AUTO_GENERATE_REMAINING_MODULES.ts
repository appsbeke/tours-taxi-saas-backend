/**
 * AUTO-GENERATOR FOR REMAINING SA AS BACKEND MODULES
 * 
 * This script generates all remaining modules, controllers, services, and DTOs
 * for the multi-tenant SaaS transformation.
 * 
 * Run with: npx ts-node src/modules/AUTO_GENERATE_REMAINING_MODULES.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const MODULES_DIR = __dirname;

// ==================== INVITATIONS MODULE ====================

const INVITATIONS_SERVICE = `import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from '../../entities/invitation.entity';
import { Organization } from '../../entities/organization.entity';
import { OrganizationMember, OrganizationRole, MemberStatus } from '../../entities/organization-member.entity';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepo: Repository<Invitation>,
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private membersRepo: Repository<OrganizationMember>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(createDto: {
    organizationId: string;
    email: string;
    role: OrganizationRole;
    createdBy: string;
    message?: string;
  }): Promise<Invitation> {
    // Verify organization exists
    const organization = await this.organizationsRepo.findOne({
      where: { id: createDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user already invited or member
    const existingMember = await this.membersRepo.findOne({
      where: {
        organizationId: createDto.organizationId,
      },
      relations: ['user'],
    });

    if (existingMember?.user?.email === createDto.email) {
      throw new BadRequestException('User is already a member');
    }

    const existingInvitation = await this.invitationsRepo.findOne({
      where: {
        organizationId: createDto.organizationId,
        email: createDto.email,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation && existingInvitation.isValid()) {
      throw new BadRequestException('User already has a pending invitation');
    }

    // Create invitation
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = this.invitationsRepo.create({
      organizationId: createDto.organizationId,
      email: createDto.email,
      role: createDto.role,
      token,
      expiresAt,
      createdBy: createDto.createdBy,
      message: createDto.message,
      status: InvitationStatus.PENDING,
    });

    const saved = await this.invitationsRepo.save(invitation);

    // TODO: Send invitation email
    // await this.emailService.sendInvitation(saved);

    return saved;
  }

  async findByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationsRepo.findOne({
      where: { token },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.isExpired()) {
      invitation.markAsExpired();
      await this.invitationsRepo.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async accept(token: string, userId: string): Promise<OrganizationMember> {
    const invitation = await this.findByToken(token);

    if (!invitation.canAccept()) {
      throw new BadRequestException('Invitation cannot be accepted');
    }

    // Get user
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify email matches
    if (user.email !== invitation.email) {
      throw new UnauthorizedException('Email does not match invitation');
    }

    // Check if already a member
    const existingMember = await this.membersRepo.findOne({
      where: {
        organizationId: invitation.organizationId,
        userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('Already a member of this organization');
    }

    // Create organization member
    const member = this.membersRepo.create({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      status: MemberStatus.ACTIVE,
      invitedBy: invitation.createdBy,
    });

    const savedMember = await this.membersRepo.save(member);

    // Update user's organizationId
    await this.usersRepo.update(userId, {
      organizationId: invitation.organizationId,
    });

    // Mark invitation as accepted
    invitation.markAsAccepted();
    await this.invitationsRepo.save(invitation);

    return savedMember;
  }

  async revoke(id: string): Promise<void> {
    const invitation = await this.invitationsRepo.findOne({ where: { id } });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.markAsRevoked();
    await this.invitationsRepo.save(invitation);
  }

  async findByOrganization(organizationId: string): Promise<Invitation[]> {
    return this.invitationsRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}
`;

const INVITATIONS_CONTROLLER = `import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { TenantGuard, RequireOrganization } from '../../guards/tenant.guard';
import { TenantRequest } from '../../middleware/tenant.middleware';
import { OrganizationRole } from '../../entities/organization-member.entity';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(TenantGuard)
  @RequireOrganization()
  async create(
    @Body() body: { email: string; role: OrganizationRole; message?: string },
    @Request() req: TenantRequest,
  ) {
    if (!req.isOrganizationOwner) {
      throw new Error('Only admins can invite members');
    }

    const userId = (req.user as any)?.id;

    const invitation = await this.invitationsService.create({
      organizationId: req.organizationId!,
      email: body.email,
      role: body.role,
      createdBy: userId,
      message: body.message,
    });

    return {
      status: 'success',
      data: invitation,
    };
  }

  @Get(':token')
  async findByToken(@Param('token') token: string) {
    const invitation = await this.invitationsService.findByToken(token);

    return {
      status: 'success',
      data: invitation,
    };
  }

  @Post(':token/accept')
  @HttpCode(HttpStatus.OK)
  async accept(@Param('token') token: string, @Request() req: TenantRequest) {
    const userId = (req.user as any)?.id;

    if (!userId) {
      throw new Error('User must be authenticated');
    }

    const member = await this.invitationsService.accept(token, userId);

    return {
      status: 'success',
      message: 'Invitation accepted successfully',
      data: member,
    };
  }

  @Delete(':id')
  @UseGuards(TenantGuard)
  @RequireOrganization()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id') id: string, @Request() req: TenantRequest) {
    if (!req.isOrganizationOwner) {
      throw new Error('Only admins can revoke invitations');
    }

    await this.invitationsService.revoke(id);
  }
}
`;

const INVITATIONS_MODULE = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../../entities/invitation.entity';
import { Organization } from '../../entities/organization.entity';
import { OrganizationMember } from '../../entities/organization-member.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, Organization, OrganizationMember, User]),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
`;

// ==================== PLATFORM ADMIN MODULE ====================

const PLATFORM_ADMIN_SERVICE = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationStatus } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { Booking } from '../../entities/booking.entity';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class PlatformAdminService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalOrgs = await this.organizationsRepo.count();
    const activeOrgs = await this.organizationsRepo.count({
      where: { status: OrganizationStatus.ACTIVE },
    });
    const trialOrgs = await this.organizationsRepo.count({
      where: { status: OrganizationStatus.TRIAL },
    });

    const totalUsers = await this.usersRepo.count();
    const totalBookings = await this.bookingsRepo.count();

    const totalRevenue = await this.paymentsRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: 'completed' })
      .getRawOne();

    // Get monthly recurring revenue (MRR)
    const subscriptions = await this.organizationsRepo
      .createQueryBuilder('org')
      .select('org.subscriptionPlan', 'plan')
      .addSelect('COUNT(*)', 'count')
      .where('org.status = :status', { status: OrganizationStatus.ACTIVE })
      .andWhere('org.subscriptionPlan != :free', { free: 'free' })
      .groupBy('org.subscriptionPlan')
      .getRawMany();

    const planPrices = {
      starter: 99,
      pro: 299,
    };

    const mrr = subscriptions.reduce((acc, sub) => {
      const price = planPrices[sub.plan] || 0;
      return acc + price * parseInt(sub.count);
    }, 0);

    return {
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        trial: trialOrgs,
        suspended: totalOrgs - activeOrgs - trialOrgs,
      },
      users: {
        total: totalUsers,
      },
      bookings: {
        total: totalBookings,
      },
      revenue: {
        total: parseFloat(totalRevenue?.total || '0'),
        mrr,
      },
    };
  }

  async getAllOrganizations(options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ organizations: Organization[]; total: number }> {
    const [organizations, total] = await this.organizationsRepo.findAndCount({
      relations: ['members'],
      order: { createdAt: 'DESC' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return { organizations, total };
  }

  async updateOrganizationStatus(
    id: string,
    status: OrganizationStatus,
  ): Promise<Organization> {
    const org = await this.organizationsRepo.findOne({ where: { id } });
    if (!org) {
      throw new Error('Organization not found');
    }

    org.status = status;
    return this.organizationsRepo.save(org);
  }

  async getRevenueAnalytics(): Promise<any> {
    // Get revenue by month for last 12 months
    const revenueByMonth = await this.paymentsRepo
      .createQueryBuilder('payment')
      .select('DATE_TRUNC(\\'month\\', payment.createdAt)', 'month')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
      .groupBy('DATE_TRUNC(\\'month\\', payment.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      byMonth: revenueByMonth,
    };
  }
}
`;

const PLATFORM_ADMIN_CONTROLLER = `import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { TenantGuard, AllowSuperAdmin } from '../../guards/tenant.guard';
import { TenantRequest } from '../../middleware/tenant.middleware';
import { OrganizationStatus } from '../../entities/organization.entity';

@Controller('platform')
@UseGuards(TenantGuard)
@AllowSuperAdmin()
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: TenantRequest) {
    if (!req.isSuperAdmin) {
      throw new Error('Super admin access required');
    }

    const stats = await this.platformAdminService.getDashboardStats();

    return {
      status: 'success',
      data: stats,
    };
  }

  @Get('organizations')
  async getOrganizations(@Request() req: TenantRequest) {
    if (!req.isSuperAdmin) {
      throw new Error('Super admin access required');
    }

    const result = await this.platformAdminService.getAllOrganizations();

    return {
      status: 'success',
      data: result.organizations,
      meta: {
        total: result.total,
      },
    };
  }

  @Patch('organizations/:id/status')
  async updateOrganizationStatus(
    @Param('id') id: string,
    @Body() body: { status: OrganizationStatus },
    @Request() req: TenantRequest,
  ) {
    if (!req.isSuperAdmin) {
      throw new Error('Super admin access required');
    }

    const organization = await this.platformAdminService.updateOrganizationStatus(
      id,
      body.status,
    );

    return {
      status: 'success',
      data: organization,
    };
  }

  @Get('revenue')
  async getRevenue(@Request() req: TenantRequest) {
    if (!req.isSuperAdmin) {
      throw new Error('Super admin access required');
    }

    const analytics = await this.platformAdminService.getRevenueAnalytics();

    return {
      status: 'success',
      data: analytics,
    };
  }
}
`;

const PLATFORM_ADMIN_MODULE = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { Booking } from '../../entities/booking.entity';
import { Payment } from '../../entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Booking, Payment])],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
  exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
`;

// ==================== FILE WRITER ====================

function writeModuleFiles() {
  console.log('🚀 Generating SaaS backend modules...\n');

  const files = [
    {
      path: 'invitations/invitations.service.ts',
      content: INVITATIONS_SERVICE,
    },
    {
      path: 'invitations/invitations.controller.ts',
      content: INVITATIONS_CONTROLLER,
    },
    {
      path: 'invitations/invitations.module.ts',
      content: INVITATIONS_MODULE,
    },
    {
      path: 'platform-admin/platform-admin.service.ts',
      content: PLATFORM_ADMIN_SERVICE,
    },
    {
      path: 'platform-admin/platform-admin.controller.ts',
      content: PLATFORM_ADMIN_CONTROLLER,
    },
    {
      path: 'platform-admin/platform-admin.module.ts',
      content: PLATFORM_ADMIN_MODULE,
    },
  ];

  files.forEach((file) => {
    const fullPath = path.join(MODULES_DIR, file.path);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file.content, 'utf-8');
    console.log(\`✅ Created: \${file.path}\`);
  });

  console.log(\`\n✨ All modules generated successfully!\`);
  console.log(\`\nNext steps:\`);
  console.log(\`1. Update src/app.module.ts to import new modules\`);
  console.log(\`2. Install dependencies: npm install uuid @types/uuid\`);
  console.log(\`3. Run: npm run build\`);
  console.log(\`4. Generate migration: npm run migration:generate -- -n AddMultiTenancy\`);
}

writeModuleFiles();
