import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SupportMessage } from './support-message.entity';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_number', length: 50, unique: true })
  ticketNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string;

  @Column({ length: 50 })
  category: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ length: 20, default: 'open' })
  status: string; // open, in_progress, resolved, closed

  @Column({ length: 20, default: 'low' })
  priority: string; // low, medium, high, urgent

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SupportMessage, (message) => message.ticket)
  messages: SupportMessage[];
}
