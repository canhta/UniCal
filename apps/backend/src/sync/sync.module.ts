import { Module, forwardRef } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AccountsModule } from '../accounts/accounts.module';
import { CalendarsModule } from '../calendars/calendars.module';

@Module({
  imports: [
    forwardRef(() => AccountsModule),
    forwardRef(() => CalendarsModule),
  ],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
