import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ length: 20 })
  type: string; // card, cash, wallet

  @Column({ name: 'card_last4', length: 4, nullable: true })
  cardLast4: string;

  @Column({ name: 'card_brand', length: 20, nullable: true })
  cardBrand: string;

  @Column({ name: 'stripe_payment_method_id', length: 255, nullable: true })
  stripePaymentMethodId: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CustomerProfile)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;
}
