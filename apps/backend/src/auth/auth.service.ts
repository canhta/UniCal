import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import { Auth0User, JwtPayload } from '../common/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user (for local auth, we'll generate a dummy auth0Id)
    const user = await this.userService.findOrCreateUserFromProvider({
      auth0Id: `local_${Date.now()}_${Math.random()}`, // Temporary solution
      email: registerDto.email,
      name: registerDto.displayName,
      emailVerified: false,
    });

    // Update with hashed password for local users
    const updatedUser = await this.userService.updateUser(user.id, {
      password: hashedPassword,
    });

    return this.generateTokens(updatedUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password || ''))) {
      return user;
    }
    return null;
  }

  generateTokens(user: User): AuthResponseDto {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION',
        '15m',
      ),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION',
        '7d',
      ),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || null,
        avatarUrl: user.avatarUrl || null,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // For Auth0 integration (simplified version)
  async loginWithAuth0Provider(auth0User: Auth0User): Promise<AuthResponseDto> {
    const user = await this.userService.findOrCreateUserFromProvider({
      auth0Id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name,
      emailVerified: auth0User.email_verified,
      avatarUrl: auth0User.picture,
    });

    return this.generateTokens(user);
  }
}
