import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUserFromProvider(userData: CreateUserDto): Promise<User> {
    // First try to find user by auth0Id
    let user = await this.prisma.user.findUnique({
      where: { auth0Id: userData.auth0Id },
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

    // Check if email already exists with different auth0Id
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException(
        'User with this email already exists with different auth provider',
      );
    }

    // Create new user
    return this.prisma.user.create({
      data: {
        auth0Id: userData.auth0Id,
        email: userData.email,
        displayName: userData.name,
        avatarUrl: userData.avatarUrl,
        emailVerified: userData.emailVerified || false,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { auth0Id },
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
      auth0Id: user.auth0Id,
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
