import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'notification_id', type: 'uuid', nullable: true })
  notificationId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 50 })
  channel: string; // push, email, sms

  @Column({ length: 20 })
  status: string; // sent, failed, delivered

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
