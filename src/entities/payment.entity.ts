import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'payment_method', length: 20 })
  paymentMethod: string; // card, cash, wallet

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 20 })
  status: string; // pending, processing, success, failed

  @Column({ name: 'stripe_payment_intent_id', length: 255, nullable: true })
  stripePaymentIntentId: string;

  @Column({ name: 'stripe_charge_id', length: 255, nullable: true })
  stripeChargeId: string;

  @Column({ name: 'transaction_reference', length: 255, nullable: true })
  transactionReference: string;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
