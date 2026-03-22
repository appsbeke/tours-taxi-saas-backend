import {
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationRole } from '../../entities/organization-member.entity';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body()
    body: {
      email: string;
      role: OrganizationRole;
      message?: string;
    },
    @Request() req,
  ) {
    return this.invitationsService.create({
      organizationId: req.user.organizationId,
      email: body.email,
      role: body.role,
      createdBy: req.user.id,
      message: body.message,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.invitationsService.findByOrganization(req.user.organizationId);
  }

  @Get(':token')
  async findByToken(@Param('token') token: string) {
    return this.invitationsService.findByToken(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async accept(@Param('token') token: string, @Request() req) {
    return this.invitationsService.accept(token, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id') id: string) {
    await this.invitationsService.revoke(id);
  }
}
