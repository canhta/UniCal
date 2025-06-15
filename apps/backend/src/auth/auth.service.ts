import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  UserResponseDto,
} from '@unical/core';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private passwordResetTokens = new Map<
    string,
    { userId: string; expires: number }
  >();

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

    // Create user
    const user = await this.userService.findOrCreateUserFromProvider({
      email: registerDto.email,
      name: registerDto.displayName,
      emailVerified: false,
    });

    // Update with hashed password for local users
    await this.userService.updateUser(user.id, {
      password: hashedPassword,
    });

    const userDto = await this.userService.getCurrentUser(user.id);
    return this.generateTokens(userDto);
  }

  async registerOrGetOAuthUser(oauthDto: any): Promise<AuthResponseDto> {
    // Try to find existing user first
    let user = await this.userService.findByEmail(oauthDto.email);

    if (!user) {
      // Create new OAuth user
      user = await this.userService.findOrCreateUserFromProvider({
        email: oauthDto.email,
        name: oauthDto.displayName,
        emailVerified: true, // OAuth emails are pre-verified
      });

      // Update with avatar if provided
      if (oauthDto.avatarUrl) {
        await this.userService.updateUser(user.id, {
          avatarUrl: oauthDto.avatarUrl,
        });
      }
    }

    const userDto = await this.userService.getCurrentUser(user.id);
    return this.generateTokens(userDto);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password || ''))) {
      return this.userService.toResponseDto(user);
    }
    return null;
  }

  generateTokens(user: UserResponseDto): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email };

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
        name: user.name || null,
        avatarUrl: user.avatarUrl || null,
        timeZone: user.timeZone || null,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
      const userDto = this.userService.toResponseDto(user);
      return this.generateTokens(userDto);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) return '';
    const token = crypto.randomBytes(32).toString('hex');
    // Token valid for 1 hour
    this.passwordResetTokens.set(token, {
      userId: user.id,
      expires: Date.now() + 3600_000,
    });
    return token;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const entry = this.passwordResetTokens.get(token);
    if (!entry || entry.expires < Date.now()) {
      throw new Error('Invalid or expired token');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userService.updateUser(entry.userId, { password: hashed });
    this.passwordResetTokens.delete(token);
    return { message: 'Password reset successfully' };
  }

  async exchangeForTokens(userData: {
    email: string;
    name?: string;
    image?: string;
    provider?: string;
  }): Promise<AuthResponseDto> {
    // Find or create user based on email
    let user = await this.userService.findByEmail(userData.email);

    if (!user) {
      // Create new user from OAuth data
      user = await this.userService.findOrCreateUserFromProvider({
        email: userData.email,
        name: userData.name,
        emailVerified: true, // OAuth emails are typically pre-verified
      });

      // Update with avatar if provided
      if (userData.image) {
        await this.userService.updateUser(user.id, {
          avatarUrl: userData.image,
        });
      }
    }

    const userDto = await this.userService.getCurrentUser(user.id);
    return this.generateTokens(userDto);
  }
}
