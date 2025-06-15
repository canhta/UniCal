import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class CreateClientUserDto {
  @ApiProperty({
    description: 'Full name of the client user',
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    description: 'Email address of the client user',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the client user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Initial password for the client user',
    example: 'TempPassword123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  initialPassword?: string;
}

export class UpdateClientUserDto {
  @ApiPropertyOptional({
    description: 'Full name of the client user',
    example: 'Jane Smith',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the client user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Status of the client user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class ClientUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ClientUserDetailResponseDto extends ClientUserResponseDto {
  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true })
  timeZone: string | null;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty({
    description: 'Subscription information',
    required: false,
  })
  subscription?: {
    id: string;
    planName: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    renewalDate?: Date;
  };
}
