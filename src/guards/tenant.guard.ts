import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantRequest } from '../middleware/tenant.middleware';

export const REQUIRE_ORGANIZATION = 'requireOrganization';
export const ALLOW_SUPER_ADMIN = 'allowSuperAdmin';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireOrganization = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_ORGANIZATION,
      [context.getHandler(), context.getClass()],
    );

    const allowSuperAdmin = this.reflector.getAllAndOverride<boolean>(
      ALLOW_SUPER_ADMIN,
      [context.getHandler(), context.getClass()],
    );

    // If route doesn't require organization context, allow
    if (!requireOrganization) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TenantRequest>();

    // Super admins can bypass organization requirement if allowed
    if (allowSuperAdmin && request.isSuperAdmin) {
      return true;
    }

    // Require organization context
    if (!request.organizationId) {
      throw new BadRequestException(
        'Organization context is required for this operation',
      );
    }

    // Verify user belongs to the organization
    if (request.user) {
      const user = request.user as any;

      // Super admin can access any organization
      if (user.role === 'super_admin') {
        return true;
      }

      // Regular user must belong to the organization
      if (user.organizationId !== request.organizationId) {
        throw new ForbiddenException(
          'You do not have access to this organization',
        );
      }
    }

    return true;
  }
}

// Decorators for easy use
import { SetMetadata } from '@nestjs/common';

export const RequireOrganization = () =>
  SetMetadata(REQUIRE_ORGANIZATION, true);

export const AllowSuperAdmin = () => SetMetadata(ALLOW_SUPER_ADMIN, true);
