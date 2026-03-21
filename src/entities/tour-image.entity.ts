import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_images')
export class TourImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tour_id', type: 'uuid' })
  tourId: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Tour, (tour) => tour.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;
}
