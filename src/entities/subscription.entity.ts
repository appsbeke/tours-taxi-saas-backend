import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization, SubscriptionPlan } from './organization.entity';

export enum BillingInterval {
  MONTH = 'month',
  YEAR = 'year',
}

@Entity('subscriptions')
@Index(['organizationId', 'status'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
  })
  plan: SubscriptionPlan;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'stripe_subscription_id', unique: true, nullable: true })
  @Index()
  stripeSubscriptionId: string;

  @Column({ name: 'stripe_price_id', nullable: true })
  stripePriceId: string;

  @Column({
    name: 'billing_interval',
    type: 'enum',
    enum: BillingInterval,
    default: BillingInterval.MONTH,
  })
  billingInterval: BillingInterval;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'current_period_start', type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ name: 'cancel_at', type: 'timestamp', nullable: true })
  cancelAt: Date;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt: Date;

  @Column({ name: 'trial_start', type: 'timestamp', nullable: true })
  trialStart: Date;

  @Column({ name: 'trial_end', type: 'timestamp', nullable: true })
  trialEnd: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => Organization, (org) => org.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Helper methods
  isActive(): boolean {
    return (
      this.status === 'active' &&
      (!this.cancelAt || new Date() < this.cancelAt)
    );
  }

  isTrialing(): boolean {
    return (
      this.status === 'trialing' &&
      this.trialEnd &&
      new Date() < this.trialEnd
    );
  }

  isCanceled(): boolean {
    return this.status === 'canceled';
  }

  isPastDue(): boolean {
    return this.status === 'past_due';
  }

  daysUntilRenewal(): number {
    const now = new Date();
    const diff = this.currentPeriodEnd.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isInGracePeriod(): number {
    if (!this.cancelAt) return 0;
    const now = new Date();
    const diff = this.cancelAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
