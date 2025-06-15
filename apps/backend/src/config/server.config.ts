import { ServerConfig } from './interfaces/config.interface';

export default (): ServerConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3030',
});
