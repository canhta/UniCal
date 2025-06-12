import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { User } from '@prisma/client';

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

    // Create new user (add required externalId field with a generated value)
    return this.prisma.user.create({
      data: {
        email: userData.email,
        displayName: userData.name,
        avatarUrl: userData.avatarUrl,
        emailVerified: userData.emailVerified || false,
        externalId: `local_${Date.now()}_${Math.random()}`,
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
