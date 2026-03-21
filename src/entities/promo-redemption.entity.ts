import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromoCode } from './promo-code.entity';
import { Booking } from './booking.entity';
import { CustomerProfile } from './customer-profile.entity';

@Entity('promo_redemptions')
export class PromoRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'promo_code_id', type: 'uuid' })
  promoCodeId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PromoCode, (promo) => promo.redemptions)
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode;

  @ManyToOne(() => CustomerProfile)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
