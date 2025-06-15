import { OAuthConfig } from './interfaces/config.interface';

export default (): OAuthConfig => ({
  redirectBaseUrl:
    process.env.OAUTH_REDIRECT_BASE_URL || 'http://localhost:3000/api/v1',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret:
      process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
    clientSecret:
      process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret',
  },
});
