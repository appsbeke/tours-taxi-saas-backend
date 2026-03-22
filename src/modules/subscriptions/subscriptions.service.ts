import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { Organization } from '../../entities/organization.entity';
import { StripeService } from './stripe.service';
import { SubscriptionTier, getPlanByTier } from './subscription-plans.config';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepo: Repository<Subscription>,
    @InjectRepository(Organization)
    private organizationsRepo: Repository<Organization>,
    private stripeService: StripeService,
  ) {}

  async createCheckoutSession(params: {
    organizationId: string;
    tier: SubscriptionTier;
    successUrl: string;
    cancelUrl: string;
  }) {
    if (!this.stripeService.isConfigured()) {
      throw new BadRequestException('Payment system not configured');
    }

    const organization = await this.organizationsRepo.findOne({
      where: { id: params.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const plan = getPlanByTier(params.tier);
    if (!plan.stripePriceId) {
      throw new BadRequestException('Invalid plan for checkout');
    }

    // Create or get Stripe customer
    let stripeCustomerId = organization.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer({
        email: organization.billingEmail,
        name: organization.name,
        metadata: {
          organizationId: organization.id,
        },
      });
      stripeCustomerId = customer.id;
      await this.organizationsRepo.update(organization.id, {
        stripeCustomerId,
      });
    }

    const session = await this.stripeService.createCheckoutSession({
      customerId: stripeCustomerId,
      priceId: plan.stripePriceId,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      metadata: {
        organizationId: organization.id,
        tier: params.tier,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async createBillingPortalSession(params: {
    organizationId: string;
    returnUrl: string;
  }) {
    if (!this.stripeService.isConfigured()) {
      throw new BadRequestException('Payment system not configured');
    }

    const organization = await this.organizationsRepo.findOne({
      where: { id: params.organizationId },
    });

    if (!organization || !organization.stripeCustomerId) {
      throw new NotFoundException('No billing account found');
    }

    const session = await this.stripeService.createBillingPortalSession(
      organization.stripeCustomerId,
      params.returnUrl,
    );

    return {
      url: session.url,
    };
  }

  async handleSubscriptionCreated(stripeSubscription: any) {
    const organizationId = stripeSubscription.metadata?.organizationId;
    if (!organizationId) {
      this.logger.error('No organizationId in subscription metadata');
      return;
    }

    const organization = await this.organizationsRepo.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      this.logger.error(`Organization ${organizationId} not found`);
      return;
    }

    const tier = (stripeSubscription.metadata?.tier as SubscriptionTier) || SubscriptionTier.STARTER;
    const plan = getPlanByTier(tier);

    const subscription = this.subscriptionsRepo.create({
      organizationId,
      plan: tier as any,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0]?.price.id,
      status: 'active',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null,
    });

    await this.subscriptionsRepo.save(subscription);

    // Update organization with plan features
    await this.organizationsRepo.update(organizationId, {
      subscriptionPlan: tier as any,
      customDomain: plan.features.customDomain ? organization.customDomain : null,
      whiteLabelEnabled: plan.features.whiteLabelEnabled,
      hidesPoweredBy: plan.features.hidesPoweredBy,
    });

    this.logger.log(`Subscription created for organization ${organizationId}`);
  }

  async handleSubscriptionUpdated(stripeSubscription: any) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.error(`Subscription ${stripeSubscription.id} not found in database`);
      return;
    }

    const status = this.mapStripeStatus(stripeSubscription.status);
    
    await this.subscriptionsRepo.update(subscription.id, {
      status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    });

    this.logger.log(`Subscription ${stripeSubscription.id} updated to ${status}`);
  }

  async handleSubscriptionDeleted(stripeSubscription: any) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.error(`Subscription ${stripeSubscription.id} not found in database`);
      return;
    }

    await this.subscriptionsRepo.update(subscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    // Downgrade organization to FREE tier
    await this.organizationsRepo.update(subscription.organizationId, {
      subscriptionPlan: SubscriptionTier.FREE as any,
      customDomain: null,
      domainVerified: false,
      whiteLabelEnabled: false,
      hidesPoweredBy: false,
    });

    this.logger.log(`Subscription ${stripeSubscription.id} deleted`);
  }

  async handleInvoicePaid(invoice: any) {
    this.logger.log(`Invoice ${invoice.id} paid for subscription ${invoice.subscription}`);
    // Additional logic can be added here (e.g., send receipt email)
  }

  async handleInvoicePaymentFailed(invoice: any) {
    const subscription = await this.subscriptionsRepo.findOne({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (subscription) {
      await this.subscriptionsRepo.update(subscription.id, {
        status: 'past_due',
      });
      this.logger.warn(`Payment failed for subscription ${invoice.subscription}`);
      // TODO: Send notification to organization
    }
  }

  async getOrganizationSubscription(organizationId: string) {
    return this.subscriptionsRepo.findOne({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  private mapStripeStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      canceled: 'canceled',
      unpaid: 'past_due',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
    };

    return statusMap[stripeStatus] || 'active';
  }
}
