/**
 * Configuration interfaces for type-safe environment variables
 */

export interface DatabaseConfig {
  url: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  url: string;
  ttl: number;
}

export interface ServerConfig {
  port: number;
  baseUrl: string;
  nodeEnv: string;
  frontendBaseUrl: string;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export interface SecurityConfig {
  tokenEncryptionKey: string;
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
}

export interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
}

export interface OAuthConfig {
  redirectBaseUrl: string;
  google: GoogleConfig;
  microsoft: MicrosoftConfig;
}

export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  security: SecurityConfig;
  oauth: OAuthConfig;
}
