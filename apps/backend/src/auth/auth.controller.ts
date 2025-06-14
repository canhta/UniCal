import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  OAuthUserDto,
  UserResponseDto,
} from '@unical/core';
import { UserService } from '../user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user (next-auth compatible)' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password (next-auth compatible)',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthResponseDto> {
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Request() _req: any): Promise<{ message: string }> {
    // In a stateless JWT system, logout is typically handled client-side
    // However, you might want to implement token blacklisting here
    return Promise.resolve({ message: 'Logout successful' });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset (send email with token)' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const token = await this.authService.generatePasswordResetToken(dto.email);
    // In production, send email. For now, log token.
    console.log(`Password reset token for ${dto.email}: ${token}`);
    return { message: 'If your email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('token') token: string,
  ): Promise<{ message: string }> {
    await this.userService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('register-oauth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register or get OAuth user' })
  @ApiResponse({
    status: 201,
    description: 'User created or retrieved successfully',
  })
  async registerOAuth(
    @Body() oauthDto: OAuthUserDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.registerOrGetOAuthUser(oauthDto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check authentication status and get current user' })
  @ApiResponse({
    status: 200,
    description: 'User authentication status',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatus(
    @Request() req: { user: { id: string } },
  ): Promise<UserResponseDto> {
    return await this.userService.getCurrentUser(req.user.id);
  }

  @Post('exchange-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange user info for UniCal JWT tokens' })
  @ApiResponse({
    status: 200,
    description: 'Token exchange successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid user data' })
  async exchangeToken(
    @Body()
    userData: {
      email: string;
      name?: string;
      image?: string;
      provider?: string;
    },
  ): Promise<AuthResponseDto> {
    return await this.authService.exchangeForTokens(userData);
  }
}
