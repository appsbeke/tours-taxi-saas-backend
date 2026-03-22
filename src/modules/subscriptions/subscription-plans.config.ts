export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export interface PlanFeatures {
  subdomain: boolean;
  customDomain: boolean;
  whiteLabelEnabled: boolean;
  hidesPoweredBy: boolean;
  maxVehicles: number;
  maxDrivers: number;
  maxBookingsPerMonth: number;
  customBackendDomain?: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number | string;
  stripePriceId?: string;
  features: PlanFeatures;
  displayFeatures: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  [SubscriptionTier.FREE]: {
    id: SubscriptionTier.FREE,
    name: 'Free',
    price: 0,
    features: {
      subdomain: true,
      customDomain: false,
      whiteLabelEnabled: false,
      hidesPoweredBy: false,
      maxVehicles: 5,
      maxDrivers: 10,
      maxBookingsPerMonth: 100,
    },
    displayFeatures: [
      'Up to 5 vehicles',
      'Up to 10 drivers',
      '100 bookings/month',
      'Subdomain only',
      'Platform branding',
    ],
  },
  [SubscriptionTier.STARTER]: {
    id: SubscriptionTier.STARTER,
    name: 'Starter',
    price: 99,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    features: {
      subdomain: true,
      customDomain: true,
      whiteLabelEnabled: false,
      hidesPoweredBy: false,
      maxVehicles: 25,
      maxDrivers: 50,
      maxBookingsPerMonth: 1000,
    },
    displayFeatures: [
      'Up to 25 vehicles',
      'Up to 50 drivers',
      '1000 bookings/month',
      'Custom domain',
      'Platform branding',
    ],
  },
  [SubscriptionTier.PRO]: {
    id: SubscriptionTier.PRO,
    name: 'Pro',
    price: 299,
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    features: {
      subdomain: true,
      customDomain: true,
      whiteLabelEnabled: true,
      hidesPoweredBy: false,
      maxVehicles: 100,
      maxDrivers: -1, // unlimited
      maxBookingsPerMonth: -1, // unlimited
    },
    displayFeatures: [
      'Up to 100 vehicles',
      'Unlimited drivers',
      'Unlimited bookings',
      'Custom domain',
      'Partial white-label (logo/colors)',
      '"Powered by" footer',
    ],
  },
  [SubscriptionTier.ENTERPRISE]: {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    price: 'custom',
    features: {
      subdomain: true,
      customDomain: true,
      whiteLabelEnabled: true,
      hidesPoweredBy: true,
      maxVehicles: -1, // unlimited
      maxDrivers: -1, // unlimited
      maxBookingsPerMonth: -1, // unlimited
      customBackendDomain: true,
    },
    displayFeatures: [
      'Unlimited vehicles',
      'Unlimited drivers',
      'Unlimited bookings',
      'Custom domain',
      'Full white-label',
      'No platform branding',
      'Custom backend domain',
      'Dedicated support',
    ],
  },
};

export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[tier];
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}
