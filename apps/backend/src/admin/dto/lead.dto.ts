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
import { LeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Full name of the lead',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    description: 'Email address of the lead',
    example: 'john.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the lead',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Company name of the lead',
    example: 'ABC Corp',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Source of the lead',
    example: 'Website Contact Form',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Notes about the lead',
    example: 'Interested in premium features',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID of the user this lead is assigned to',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({
    description: 'Full name of the lead',
    example: 'John Smith',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Email address of the lead',
    example: 'john.smith@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the lead',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Company name of the lead',
    example: 'ABC Corp',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Source of the lead',
    example: 'Website Contact Form',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Status of the lead',
    enum: LeadStatus,
    example: LeadStatus.CONTACTED,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Notes about the lead',
    example: 'Interested in premium features',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'ID of the user this lead is assigned to',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class LeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  companyName: string | null;

  @ApiProperty({ nullable: true })
  source: string | null;

  @ApiProperty({ enum: LeadStatus })
  status: LeadStatus;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ nullable: true })
  assignedToId: string | null;

  @ApiProperty({ nullable: true })
  assignedToName: string | null;

  @ApiProperty({ nullable: true })
  convertedToUserId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ConvertLeadDto {
  @ApiPropertyOptional({
    description: 'Initial password for the converted user',
    example: 'TempPassword123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  initialPassword?: string;

  @ApiPropertyOptional({
    description: 'Roles to assign to the converted user',
    example: ['Client'],
  })
  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
}
