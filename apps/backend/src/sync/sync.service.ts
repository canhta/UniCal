import { Injectable, Logger } from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import { GoogleCalendarSyncService } from '../calendars/google-calendar-sync.service';

export interface SyncTriggerResult {
  accountId: string;
  success: boolean;
  message: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private accountsService: AccountsService,
    private googleCalendarSyncService: GoogleCalendarSyncService,
  ) {}

  /**
   * Trigger initial sync after OAuth connection
   */
  async triggerInitialSync(
    userId: string,
    accountId: string,
  ): Promise<SyncTriggerResult> {
    this.logger.log(`Triggering initial sync for account ${accountId}`);

    try {
      const account = await this.accountsService.getConnectedAccountById(
        userId,
        accountId,
      );

      if (account.provider === 'google') {
        const syncResults =
          await this.googleCalendarSyncService.syncAccountCalendars(
            userId,
            accountId,
          );

        this.logger.log(
          `Initial sync completed for account ${accountId}: ${syncResults.length} calendars processed`,
        );

        return {
          accountId,
          success: true,
          message: `Initial sync completed: ${syncResults.length} calendars processed`,
        };
      } else {
        throw new Error(
          `Provider ${account.provider} not yet supported for sync`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Initial sync failed for account ${accountId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return {
        accountId,
        success: false,
        message: `Initial sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Trigger manual sync for existing account
   */
  async triggerManualSync(
    userId: string,
    accountId: string,
  ): Promise<SyncTriggerResult> {
    this.logger.log(`Triggering manual sync for account ${accountId}`);

    try {
      const account = await this.accountsService.getConnectedAccountById(
        userId,
        accountId,
      );

      if (account.provider === 'google') {
        const syncResults =
          await this.googleCalendarSyncService.syncAccountCalendars(
            userId,
            accountId,
          );

        this.logger.log(
          `Manual sync completed for account ${accountId}: ${syncResults.length} calendars processed`,
        );

        return {
          accountId,
          success: true,
          message: `Manual sync completed: ${syncResults.length} calendars processed`,
        };
      } else {
        throw new Error(
          `Provider ${account.provider} not yet supported for sync`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Manual sync failed for account ${accountId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return {
        accountId,
        success: false,
        message: `Manual sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
