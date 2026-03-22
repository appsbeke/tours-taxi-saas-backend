import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OrganizationMember } from './organization-member.entity';
import { Subscription } from './subscription.entity';

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  INACTIVE = 'inactive',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  @Index()
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'primary_color', default: '#3b82f6' })
  primaryColor: string;

  // Domain & White-Label Configuration
  @Column({ name: 'custom_domain', nullable: true })
  customDomain: string | null;

  @Column({ name: 'domain_verified', default: false })
  domainVerified: boolean;

  @Column({ name: 'white_label_enabled', default: false })
  whiteLabelEnabled: boolean;

  @Column({ name: 'hides_powered_by', default: false })
  hidesPoweredBy: boolean;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.TRIAL,
  })
  status: OrganizationStatus;

  @Column({
    name: 'subscription_plan',
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({
    name: 'subscription_status',
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIALING,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ name: 'stripe_customer_id', nullable: true, unique: true })
  stripeCustomerId: string;

  @Column({ name: 'billing_email', nullable: true })
  billingEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  // Usage limits based on plan
  @Column({ name: 'max_vehicles', default: 5 })
  maxVehicles: number;

  @Column({ name: 'max_drivers', default: 10 })
  maxDrivers: number;

  @Column({ name: 'max_guides', default: 5 })
  maxGuides: number;

  @Column({ name: 'max_bookings_per_month', default: 100 })
  maxBookingsPerMonth: number;

  // Current usage counters
  @Column({ name: 'current_vehicles', default: 0 })
  currentVehicles: number;

  @Column({ name: 'current_drivers', default: 0 })
  currentDrivers: number;

  @Column({ name: 'current_guides', default: 0 })
  currentGuides: number;

  @Column({ name: 'current_month_bookings', default: 0 })
  currentMonthBookings: number;

  // Trial information
  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  // Contact information
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  timezone: string;

  // Feature flags
  @Column({ name: 'api_access_enabled', default: false })
  apiAccessEnabled: boolean;

  @Column({ name: 'advanced_analytics_enabled', default: false })
  advancedAnalyticsEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members: OrganizationMember[];

  @OneToMany(() => Subscription, (subscription) => subscription.organization)
  subscriptions: Subscription[];

  // Helper methods
  isActive(): boolean {
    return this.status === OrganizationStatus.ACTIVE;
  }

  isTrial(): boolean {
    return (
      this.status === OrganizationStatus.TRIAL &&
      this.trialEndsAt &&
      new Date() < this.trialEndsAt
    );
  }

  hasFeature(feature: string): boolean {
    const features = {
      free: ['basic_support', 'platform_branding'],
      starter: [
        'basic_support',
        'email_support',
        'custom_branding',
        'csv_import',
      ],
      pro: [
        'priority_support',
        'custom_branding',
        'api_access',
        'advanced_analytics',
        'csv_import',
        'webhooks',
      ],
      enterprise: [
        'dedicated_support',
        'white_label',
        'api_access',
        'advanced_analytics',
        'csv_import',
        'webhooks',
        'custom_integrations',
        'sla',
      ],
    };

    return features[this.subscriptionPlan]?.includes(feature) || false;
  }

  canAddVehicle(): boolean {
    return this.currentVehicles < this.maxVehicles;
  }

  canAddDriver(): boolean {
    return this.currentDrivers < this.maxDrivers;
  }

  canAddGuide(): boolean {
    return this.currentGuides < this.maxGuides;
  }

  canAddBooking(): boolean {
    return this.currentMonthBookings < this.maxBookingsPerMonth;
  }
}
