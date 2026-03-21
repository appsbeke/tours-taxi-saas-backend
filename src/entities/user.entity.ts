import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';
import { DriverProfile } from './driver-profile.entity';
import { GuideProfile } from './guide-profile.entity';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column({ unique: true, length: 255, nullable: true })
  email: string;

  @Column({ name: 'password_hash', length: 255, nullable: true })
  passwordHash: string;

  @Column({ length: 20, default: 'active' })
  status: string; // active, suspended, deleted

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'phone_verified_at', type: 'timestamp', nullable: true })
  phoneVerifiedAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relationships
  @OneToOne(() => CustomerProfile, (profile) => profile.user)
  customerProfile: CustomerProfile;

  @OneToOne(() => DriverProfile, (profile) => profile.user)
  driverProfile: DriverProfile;

  @OneToOne(() => GuideProfile, (profile) => profile.user)
  guideProfile: GuideProfile;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];
}
