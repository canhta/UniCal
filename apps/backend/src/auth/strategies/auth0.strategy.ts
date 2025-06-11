import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

export interface Auth0Payload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(private configService: ConfigService) {
    const auth0Domain = configService.get<string>('AUTH0_DOMAIN');
    const auth0Audience = configService.get<string>('AUTH0_AUDIENCE');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${auth0Domain}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: auth0Audience,
      issuer: auth0Domain,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: Auth0Payload): Promise<Auth0Payload> {
    // Additional validation can be added here
    // For now, we just return the validated payload
    return payload;
  }
}
