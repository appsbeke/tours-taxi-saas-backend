import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { OrganizationRole } from './organization-member.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('invitations')
@Index(['organizationId', 'status'])
@Index(['email', 'status'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.CUSTOMER,
  })
  role: OrganizationRole;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  // Relations
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  // Helper methods
  isValid(): boolean {
    return (
      this.status === InvitationStatus.PENDING && new Date() < this.expiresAt
    );
  }

  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  canAccept(): boolean {
    return this.isValid() && !this.isExpired();
  }

  markAsAccepted(): void {
    this.status = InvitationStatus.ACCEPTED;
    this.acceptedAt = new Date();
  }

  markAsExpired(): void {
    this.status = InvitationStatus.EXPIRED;
  }

  markAsRevoked(): void {
    this.status = InvitationStatus.REVOKED;
  }
}
