import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DriverProfile } from './driver-profile.entity';
import { VehicleType } from './vehicle-type.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_id', type: 'uuid' })
  driverId: string;

  @Column({ name: 'vehicle_type_id', type: 'uuid' })
  vehicleTypeId: string;

  @Column({ length: 100 })
  make: string;

  @Column({ length: 100 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ name: 'license_plate', length: 20, unique: true })
  licensePlate: string;

  @Column({ name: 'registration_number', length: 100 })
  registrationNumber: string;

  @Column({ name: 'registration_expiry', type: 'date' })
  registrationExpiry: Date;

  @Column({ name: 'insurance_number', length: 100 })
  insuranceNumber: string;

  @Column({ name: 'insurance_expiry', type: 'date' })
  insuranceExpiry: Date;

  @Column({ name: 'approval_status', length: 20, default: 'pending' })
  approvalStatus: string; // pending, approved, rejected

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  photos: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DriverProfile, (driver) => driver.vehicles)
  @JoinColumn({ name: 'driver_id' })
  driver: DriverProfile;

  @ManyToOne(() => VehicleType, (type) => type.vehicles)
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicleType: VehicleType;
}
