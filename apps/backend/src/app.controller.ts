import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health status endpoint' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  async getHealth() {
    // Check database connection
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (_error) {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'UniCal Backend',
      version: '1.0.0',
      database: {
        status: dbStatus,
      },
      redis: {
        status: 'not_configured', // Placeholder for Redis status
      },
    };
  }
}
