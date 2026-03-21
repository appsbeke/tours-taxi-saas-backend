import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { TourSchedule } from './tour-schedule.entity';

@Entity('tour_bookings')
export class TourBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId: string;

  @Column({ name: 'tour_schedule_id', type: 'uuid' })
  tourScheduleId: string;

  @Column({ name: 'participant_count', type: 'int' })
  participantCount: number;

  @Column({ name: 'participant_names', type: 'jsonb', default: [] })
  participantNames: string[];

  @Column({ name: 'checked_in', default: false })
  checkedIn: boolean;

  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Booking, (booking) => booking.tourBooking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => TourSchedule)
  @JoinColumn({ name: 'tour_schedule_id' })
  tourSchedule: TourSchedule;
}
