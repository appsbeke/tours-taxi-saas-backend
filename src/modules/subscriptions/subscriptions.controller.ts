import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionTier, getAllPlans } from './subscription-plans.config';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('plans')
  getPlans() {
    return {
      plans: getAllPlans(),
    };
  }

  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Body()
    body: {
      tier: SubscriptionTier;
      successUrl: string;
      cancelUrl: string;
    },
    @Request() req,
  ) {
    return this.subscriptionsService.createCheckoutSession({
      organizationId: req.user.organizationId,
      tier: body.tier,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPortalSession(
    @Body() body: { returnUrl: string },
    @Request() req,
  ) {
    return this.subscriptionsService.createBillingPortalSession({
      organizationId: req.user.organizationId,
      returnUrl: body.returnUrl,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCurrentSubscription(@Request() req) {
    const subscription = await this.subscriptionsService.getOrganizationSubscription(
      req.user.organizationId,
    );
    return { subscription };
  }

  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new Error('Raw body not available');
    }

    const event = this.stripeService.constructWebhookEvent(
      rawBody,
      signature,
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await this.subscriptionsService.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.subscriptionsService.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.subscriptionsService.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await this.subscriptionsService.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.subscriptionsService.handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
