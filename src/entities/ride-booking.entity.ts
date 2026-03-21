import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { DriverProfile } from './driver-profile.entity';
import { Vehicle } from './vehicle.entity';
import { VehicleType } from './vehicle-type.entity';
import { RideStop } from './ride-stop.entity';

@Entity('ride_bookings')
export class RideBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId: string;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string;

  @Column({ name: 'vehicle_type_id', type: 'uuid' })
  vehicleTypeId: string;

  @Column({ name: 'pickup_location', type: 'text' })
  pickupLocation: string;

  @Column({ name: 'pickup_latitude', type: 'decimal', precision: 10, scale: 7 })
  pickupLatitude: number;

  @Column({ name: 'pickup_longitude', type: 'decimal', precision: 10, scale: 7 })
  pickupLongitude: number;

  @Column({ name: 'dropoff_location', type: 'text' })
  dropoffLocation: string;

  @Column({ name: 'dropoff_latitude', type: 'decimal', precision: 10, scale: 7 })
  dropoffLatitude: number;

  @Column({ name: 'dropoff_longitude', type: 'decimal', precision: 10, scale: 7 })
  dropoffLongitude: number;

  @Column({ name: 'scheduled_pickup_time', type: 'timestamp', nullable: true })
  scheduledPickupTime: Date;

  @Column({ name: 'actual_pickup_time', type: 'timestamp', nullable: true })
  actualPickupTime: Date;

  @Column({ name: 'actual_dropoff_time', type: 'timestamp', nullable: true })
  actualDropoffTime: Date;

  @Column({ name: 'estimated_distance_km', type: 'decimal', precision: 10, scale: 2 })
  estimatedDistanceKm: number;

  @Column({ name: 'actual_distance_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDistanceKm: number;

  @Column({ name: 'estimated_duration_minutes', type: 'int' })
  estimatedDurationMinutes: number;

  @Column({ name: 'actual_duration_minutes', type: 'int', nullable: true })
  actualDurationMinutes: number;

  @Column({ name: 'passenger_count', type: 'int', default: 1 })
  passengerCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Booking, (booking) => booking.rideBooking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => DriverProfile)
  @JoinColumn({ name: 'driver_id' })
  driver: DriverProfile;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => VehicleType)
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicleType: VehicleType;

  @OneToMany(() => RideStop, (stop) => stop.rideBooking)
  stops: RideStop[];
}
