#!/bin/bash

echo "🚀 Generating Multi-Tenant SaaS Backend Modules..."
echo ""

BASE_DIR="/root/.openclaw/workspace/tours-taxi-platform/backend"
cd $BASE_DIR

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/modules/organizations/dto
mkdir -p src/modules/invitations/dto
mkdir -p src/modules/subscriptions/dto
mkdir -p src/modules/platform-admin/dto
mkdir -p src/common/decorators
mkdir -p src/common/interceptors

echo "✅ Directories created"
echo ""

# We'll use NestJS CLI to generate modules
echo "🏗️  Generating NestJS modules..."

# Organizations module (controller only, service exists)
nest generate controller modules/organizations --no-spec --flat

# Invitations module
nest generate module modules/invitations --no-spec --flat
nest generate service modules/invitations --no-spec --flat
nest generate controller modules/invitations --no-spec --flat

# Subscriptions module
nest generate module modules/subscriptions --no-spec --flat  
nest generate service modules/subscriptions --no-spec --flat
nest generate controller modules/subscriptions --no-spec --flat

# Platform Admin module
nest generate module modules/platform-admin --no-spec --flat
nest generate service modules/platform-admin --no-spec --flat
nest generate controller modules/platform-admin --no-spec --flat

echo "✅ NestJS modules generated"
echo ""

echo "📝 Next steps:"
echo "1. Implement controller logic in generated files"
echo "2. Create DTO files for validation"
echo "3. Update app.module.ts to import new modules"
echo "4. Generate migrations"
echo ""

echo "✨ Module scaffolding complete!"
