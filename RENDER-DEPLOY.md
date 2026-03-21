# 🚀 Deploy Tours & Taxi Backend to Render.com

## ✅ Pre-requisites Complete

✅ Code is already on GitHub: https://github.com/appsbeke/tours-taxi-backend
✅ Dockerfile configured and tested
✅ render.yaml blueprint configured
✅ All environment variables documented

## 🎯 One-Click Deployment to Render

### Option 1: Deploy via Render Dashboard (Recommended - 5 minutes)

1. **Go to Render Dashboard:**
   - Visit: https://render.com/
   - Sign in or create free account

2. **Create New PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `tours-taxi-db`
   - Database: `tours_taxi_db`
   - User: `tours_taxi_user`
   - Plan: **Free**
   - Click "Create Database"
   - **Save the Internal Database URL** (starts with `postgresql://`)

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub: `appsbeke/tours-taxi-backend`
   - Name: `tours-taxi-backend`
   - Region: **Oregon (US West)**
   - Branch: `main`
   - Runtime: **Docker**
   - Plan: **Free**

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   API_PREFIX=api
   API_VERSION=v1
   DATABASE_URL=<paste Internal Database URL from step 2>
   JWT_SECRET=tours-taxi-secret-2024-jwt-super-secure-key-change-in-prod
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=tours-taxi-refresh-secret-2024-super-secure
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

5. **Configure Health Check:**
   - Health Check Path: `/health`

6. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment

7. **Get Your Live URL:**
   - After deployment, you'll see: `https://tours-taxi-backend.onrender.com`
   - Or: `https://tours-taxi-backend-xxxx.onrender.com`

### Option 2: Deploy via Render Blueprint (Even Faster!)

Click this button:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/appsbeke/tours-taxi-backend)

This will:
- Automatically create PostgreSQL database
- Create and configure web service
- Set all environment variables
- Deploy the application

**Just click and wait!**

## 📊 After Deployment

### 1. Run Database Migrations & Seed

Once deployed, go to Render Dashboard → your service → "Shell" tab:

```bash
# Run migrations (if any)
npm run migration:run

# Seed admin user
npm run seed
```

**Default Admin Credentials:**
- **Phone:** +1234567890
- **Password:** Admin@123
- **Role:** super_admin

### 2. Test Your Deployment

```bash
# Health check
curl https://tours-taxi-backend.onrender.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-..."}
```

```bash
# API Documentation
# Visit: https://tours-taxi-backend.onrender.com/api/docs
```

```bash
# Test admin login
curl -X POST https://tours-taxi-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "Admin@123"}'

# Expected: JWT token in response
```

### 3. Update Admin Dashboard

Update the admin dashboard to point to your new backend:

```bash
cd /root/.openclaw/workspace/tours-taxi-platform/admin-dashboard

# Update .env.local
echo "NEXT_PUBLIC_API_URL=https://tours-taxi-backend.onrender.com/api/v1" > .env.local

# Redeploy to Vercel
vercel --prod
```

## 🔧 Render Free Tier Limits

- ✅ 750 hours/month free compute (enough for 24/7)
- ✅ PostgreSQL free tier: 1GB storage, 97 hours/month
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ Cold starts take ~30 seconds (first request after sleep)
- ✅ Auto-SSL (HTTPS included)
- ✅ Custom domains supported

## 📝 Important Notes

1. **Database Sleep:** Free PostgreSQL databases expire after 90 days. Upgrade to Starter plan ($7/mo) for persistent databases.

2. **Service Sleep:** Free web services sleep after 15 minutes of inactivity. First request wakes it up (~30s delay).

3. **Logs:** View logs in Render Dashboard → your service → "Logs" tab

4. **Monitoring:** View metrics in Render Dashboard → your service → "Metrics" tab

5. **Database Access:** 
   - Internal URL (from backend): Use the `DATABASE_URL` env var
   - External URL (from your machine): Get from Database → "Connect" → "External Database URL"

## 🚨 Security Checklist

- [ ] Change default admin password immediately after first login
- [ ] Generate strong JWT secrets (32+ random characters)
- [ ] Set up CORS for only your frontend domain
- [ ] Enable 2FA on Render account
- [ ] Set up monitoring/alerting
- [ ] Regular database backups (Render provides this)

## 💰 Cost Estimation

**Free Tier (Good for MVP/Testing):**
- Web Service: Free (with sleep)
- PostgreSQL: Free (90 days, 1GB)
- **Total: $0/month**

**Production (Recommended):**
- Web Service Starter: $7/month (no sleep, 512MB RAM)
- PostgreSQL Starter: $7/month (persistent, 1GB)
- **Total: $14/month**

## 🆘 Troubleshooting

### Build Fails
- Check logs in Render Dashboard
- Verify Dockerfile builds locally: `docker build -t test .`
- Ensure all dependencies in package.json

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check database is running (Dashboard → Database → Status)
- Ensure using Internal Database URL for backend connection

### Service Won't Start
- Check `/health` endpoint
- Review startup logs
- Verify PORT=3000 is set
- Check all required env vars are present

### Migrations Fail
- Ensure database is running
- Check DATABASE_URL format
- Run migrations manually via Shell

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)

## ✅ Deployment Checklist

- [ ] GitHub repo created and pushed ✅
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Web service created and deployed
- [ ] Environment variables configured
- [ ] Health check passing
- [ ] Database migrations run
- [ ] Admin user seeded
- [ ] Admin credentials tested
- [ ] Admin dashboard updated
- [ ] Admin dashboard redeployed

---

**🎉 You're Done!**

Your backend is now live at: `https://tours-taxi-backend.onrender.com`

Test it: https://tours-taxi-backend.onrender.com/health
