import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  RefreshTokenDto,
  Auth0LoginDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Auth0Request } from '../common/types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('auth0/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auth0 callback for SSO login' })
  @ApiResponse({
    status: 200,
    description: 'Auth0 login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid Auth0 token' })
  async auth0Callback(
    @Body() _auth0LoginDto: Auth0LoginDto,
  ): Promise<AuthResponseDto> {
    // Extract user info from Auth0 token (simplified version)
    // In production, you would verify this token with Auth0
    const auth0User = {
      sub: 'auth0|placeholder', // This would come from token verification
      email: 'user@example.com',
      name: 'User Name',
      picture: undefined,
      email_verified: true,
    };

    return this.authService.loginWithAuth0Provider(auth0User);
  }

  @Post('provider-login')
  @UseGuards(AuthGuard('auth0'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Auth0 provider token' })
  @ApiResponse({
    status: 200,
    description: 'Provider login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid provider token' })
  @ApiBearerAuth()
  async providerLogin(@Request() req: Auth0Request): Promise<AuthResponseDto> {
    // The Auth0Strategy will have validated the token and populated req.user
    return this.authService.loginWithAuth0Provider(req.user);
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
}
