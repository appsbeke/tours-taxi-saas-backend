# Tours & Taxi Backend - Production Deployment Guide

## Prerequisites
- Railway CLI installed
- Railway account (sign up at https://railway.app)

## Quick Deploy to Railway

### Step 1: Login to Railway
```bash
railway login
```

### Step 2: Create New Project
```bash
cd /root/.openclaw/workspace/tours-taxi-platform/backend
railway init
```
Select "Create new project" and give it a name like "tours-taxi-backend"

### Step 3: Add PostgreSQL Database
```bash
railway add --database postgres
```

### Step 4: Set Environment Variables
```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set API_PREFIX=api
railway variables set API_VERSION=v1
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set JWT_EXPIRES_IN=15m
railway variables set REFRESH_TOKEN_SECRET=$REFRESH_SECRET
railway variables set REFRESH_TOKEN_EXPIRES_IN=7d
```

### Step 5: Deploy the Application
```bash
railway up
```

### Step 6: Run Database Migrations & Seed
After deployment completes, run:
```bash
# Get the database URL
railway variables

# Run migrations (if you have migrations)
railway run npm run migration:run

# Seed the database with default admin
railway run npm run seed
```

### Step 7: Get Your Live URL
```bash
railway domain
```
This will show your public Railway URL (e.g., `https://tours-taxi-backend-production.up.railway.app`)

## Default Admin Credentials
After seeding, you can login with:
- **Phone:** +1234567890
- **Password:** Admin@123
- **Role:** super_admin

## API Endpoints
- **Health Check:** `GET /health`
- **API Docs:** `GET /api/docs`
- **API Base:** `/api/v1/*`

## Testing the Deployment

### Test Health Check
```bash
curl https://your-app.railway.app/health
```

### Test API Documentation
Visit: `https://your-app.railway.app/api/docs`

### Test Admin Login
```bash
curl -X POST https://your-app.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "Admin@123"}'
```

## Environment Variables Reference

### Required
- `NODE_ENV`: production
- `PORT`: 3000
- `DATABASE_URL`: Auto-set by Railway PostgreSQL addon
- `JWT_SECRET`: Generate secure random string
- `REFRESH_TOKEN_SECRET`: Generate secure random string

### Optional (for full features)
- `GOOGLE_MAPS_API_KEY`: For location services
- `STRIPE_SECRET_KEY`: For payments
- `TWILIO_ACCOUNT_SID`: For SMS
- `SENDGRID_API_KEY`: For emails
- `S3_*`: For file uploads

## Monitoring

### View Logs
```bash
railway logs
```

### Check Status
```bash
railway status
```

### Database Access
```bash
railway connect postgres
```

## Troubleshooting

### Build Fails
- Check logs: `railway logs`
- Ensure all dependencies are in package.json
- Verify Dockerfile builds locally: `docker build -t test .`

### Database Connection Issues
- Verify DATABASE_URL is set: `railway variables`
- Check database is running: `railway status`
- Ensure synchronize is false in production

### Application Won't Start
- Check health endpoint: `/health`
- Review startup logs: `railway logs`
- Verify PORT environment variable

## Updating the Deployment

After making code changes:
```bash
git add .
git commit -m "Update backend"
railway up
```

## Alternative: Deploy to Render.com

If Railway doesn't work, use Render.com:

1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repo or use Docker
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

## Alternative: Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Add PostgreSQL
fly postgres create

# Deploy
fly deploy
```

## Security Notes

1. **Change default admin password immediately** after first login
2. Use strong JWT secrets (32+ characters random)
3. Enable CORS only for your frontend domain in production
4. Set up proper SSL/TLS (Railway provides this automatically)
5. Regularly update dependencies: `npm audit fix`

## Cost Estimate

Railway Free Tier includes:
- $5 credit per month
- Suitable for development/testing
- PostgreSQL database included

For production, expect ~$10-20/month depending on usage.
