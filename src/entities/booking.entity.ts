import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';
import { RideBooking } from './ride-booking.entity';
import { TourBooking } from './tour-booking.entity';
import { Payment } from './payment.entity';
import { BookingStatusHistory } from './booking-status-history.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_number', length: 50, unique: true })
  bookingNumber: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'booking_type', length: 20 })
  bookingType: string; // ride, tour

  @Column({ length: 20, default: 'pending' })
  status: string; // pending, confirmed, in_progress, completed, cancelled

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ name: 'promo_code', length: 50, nullable: true })
  promoCode: string;

  @Column({ name: 'payment_status', length: 20, default: 'pending' })
  paymentStatus: string; // pending, paid, refunded

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CustomerProfile)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;

  @OneToOne(() => RideBooking, (ride) => ride.booking)
  rideBooking: RideBooking;

  @OneToOne(() => TourBooking, (tour) => tour.booking)
  tourBooking: TourBooking;

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToMany(() => BookingStatusHistory, (history) => history.booking)
  statusHistory: BookingStatusHistory[];
}
