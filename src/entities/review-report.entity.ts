import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('review_reports')
export class ReviewReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  @Column({ name: 'reported_by', type: 'uuid' })
  reportedBy: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ length: 20, default: 'pending' })
  status: string; // pending, reviewed, dismissed, action_taken

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Review)
  @JoinColumn({ name: 'review_id' })
  review: Review;
}
