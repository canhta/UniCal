import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import configurations from './index';

/**
 * Global configuration module that provides type-safe configuration
 * throughout the application
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: configurations,
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {
  constructor(private appConfigService: AppConfigService) {
    // Validate configuration on module initialization
    if (process.env.NODE_ENV !== 'test') {
      this.appConfigService.validateConfig();
    }
  }
}
