import * as fs from 'fs';
import * as path from 'path';

const ENTITIES_DIR = path.join(__dirname, '../src/entities');

// Entities that need organizationId
const entitiesToUpdate = [
  'booking.entity.ts',
  'ride-booking.entity.ts',
  'tour-booking.entity.ts',
  'tour.entity.ts',
  'tour-schedule.entity.ts',
  'tour-category.entity.ts',
  'payment.entity.ts',
  'payment-method.entity.ts',
  'review.entity.ts',
  'driver-profile.entity.ts',
  'guide-profile.entity.ts',
  'customer-profile.entity.ts',
  'promo-code.entity.ts',
  'pricing-rule.entity.ts',
  'surge-rule.entity.ts',
  'payout.entity.ts',
  'commission.entity.ts',
  'notification.entity.ts',
  'support-ticket.entity.ts',
  'audit-log.entity.ts',
  'vehicle-type.entity.ts',
];

function updateEntity(filename: string): void {
  const filepath = path.join(ENTITIES_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf-8');

  // Check if already updated
  if (content.includes('organizationId')) {
    console.log(`✓ ${filename} - Already has organizationId`);
    return;
  }

  // Add Index to imports if not present
  if (!content.includes('Index')) {
    content = content.replace(
      /} from 'typeorm';/,
      "Index,\n} from 'typeorm';"
    );
  }

  // Find the @Entity decorator and add @Index after it
  const entityMatch = content.match(/(@Entity\([^)]*\))/);
  if (entityMatch) {
    const entityDecorator = entityMatch[0];
    content = content.replace(
      entityDecorator,
      `${entityDecorator}\n@Index(['organizationId'])`
    );
  }

  // Find the first @PrimaryGeneratedColumn and add organizationId after id
  const idMatch = content.match(
    /(@PrimaryGeneratedColumn[^)]*\)[\s\S]*?id:\s*string;)/
  );
  if (idMatch) {
    const idField = idMatch[0];
    const organizationIdField = `\n\n  @Column({ name: 'organization_id', type: 'uuid', nullable: true })\n  @Index()\n  organizationId: string;`;
    content = content.replace(idField, idField + organizationIdField);
  }

  // Write back
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`✅ ${filename} - Updated successfully`);
}

console.log('🚀 Starting multi-tenant entity updates...\n');

entitiesToUpdate.forEach(updateEntity);

console.log('\n✨ All entities updated!');
console.log('\nNext steps:');
console.log('1. Review changes in src/entities/');
console.log('2. Run: npm run build');
console.log(
  '3. Generate migration: npm run migration:generate -- -n AddMultiTenancy'
);
console.log('4. Run migration: npm run migration:run');
