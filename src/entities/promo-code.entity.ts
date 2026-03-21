import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PromoRedemption } from './promo-redemption.entity';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'discount_type', length: 20 })
  discountType: string; // percentage, fixed

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'max_discount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount: number;

  @Column({ name: 'min_booking_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minBookingAmount: number;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit: number;

  @Column({ name: 'usage_per_user', type: 'int', default: 1 })
  usagePerUser: number;

  @Column({ name: 'times_used', type: 'int', default: 0 })
  timesUsed: number;

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamp' })
  validUntil: Date;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PromoRedemption, (redemption) => redemption.promoCode)
  redemptions: PromoRedemption[];
}
