import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';

@Entity('driver_profiles')
export class DriverProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ name: 'license_number', length: 100 })
  licenseNumber: string;

  @Column({ name: 'license_expiry', type: 'date' })
  licenseExpiry: Date;

  @Column({ name: 'approval_status', length: 20, default: 'pending' })
  approvalStatus: string; // pending, approved, rejected

  @Column({ name: 'online_status', default: false })
  onlineStatus: boolean;

  @Column({ name: 'current_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  currentLatitude: number;

  @Column({ name: 'current_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  currentLongitude: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'total_trips', type: 'int', default: 0 })
  totalTrips: number;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  bankDetails: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.driverProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.driver)
  vehicles: Vehicle[];
}
