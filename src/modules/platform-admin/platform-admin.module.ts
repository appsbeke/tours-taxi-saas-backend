import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminService } from './platform-admin.service';
import { Organization } from '../../entities/organization.entity';
import { Subscription } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { OrganizationMember } from '../../entities/organization-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      Subscription,
      User,
      OrganizationMember,
    ]),
  ],
  controllers: [PlatformAdminController],
  providers: [PlatformAdminService],
  exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
