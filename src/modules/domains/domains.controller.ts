import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DomainsService } from './domains.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('domains')
@UseGuards(JwtAuthGuard)
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post('set-custom')
  @HttpCode(HttpStatus.OK)
  async setCustomDomain(
    @Body() body: { domain: string },
    @Request() req,
  ) {
    return this.domainsService.setCustomDomain(
      req.user.organizationId,
      body.domain,
    );
  }

  @Delete('remove-custom')
  @HttpCode(HttpStatus.OK)
  async removeCustomDomain(@Request() req) {
    return this.domainsService.removeCustomDomain(req.user.organizationId);
  }

  @Get('dns-records')
  async getDnsRecords(@Request() req) {
    return this.domainsService.getDnsRecords(req.user.organizationId);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyDomain(@Request() req) {
    return this.domainsService.verifyDomain(req.user.organizationId);
  }
}
