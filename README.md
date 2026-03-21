# Tours & Taxi Booking Platform - Backend

A comprehensive NestJS backend for a multi-service booking platform supporting taxi rides and tour bookings.

## 🚀 Quick Deploy

### Deploy to Render.com (Free Tier Available)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/appsbeke/tours-taxi-backend)

**See [RENDER-DEPLOY.md](./RENDER-DEPLOY.md) for detailed deployment instructions.**

## 🏗️ Architecture

### Tech Stack
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT with refresh tokens
- **Real-time:** WebSockets (Socket.io)
- **API Documentation:** Swagger/OpenAPI
- **Containerization:** Docker

### Features
- 🚖 **Taxi Booking:** Real-time ride booking with driver dispatch
- 🗺️ **Tour Management:** Multi-day tours with guide assignments
- 💳 **Payment Processing:** Integrated payment gateway support
- 💬 **Real-time Chat:** Customer-Driver/Guide messaging
- 📊 **Admin Dashboard:** Complete platform management
- 🔔 **Notifications:** Push and in-app notifications
- 📈 **Analytics:** Booking analytics and reporting
- ⭐ **Review System:** Customer reviews and ratings
- 🎫 **Promo Codes:** Discount and promotional campaigns
- 👥 **Multi-role System:** Customers, Drivers, Guides, Admins

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 13+
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/appsbeke/tours-taxi-backend.git
cd tours-taxi-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=3000
API_PREFIX=api
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tours_taxi_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

### 4. Database Setup
```bash
# Create database
createdb tours_taxi_db

# Run migrations (if any)
npm run migration:run

# Seed database with admin user
npm run seed
```

### 5. Start Development Server
```bash
npm run start:dev
```

Server runs at: `http://localhost:3000`

API Documentation: `http://localhost:3000/api/docs`

## 🔐 Default Admin Credentials

After seeding the database:
- **Phone:** +1234567890
- **Password:** Admin@123
- **Role:** super_admin

**⚠️ Change these credentials immediately in production!**

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:3000/api/docs
- **OpenAPI JSON:** http://localhost:3000/api/docs-json

## 🏭 Production Deployment

### Deploy to Render (Recommended)
See [RENDER-DEPLOY.md](./RENDER-DEPLOY.md) for step-by-step guide.

### Deploy to Railway
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway deployment.

### Docker Deployment
```bash
# Build image
docker build -t tours-taxi-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  tours-taxi-backend
```

### Docker Compose
```bash
docker-compose up -d
```

## 📁 Project Structure

```
src/
├── config/              # Configuration files
├── entities/            # TypeORM entities
├── modules/
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── ride-booking/   # Taxi ride bookings
│   ├── tour/           # Tour management
│   ├── booking-core/   # Core booking logic
│   ├── payment/        # Payment processing
│   ├── chat/           # Real-time messaging
│   ├── notifications/  # Notification system
│   ├── reviews/        # Review & rating system
│   ├── admin/          # Admin operations
│   └── ...
└── scripts/            # Utility scripts
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Database Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## 🔧 Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debugging
- `npm run build` - Build for production
- `npm run migration:run` - Run database migrations
- `npm run seed` - Seed database with initial data

## 🌐 Environment-Specific Configuration

### Development
```env
NODE_ENV=development
DATABASE_SYNCHRONIZE=true  # Auto-sync schema (don't use in prod!)
LOG_LEVEL=debug
```

### Production
```env
NODE_ENV=production
DATABASE_SYNCHRONIZE=false  # Use migrations instead
LOG_LEVEL=error
```

## 🔒 Security Best Practices

1. ✅ Use strong JWT secrets (32+ random characters)
2. ✅ Enable HTTPS in production (Render provides this)
3. ✅ Set proper CORS origins
4. ✅ Use environment variables for secrets
5. ✅ Disable database synchronize in production
6. ✅ Implement rate limiting (included)
7. ✅ Regular security updates
8. ✅ Use helmet for HTTP security headers

## 📈 Performance Optimization

- Database connection pooling configured
- Query optimization with indexes
- Caching strategy for frequent queries
- WebSocket connection management
- Horizontal scaling ready

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

- **Documentation:** [RENDER-DEPLOY.md](./RENDER-DEPLOY.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** https://github.com/appsbeke/tours-taxi-backend/issues

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 🎯 Roadmap

- [ ] GraphQL API support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app push notifications
- [ ] Third-party integrations (Stripe, Twilio, etc.)
- [ ] AI-powered route optimization
- [ ] Dynamic pricing algorithms

---

**Built with ❤️ using NestJS**

🚀 **[Deploy Now](https://render.com/deploy?repo=https://github.com/appsbeke/tours-taxi-backend)** | 📖 **[Documentation](./RENDER-DEPLOY.md)** | 🐛 **[Report Bug](https://github.com/appsbeke/tours-taxi-backend/issues)**
