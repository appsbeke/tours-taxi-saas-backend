#!/bin/bash

# Entities that need organizationId field
ENTITIES=(
  "vehicle.entity.ts"
  "vehicle-type.entity.ts"
  "booking.entity.ts"
  "ride-booking.entity.ts"
  "tour-booking.entity.ts"
  "tour.entity.ts"
  "tour-schedule.entity.ts"
  "payment.entity.ts"
  "payment-method.entity.ts"
  "review.entity.ts"
  "driver-profile.entity.ts"
  "guide-profile.entity.ts"
  "customer-profile.entity.ts"
  "promo-code.entity.ts"
  "pricing-rule.entity.ts"
  "surge-rule.entity.ts"
  "payout.entity.ts"
  "commission.entity.ts"
  "notification.entity.ts"
  "support-ticket.entity.ts"
  "audit-log.entity.ts"
)

ENTITIES_DIR="/root/.openclaw/workspace/tours-taxi-platform/backend/src/entities"

for entity in "${ENTITIES[@]}"; do
  file="$ENTITIES_DIR/$entity"
  
  if [ -f "$file" ]; then
    echo "Processing $entity..."
    
    # Check if organizationId already exists
    if grep -q "organizationId" "$file"; then
      echo "  ✓ Already has organizationId, skipping..."
      continue
    fi
    
    # Add Index import if not present
    if ! grep -q "Index," "$file"; then
      sed -i "s/} from 'typeorm';/, Index } from 'typeorm';/" "$file"
    fi
    
    # Find the entity class and add @Index decorator
    # This is a simplified approach - add after @Entity decorator
    sed -i '/^@Entity(/a @Index(["organizationId"])' "$file"
    
    # Add organizationId column after id field
    sed -i '/^  @PrimaryGeneratedColumn/a \
\
  @Column({ name: "organization_id", type: "uuid", nullable: true })\
  @Index()\
  organizationId: string;' "$file"
    
    echo "  ✓ Added organizationId to $entity"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo ""
echo "✅ Organization ID fields added to entities!"
echo ""
echo "Next steps:"
echo "1. Review the changes manually"
echo "2. Generate migration: npm run migration:generate -- -n AddOrganizationId"
echo "3. Run migration: npm run migration:run"
