import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupportTicket } from './support-ticket.entity';

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_type', length: 20 })
  senderType: string; // user, admin

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  attachments: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages)
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;
}
