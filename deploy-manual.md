# Manual Deployment Instructions

Since automated deployment requires interactive authentication, follow these steps:

## Option 1: Railway.app (Recommended)

### 1. Install Railway CLI (if not already installed)
```bash
bash -c "$(curl -fsSL https://railway.app/install.sh)"
```

### 2. Login to Railway
```bash
railway login
```
This will open a browser for authentication.

### 3. Initialize Project
```bash
cd /root/.openclaw/workspace/tours-taxi-platform/backend
railway init
```
- Choose "Empty Project"
- Name it "tours-taxi-backend"

### 4. Add PostgreSQL
```bash
railway add -d postgres
```

### 5. Link to the service
```bash
railway link
```

### 6. Set Environment Variables
```bash
# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set API_PREFIX=api
railway variables set API_VERSION=v1
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRES_IN=15m
railway variables set REFRESH_TOKEN_SECRET="$REFRESH_SECRET"
railway variables set REFRESH_TOKEN_EXPIRES_IN=7d
```

### 7. Deploy
```bash
railway up
```

### 8. Seed Database
```bash
railway run npm run seed
```

### 9. Get Your URL
```bash
railway domain
```

## Option 2: Render.com

### 1. Create Account
Go to https://render.com and sign up

### 2. Create PostgreSQL Database
- Click "New +"
- Select "PostgreSQL"
- Name: "tours-taxi-db"
- Select Free plan
- Click "Create Database"
- Copy the "Internal Database URL"

### 3. Create Web Service
- Click "New +"
- Select "Web Service"
- Connect to your Git repository OR use "Deploy from Docker"
- Name: "tours-taxi-backend"
- Region: Oregon (Free)
- Branch: main
- Build Command: `docker build -t app .`
- Start Command: `node dist/main`

### 4. Add Environment Variables
In the Environment section:
```
NODE_ENV=production
PORT=3000
API_PREFIX=api
API_VERSION=v1
DATABASE_URL=<paste internal database URL>
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<generate with: openssl rand -base64 32>
REFRESH_TOKEN_EXPIRES_IN=7d
```

### 5. Deploy
Click "Create Web Service"

### 6. Seed Database
After deployment, go to Shell tab and run:
```bash
npm run seed
```

## Option 3: Fly.io

### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login
```bash
fly auth login
```

### 3. Launch App
```bash
cd /root/.openclaw/workspace/tours-taxi-platform/backend
fly launch --no-deploy
```

### 4. Add PostgreSQL
```bash
fly postgres create --name tours-taxi-db
fly postgres attach tours-taxi-db
```

### 5. Set Secrets
```bash
fly secrets set JWT_SECRET=$(openssl rand -base64 32)
fly secrets set REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
fly secrets set NODE_ENV=production
```

### 6. Deploy
```bash
fly deploy
```

### 7. Seed Database
```bash
fly ssh console
npm run seed
exit
```

## After Deployment - All Platforms

### Test Health Check
```bash
curl https://your-app-url/health
```

### Test API Docs
Visit: `https://your-app-url/api/docs`

### Login with Default Admin
```bash
curl -X POST https://your-app-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "Admin@123"}'
```

### Update Admin Dashboard
1. Copy your backend URL
2. Update `/root/.openclaw/workspace/tours-taxi-platform/admin-dashboard/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
   ```
3. Redeploy admin dashboard to Vercel:
   ```bash
   cd /root/.openclaw/workspace/tours-taxi-platform/admin-dashboard
   vercel --prod
   ```

## Default Credentials
- **Phone:** +1234567890
- **Password:** Admin@123
- **Role:** super_admin

⚠️ **CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**
