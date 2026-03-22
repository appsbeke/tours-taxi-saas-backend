import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
Index,
} from 'typeorm';
import { TourCategory } from './tour-category.entity';
import { TourImage } from './tour-image.entity';
import { TourSchedule } from './tour-schedule.entity';

@Entity('tours')
@Index(['organizationId'])
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 5, scale: 2 })
  durationHours: number;

  @Column({ name: 'price_per_person', type: 'decimal', precision: 10, scale: 2 })
  pricePerPerson: number;

  @Column({ name: 'max_participants', type: 'int' })
  maxParticipants: number;

  @Column({ name: 'min_participants', type: 'int', default: 1 })
  minParticipants: number;

  @Column({ name: 'meeting_point', type: 'text' })
  meetingPoint: string;

  @Column({ name: 'meeting_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  meetingLatitude: number;

  @Column({ name: 'meeting_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  meetingLongitude: number;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  highlights: string[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  included: string[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  excluded: string[];

  @Column({ name: 'cancellation_policy', type: 'text', nullable: true })
  cancellationPolicy: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TourCategory, (category) => category.tours)
  @JoinColumn({ name: 'category_id' })
  category: TourCategory;

  @OneToMany(() => TourImage, (image) => image.tour)
  images: TourImage[];

  @OneToMany(() => TourSchedule, (schedule) => schedule.tour)
  schedules: TourSchedule[];
}
