#!/bin/bash
set -e

echo "🚀 Tours & Taxi Backend - Railway Deployment Script"
echo "=================================================="

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "Installing Railway CLI..."
    bash -c "$(curl -fsSL https://railway.app/install.sh)"
fi

echo ""
echo "📋 This script will:"
echo "  1. Initialize Railway project"
echo "  2. Add PostgreSQL database"
echo "  3. Set environment variables"
echo "  4. Deploy the application"
echo "  5. Run database seed"
echo ""

# Check if already in a Railway project
if [ -f "railway.json" ]; then
    echo "✅ Railway project already configured"
else
    echo "⚠️  No Railway project found"
    echo ""
    echo "Please run these commands manually:"
    echo "  1. railway login"
    echo "  2. railway init"
    echo "  3. railway add --database postgres"
    echo "  4. Then run this script again"
    exit 1
fi

# Generate secure secrets
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set API_PREFIX=api
railway variables set API_VERSION=v1
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRES_IN=15m
railway variables set REFRESH_TOKEN_SECRET="$REFRESH_SECRET"
railway variables set REFRESH_TOKEN_EXPIRES_IN=7d

echo "✅ Environment variables set"

# Deploy
echo ""
echo "🚢 Deploying to Railway..."
railway up --detach

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Run seed
echo ""
echo "🌱 Seeding database with default admin..."
railway run npm run seed || echo "⚠️  Seed failed - you may need to run this manually"

# Get domain
echo ""
echo "🌐 Getting deployment URL..."
DOMAIN=$(railway domain 2>&1 || echo "")

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "🔗 Backend URL: $DOMAIN"
echo "📚 API Docs: $DOMAIN/api/docs"
echo "💚 Health Check: $DOMAIN/health"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Phone: +1234567890"
echo "   Password: Admin@123"
echo ""
echo "⚠️  IMPORTANT: Change the admin password after first login!"
echo ""
echo "📝 To view logs: railway logs"
echo "📊 To check status: railway status"
