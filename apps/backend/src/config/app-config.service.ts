import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServerConfig,
  DatabaseConfig,
  RedisConfig,
  JwtConfig,
  SecurityConfig,
  OAuthConfig,
} from './interfaces/config.interface';
import {
  SERVER_CONFIG,
  DATABASE_CONFIG,
  REDIS_CONFIG,
  JWT_CONFIG,
  SECURITY_CONFIG,
  OAUTH_CONFIG,
} from './index';

/**
 * Type-safe configuration service with proper typing and validation
 *
 * Usage:
 * @example
 * constructor(private appConfig: AppConfigService) {}
 *
 * const port = this.appConfig.server.port;
 * const dbUrl = this.appConfig.database.url;
 */
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get server(): ServerConfig {
    return this.configService.get<ServerConfig>(SERVER_CONFIG)!;
  }

  get database(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>(DATABASE_CONFIG)!;
  }

  get redis(): RedisConfig {
    return this.configService.get<RedisConfig>(REDIS_CONFIG)!;
  }

  get jwt(): JwtConfig {
    return this.configService.get<JwtConfig>(JWT_CONFIG)!;
  }

  get security(): SecurityConfig {
    return this.configService.get<SecurityConfig>(SECURITY_CONFIG)!;
  }

  get oauth(): OAuthConfig {
    return this.configService.get<OAuthConfig>(OAUTH_CONFIG)!;
  }

  /**
   * Check if we're in development mode
   */
  get isDevelopment(): boolean {
    return this.server.nodeEnv === 'development';
  }

  /**
   * Check if we're in production mode
   */
  get isProduction(): boolean {
    return this.server.nodeEnv === 'production';
  }

  /**
   * Check if we're in test mode
   */
  get isTest(): boolean {
    return this.server.nodeEnv === 'test';
  }

  /**
   * Get a specific config value with fallback
   */
  getConfig<T = any>(key: string, defaultValue?: T): T | undefined {
    return this.configService.get(key) ?? defaultValue;
  }

  /**
   * Validate required environment variables
   */
  validateConfig(): void {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'TOKEN_ENCRYPTION_KEY',
      'DATABASE_URL',
    ];

    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }

    // Validate JWT secrets are not default values
    if (this.jwt.secret === 'your-jwt-secret-here') {
      throw new Error('JWT_SECRET must be set to a secure value');
    }

    if (this.jwt.refreshSecret === 'your-jwt-refresh-secret-here') {
      throw new Error('JWT_REFRESH_SECRET must be set to a secure value');
    }

    if (
      this.security.tokenEncryptionKey === 'your-32-byte-hex-encryption-key'
    ) {
      throw new Error('TOKEN_ENCRYPTION_KEY must be set to a secure value');
    }

    // Validate OAuth credentials in production
    if (this.isProduction) {
      if (this.oauth.google.clientId === 'your-google-client-id') {
        throw new Error('GOOGLE_CLIENT_ID must be set in production');
      }
      if (this.oauth.microsoft.clientId === 'your-microsoft-client-id') {
        throw new Error('MICROSOFT_CLIENT_ID must be set in production');
      }
    }
  }
}
