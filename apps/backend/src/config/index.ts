import { registerAs } from '@nestjs/config';
import serverConfig from './server.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import jwtConfig from './jwt.config';
import securityConfig from './security.config';
import oauthConfig from './oauth.config';

export const SERVER_CONFIG = 'server';
export const DATABASE_CONFIG = 'database';
export const REDIS_CONFIG = 'redis';
export const JWT_CONFIG = 'jwt';
export const SECURITY_CONFIG = 'security';
export const OAUTH_CONFIG = 'oauth';

export default [
  registerAs(SERVER_CONFIG, serverConfig),
  registerAs(DATABASE_CONFIG, databaseConfig),
  registerAs(REDIS_CONFIG, redisConfig),
  registerAs(JWT_CONFIG, jwtConfig),
  registerAs(SECURITY_CONFIG, securityConfig),
  registerAs(OAUTH_CONFIG, oauthConfig),
];

// Export main configuration services and types
export { AppConfigService } from './app-config.service';
export { AppConfigModule } from './app-config.module';
export * from './interfaces/config.interface';
