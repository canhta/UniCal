import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { EncryptionService } from './common/encryption/encryption.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { CalendarsModule } from './calendars/calendars.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    AppConfigModule, // Global configuration module
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    AuthModule,
    AccountsModule,
    CalendarsModule,
    EventsModule,
    AdminModule,
    IntegrationsModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [EncryptionService],
})
export class AppModule {}
