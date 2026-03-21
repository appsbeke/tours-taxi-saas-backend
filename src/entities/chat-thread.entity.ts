import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_threads')
export class ChatThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string;

  @Column({ name: 'participant_ids', type: 'jsonb' })
  participantIds: string[];

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ChatMessage, (message) => message.thread)
  messages: ChatMessage[];
}
