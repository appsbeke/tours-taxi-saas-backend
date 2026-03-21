import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RideBooking } from './ride-booking.entity';

@Entity('ride_stops')
export class RideStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_booking_id', type: 'uuid' })
  rideBookingId: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ name: 'stop_duration_minutes', type: 'int', default: 5 })
  stopDurationMinutes: number;

  @Column({ name: 'reached_at', type: 'timestamp', nullable: true })
  reachedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RideBooking, (ride) => ride.stops)
  @JoinColumn({ name: 'ride_booking_id' })
  rideBooking: RideBooking;
}
