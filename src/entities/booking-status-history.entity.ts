import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('booking_status_history')
export class BookingStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'old_status', length: 20, nullable: true })
  oldStatus: string;

  @Column({ name: 'new_status', length: 20 })
  newStatus: string;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.statusHistory)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
