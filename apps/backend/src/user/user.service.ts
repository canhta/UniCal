import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  ChangePasswordDto,
} from '@unical/core';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUserFromProvider(userData: CreateUserDto): Promise<User> {
    // First try to find user by email
    let user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (user) {
      // Update user info if it changed from provider
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: userData.email,
          displayName: userData.name,
          avatarUrl: userData.avatarUrl,
          emailVerified: userData.emailVerified,
        },
      });
      return user;
    }

    // Create new user
    return this.prisma.user.create({
      data: {
        email: userData.email,
        displayName: userData.name,
        avatarUrl: userData.avatarUrl,
        emailVerified: userData.emailVerified || false,
        // password will be set separately if needed
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);
    if (!user || !user.password) {
      throw new Error('User not found or password not set');
    }
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Old password is incorrect');
    }
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.updateUser(userId, { password: hashed });
  }

  // Convert User entity to response DTO
  toResponseDto(user: User): UserResponseDto {
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
