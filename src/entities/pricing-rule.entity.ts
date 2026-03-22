import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
Index,
} from 'typeorm';

@Entity('pricing_rules')
@Index(['organizationId'])
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'vehicle_type_id', type: 'uuid', nullable: true })
  vehicleTypeId: string;

  @Column({ name: 'service_zone_id', type: 'uuid', nullable: true })
  serviceZoneId: string;

  @Column({ name: 'rule_type', length: 50 })
  ruleType: string; // time_based, distance_based, zone_based

  @Column({ type: 'jsonb' })
  conditions: Record<string, any>;

  @Column({ name: 'multiplier', type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  multiplier: number;

  @Column({ name: 'additional_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalFee: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
