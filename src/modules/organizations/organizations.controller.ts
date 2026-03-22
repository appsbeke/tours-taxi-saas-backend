import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { TenantGuard, RequireOrganization, AllowSuperAdmin } from '../../guards/tenant.guard';
import { TenantRequest } from '../../middleware/tenant.middleware';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateOrganizationDto,
    @Request() req: TenantRequest,
  ) {
    // Get user ID from JWT token (assume auth middleware populated req.user)
    const userId = (req.user as any)?.id;

    if (!userId) {
      throw new Error('User must be authenticated to create an organization');
    }

    const organization = await this.organizationsService.create({
      ...createDto,
      ownerId: userId,
    });

    return {
      status: 'success',
      data: organization,
    };
  }

  @Get()
  @UseGuards(TenantGuard)
  @AllowSuperAdmin()
  async findAll(@Request() req: TenantRequest) {
    // Only super admins can list all organizations
    if (!req.isSuperAdmin) {
      throw new Error('Insufficient permissions');
    }

    const result = await this.organizationsService.findAll();

    return {
      status: 'success',
      data: result.organizations,
      meta: {
        total: result.total,
      },
    };
  }

  @Get(':id')
  @UseGuards(TenantGuard)
  @RequireOrganization()
  async findOne(@Param('id') id: string, @Request() req: TenantRequest) {
    // Users can only view their own organization unless super admin
    if (!req.isSuperAdmin && id !== req.organizationId) {
      throw new Error('Access denied');
    }

    const organization = await this.organizationsService.findOne(id);

    return {
      status: 'success',
      data: organization,
    };
  }

  @Get(':id/stats')
  @UseGuards(TenantGuard)
  @RequireOrganization()
  async getStats(@Param('id') id: string, @Request() req: TenantRequest) {
    if (!req.isSuperAdmin && id !== req.organizationId) {
      throw new Error('Access denied');
    }

    const stats = await this.organizationsService.getStats(id);

    return {
      status: 'success',
      data: stats,
    };
  }

  @Patch(':id')
  @UseGuards(TenantGuard)
  @RequireOrganization()
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateOrganizationDto>,
    @Request() req: TenantRequest,
  ) {
    // Only org admins or super admin can update
    if (!req.isSuperAdmin && !req.isOrganizationOwner) {
      throw new Error('Insufficient permissions');
    }

    if (!req.isSuperAdmin && id !== req.organizationId) {
      throw new Error('Access denied');
    }

    const organization = await this.organizationsService.update(id, updateDto);

    return {
      status: 'success',
      data: organization,
    };
  }

  @Delete(':id')
  @UseGuards(TenantGuard)
  @RequireOrganization()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: TenantRequest) {
    // Only owner or super admin can delete
    if (!req.isSuperAdmin && !req.isOrganizationOwner) {
      throw new Error('Insufficient permissions');
    }

    if (!req.isSuperAdmin && id !== req.organizationId) {
      throw new Error('Access denied');
    }

    await this.organizationsService.delete(id);

    return;
  }
}
