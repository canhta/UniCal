import { RedisConfig } from './interfaces/config.interface';

export default (): RedisConfig => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
});
