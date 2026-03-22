import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  organizationId?: string;
  organizationSlug?: string;
  isOrganizationOwner?: boolean;
  isSuperAdmin?: boolean;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      // Extract organization context from multiple sources
      const organizationId = this.extractOrganizationId(req);
      const organizationSlug = this.extractOrganizationSlug(req);

      // Attach to request for downstream use
      if (organizationId) {
        req.organizationId = organizationId;
      }

      if (organizationSlug) {
        req.organizationSlug = organizationSlug;
      }

      // Extract user roles from JWT (assume auth middleware ran first)
      if (req.user) {
        const user = req.user as any;
        req.isOrganizationOwner = user.role === 'owner' || user.role === 'admin';
        req.isSuperAdmin = user.role === 'super_admin';
      }

      next();
    } catch (error) {
      console.error('TenantMiddleware error:', error);
      next(error);
    }
  }

  private extractOrganizationId(req: Request): string | undefined {
    // Priority 1: Query parameter (for testing/debugging)
    if (req.query.organizationId) {
      return req.query.organizationId as string;
    }

    // Priority 2: Custom header
    if (req.headers['x-organization-id']) {
      return req.headers['x-organization-id'] as string;
    }

    // Priority 3: JWT token payload (preferred for authenticated requests)
    if (req.user) {
      const user = req.user as any;
      if (user.organizationId) {
        return user.organizationId;
      }
    }

    // Priority 4: Body (for mutations)
    if (req.body?.organizationId) {
      return req.body.organizationId;
    }

    return undefined;
  }

  private extractOrganizationSlug(req: Request): string | undefined {
    // Extract from subdomain
    const host = req.hostname || req.headers.host || '';
    const parts = host.split('.');

    // If subdomain exists and it's not www, api, or platform
    if (
      parts.length > 2 &&
      !['www', 'api', 'platform', 'admin'].includes(parts[0])
    ) {
      return parts[0];
    }

    // Extract from custom header
    if (req.headers['x-organization-slug']) {
      return req.headers['x-organization-slug'] as string;
    }

    // Extract from path (e.g., /org/:slug/...)
    const pathMatch = req.path.match(/^\/org\/([^\/]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    return undefined;
  }
}
