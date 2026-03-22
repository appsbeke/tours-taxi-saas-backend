import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  FLEET_MANAGER = 'fleet_manager',
  DRIVER = 'driver',
  GUIDE = 'guide',
  CUSTOMER = 'customer',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('organization_members')
@Unique(['organizationId', 'userId'])
@Index(['organizationId', 'status'])
@Index(['userId', 'role'])
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.CUSTOMER,
  })
  role: OrganizationRole;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.ACTIVE,
  })
  status: MemberStatus;

  @Column({ name: 'invited_by', type: 'uuid', nullable: true })
  invitedBy: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any>;

  // Relations
  @ManyToOne(() => Organization, (org) => org.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  inviter: User;

  // Helper methods
  isActive(): boolean {
    return this.status === MemberStatus.ACTIVE;
  }

  isOwner(): boolean {
    return this.role === OrganizationRole.OWNER;
  }

  isAdmin(): boolean {
    return (
      this.role === OrganizationRole.OWNER ||
      this.role === OrganizationRole.ADMIN
    );
  }

  canManageTeam(): boolean {
    return (
      this.role === OrganizationRole.OWNER ||
      this.role === OrganizationRole.ADMIN ||
      this.role === OrganizationRole.FLEET_MANAGER
    );
  }

  canManageVehicles(): boolean {
    return (
      this.role === OrganizationRole.OWNER ||
      this.role === OrganizationRole.ADMIN ||
      this.role === OrganizationRole.FLEET_MANAGER
    );
  }

  canViewReports(): boolean {
    return (
      this.role === OrganizationRole.OWNER ||
      this.role === OrganizationRole.ADMIN ||
      this.role === OrganizationRole.FLEET_MANAGER
    );
  }
}
