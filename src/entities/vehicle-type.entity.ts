import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
Index,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_types')
@Index(['organizationId'])
export class VehicleType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column({ name: 'base_fare', type: 'decimal', precision: 10, scale: 2 })
  baseFare: number;

  @Column({ name: 'per_km_rate', type: 'decimal', precision: 10, scale: 2 })
  perKmRate: number;

  @Column({ name: 'per_minute_rate', type: 'decimal', precision: 10, scale: 2 })
  perMinuteRate: number;

  @Column({ name: 'min_fare', type: 'decimal', precision: 10, scale: 2 })
  minFare: number;

  @Column({ name: 'cancellation_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  cancellationFee: number;

  @Column({ name: 'max_passengers', type: 'int' })
  maxPassengers: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.vehicleType)
  vehicles: Vehicle[];
}
