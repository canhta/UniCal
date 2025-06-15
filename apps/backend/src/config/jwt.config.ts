import { JwtConfig } from './interfaces/config.interface';

export default (): JwtConfig => ({
  secret: process.env.JWT_SECRET || 'your-jwt-secret-here',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-here',
  accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
  refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
});
