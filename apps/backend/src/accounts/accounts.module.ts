import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { OAuthService } from '../common/oauth/oauth.service';
import { GoogleCalendarService } from '../calendars/services/google-calendar.service';
import { MicrosoftCalendarService } from '../calendars/services/microsoft-calendar.service';

@Module({
  imports: [ConfigModule],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    PrismaService,
    EncryptionService,
    OAuthService,
    GoogleCalendarService,
    MicrosoftCalendarService,
  ],
  exports: [AccountsService],
})
export class AccountsModule {}
