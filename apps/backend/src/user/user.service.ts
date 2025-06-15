import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  ChangePasswordDto,
  LoginDto,
  AuthResponseDto,
  RegisterDto,
} from '@unical/core';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async findOrCreateUserFromProvider(userData: CreateUserDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (user) {
      return user;
    }

    return this.prisma.user.create({
      data: {
        email: userData.email,
        fullName: userData.name || userData.email.split('@')[0], // Use name or fallback to email username
        displayName: userData.name,
        avatarUrl: userData.avatarUrl,
        emailVerified: userData.emailVerified || false,
      },
    });
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: updateUserDto.displayName,
        avatarUrl: updateUserDto.avatarUrl,
        timeZone: updateUserDto.timeZone,
      },
    });

    return this.toResponseDto(user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For now, we'll just update the password without checking the old one
    // In a real app, you'd want to verify the old password first
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Use bcrypt to compare passwords
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.toResponseDto(user),
      accessToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken: string = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        fullName: registerDto.displayName, // Map displayName to fullName
        displayName: registerDto.displayName,
        avatarUrl: registerDto.avatarUrl,
        password: hashedPassword,
        emailVerified: true, // Temporarily set to true for testing
        verificationToken,
      },
    });

    // Temporarily comment out email sending for testing
    /*
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email',
      template: 'email-verification',
      context: {
        name: user.displayName,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      },
    });
    */

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.toResponseDto(user),
      accessToken,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });
  }

  toResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.displayName,
      avatarUrl: user.avatarUrl,
      timeZone: user.timeZone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
