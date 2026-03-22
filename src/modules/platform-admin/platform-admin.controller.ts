import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationStatus } from '../../entities/organization.entity';
import { SubscriptionTier } from '../subscriptions/subscription-plans.config';

// Simple guard to check if user is super admin
// In production, implement proper role-based access control
@Controller('platform')
@UseGuards(JwtAuthGuard)
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  private checkSuperAdmin(req: any) {
    // TODO: Implement proper super admin check
    // For now, check if user has a special role or email
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }
  }

  @Get('dashboard/stats')
  async getDashboardStats(@Request() req) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.getDashboardStats();
  }

  @Get('organizations')
  async getAllOrganizations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: OrganizationStatus,
    @Query('tier') tier?: SubscriptionTier,
    @Request() req?,
  ) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.getAllOrganizations({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      status,
      tier,
    });
  }

  @Get('organizations/:id')
  async getOrganizationDetails(@Param('id') id: string, @Request() req) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.getOrganizationDetails(id);
  }

  @Patch('organizations/:id/status')
  async updateOrganizationStatus(
    @Param('id') id: string,
    @Body() body: { status: OrganizationStatus; reason?: string },
    @Request() req,
  ) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.updateOrganizationStatus(
      id,
      body.status,
      body.reason,
    );
  }

  @Post('organizations/:id/upgrade-plan')
  async upgradeOrganizationPlan(
    @Param('id') id: string,
    @Body() body: { tier: SubscriptionTier },
    @Request() req,
  ) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.upgradeOrganizationPlan(id, body.tier);
  }

  @Get('revenue')
  async getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?,
  ) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.getRevenueAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Request() req?,
  ) {
    this.checkSuperAdmin(req);
    return this.platformAdminService.getAllUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
  }
}
