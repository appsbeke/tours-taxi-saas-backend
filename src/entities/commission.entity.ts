import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
Index,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('commissions')
@Index(['organizationId'])
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @Column({ name: 'provider_type', length: 20 })
  providerType: string; // driver, guide

  @Column({ name: 'booking_amount', type: 'decimal', precision: 10, scale: 2 })
  bookingAmount: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ name: 'provider_earnings', type: 'decimal', precision: 10, scale: 2 })
  providerEarnings: number;

  @Column({ name: 'payout_id', type: 'uuid', nullable: true })
  payoutId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
