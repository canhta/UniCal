import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health status endpoint' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'UniCal Backend',
      version: '1.0.0',
    };
  }
}
