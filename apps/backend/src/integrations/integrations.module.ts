import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsController } from './integrations.controller';
import { OAuthUrlService } from './services/oauth-url.service';
import { OAuthCallbackService } from './services/oauth-callback.service';
import { CalendarsModule } from '../calendars/calendars.module';
import { AccountsModule } from '../accounts/accounts.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => CalendarsModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => SyncModule),
  ],
  controllers: [IntegrationsController],
  providers: [OAuthUrlService, OAuthCallbackService],
  exports: [OAuthUrlService, OAuthCallbackService],
})
export class IntegrationsModule {}
