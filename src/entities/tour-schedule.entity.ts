import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './tour.entity';
import { GuideProfile } from './guide-profile.entity';

@Entity('tour_schedules')
export class TourSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tour_id', type: 'uuid' })
  tourId: string;

  @Column({ name: 'guide_id', type: 'uuid', nullable: true })
  guideId: string;

  @Column({ name: 'start_datetime', type: 'timestamp' })
  startDatetime: Date;

  @Column({ name: 'available_slots', type: 'int' })
  availableSlots: number;

  @Column({ name: 'booked_slots', type: 'int', default: 0 })
  bookedSlots: number;

  @Column({ length: 20, default: 'scheduled' })
  status: string; // scheduled, in_progress, completed, cancelled

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tour, (tour) => tour.schedules)
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  @ManyToOne(() => GuideProfile)
  @JoinColumn({ name: 'guide_id' })
  guide: GuideProfile;
}
