import { SecurityConfig } from './interfaces/config.interface';

export default (): SecurityConfig => ({
  tokenEncryptionKey:
    process.env.TOKEN_ENCRYPTION_KEY || 'your-32-byte-hex-encryption-key',
});
