import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('guide_profiles')
export class GuideProfile {
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

  @Column({ name: 'certification_number', length: 100, nullable: true })
  certificationNumber: string;

  @Column({ name: 'languages', type: 'jsonb', default: [] })
  languages: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'approval_status', length: 20, default: 'pending' })
  approvalStatus: string; // pending, approved, rejected

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'total_tours', type: 'int', default: 0 })
  totalTours: number;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  bankDetails: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.guideProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
