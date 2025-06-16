import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsController } from './integrations.controller';
import { OAuthCallbackController } from './oauth-callback.controller';
import { OAuthUrlService } from './services/oauth-url.service';
import { OAuthCallbackService } from './services/oauth-callback.service';
import { CalendarsModule } from '../calendars/calendars.module';
import { AccountsModule } from '../accounts/accounts.module';
import { SyncModule } from '../sync/sync.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => CalendarsModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => SyncModule),
  ],
  controllers: [IntegrationsController, OAuthCallbackController],
  providers: [OAuthUrlService, OAuthCallbackService],
  exports: [OAuthUrlService, OAuthCallbackService],
})
export class IntegrationsModule {}
