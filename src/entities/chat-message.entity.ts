import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatThread } from './chat-thread.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'thread_id', type: 'uuid' })
  threadId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_type', length: 20, default: 'text' })
  messageType: string; // text, image, location

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'read_by', type: 'jsonb', default: [] })
  readBy: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ChatThread, (thread) => thread.messages)
  @JoinColumn({ name: 'thread_id' })
  thread: ChatThread;
}
