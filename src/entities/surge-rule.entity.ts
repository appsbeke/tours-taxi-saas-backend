import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
Index,
} from 'typeorm';

@Entity('surge_rules')
@Index(['organizationId'])
export class SurgeRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'service_zone_id', type: 'uuid', nullable: true })
  serviceZoneId: string;

  @Column({ name: 'demand_threshold', type: 'int' })
  demandThreshold: number;

  @Column({ name: 'supply_threshold', type: 'int' })
  supplyThreshold: number;

  @Column({ name: 'surge_multiplier', type: 'decimal', precision: 5, scale: 2 })
  surgeMultiplier: number;

  @Column({ name: 'max_multiplier', type: 'decimal', precision: 5, scale: 2, default: 3.0 })
  maxMultiplier: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
