import { DatabaseConfig } from './interfaces/config.interface';

export default (): DatabaseConfig => ({
  url:
    process.env.DATABASE_URL ||
    'postgresql://unical_user:unical_password@localhost:5432/unical_db?schema=public',
});
