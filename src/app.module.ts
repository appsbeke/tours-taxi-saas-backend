import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';

// Configuration
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { GuidesModule } from './modules/guides/guides.module';

// Fleet Modules
import { DocumentsModule } from './modules/documents/documents.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

// Booking Modules
import { BookingCoreModule } from './modules/booking-core/booking-core.module';
import { RideBookingModule } from './modules/ride-booking/ride-booking.module';
import { TourModule } from './modules/tour/tour.module';
import { TourScheduleModule } from './modules/tour-schedule/tour-schedule.module';

// Operations Modules
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { PricingModule } from './modules/pricing/pricing.module';

// Financial Modules
import { PaymentModule } from './modules/payment/payment.module';
import { RefundModule } from './modules/refund/refund.module';
import { PayoutModule } from './modules/payout/payout.module';

// Communication Modules
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { SupportModule } from './modules/support/support.module';

// Admin Modules
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { AuditModule } from './modules/audit/audit.module';

// Infrastructure Modules
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

// Multi-Tenant SaaS Modules
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module';
import { DomainsModule } from './modules/domains/domains.module';

@Module({
  controllers: [AppController],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    // Core Modules
    AuthModule,
    UsersModule,
    RolesModule,
    CustomersModule,
    DriversModule,
    GuidesModule,

    // Fleet Modules
    DocumentsModule,
    VehiclesModule,

    // Booking Modules
    BookingCoreModule,
    RideBookingModule,
    TourModule,
    TourScheduleModule,

    // Operations Modules
    DispatchModule,
    PricingModule,

    // Financial Modules
    PaymentModule,
    RefundModule,
    PayoutModule,

    // Communication Modules
    ReviewsModule,
    NotificationsModule,
    ChatModule,
    SupportModule,

    // Admin Modules
    ReportsModule,
    AdminModule,
    AppConfigModule,
    AuditModule,

    // Infrastructure Modules
    FileUploadModule,
    WebsocketModule,

    // Multi-Tenant SaaS Modules
    OrganizationsModule,
    InvitationsModule,
    SubscriptionsModule,
    PlatformAdminModule,
    DomainsModule,
  ],
})
export class AppModule {}
