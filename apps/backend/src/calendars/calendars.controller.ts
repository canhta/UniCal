import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CalendarsService } from './calendars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest, PlatformCalendarDto } from '@unical/core';
import {
  CalendarResponseDto,
  SyncCalendarDto,
  UpdateCalendarSettingsDto,
} from './dto/calendar.dto';

@ApiTags('Calendars')
@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Get('external/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List calendars from external provider account' })
  @ApiResponse({
    status: 200,
    description: 'External calendars retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          primary: { type: 'boolean' },
          accessRole: { type: 'string' },
          backgroundColor: { type: 'string' },
          foregroundColor: { type: 'string' },
          timeZone: { type: 'string' },
        },
      },
    },
  })
  @ApiBearerAuth()
  async listExternalCalendars(
    @Request() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ): Promise<PlatformCalendarDto[]> {
    return this.calendarsService.getCalendarsForAccount(req.user.id, accountId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List user calendars managed by UniCal' })
  @ApiResponse({
    status: 200,
    description: 'User calendars retrieved successfully',
    type: [CalendarResponseDto],
  })
  @ApiBearerAuth()
  async listUserCalendars(
    @Request() req: AuthenticatedRequest,
    @Query('includeHidden') includeHidden?: boolean,
  ): Promise<any[]> {
    return this.calendarsService.getUserCalendars(
      req.user.id,
      includeHidden === true,
    );
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start syncing an external calendar' })
  @ApiResponse({
    status: 201,
    description: 'Calendar sync started successfully',
  })
  @ApiBearerAuth()
  async syncCalendar(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SyncCalendarDto,
  ): Promise<any> {
    return this.calendarsService.syncCalendar(req.user.id, {
      connectedAccountId: dto.connectedAccountId,
      externalCalendarId: dto.externalCalendarId,
      name: dto.name,
      description: dto.description,
      color: dto.color,
      timeZone: dto.timeZone,
    });
  }

  @Put(':calendarId/settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update calendar display settings' })
  @ApiResponse({
    status: 200,
    description: 'Calendar settings updated successfully',
  })
  @ApiBearerAuth()
  async updateCalendarSettings(
    @Request() req: AuthenticatedRequest,
    @Param('calendarId') calendarId: string,
    @Body() dto: UpdateCalendarSettingsDto,
  ): Promise<any> {
    return this.calendarsService.updateCalendarSettings(
      req.user.id,
      calendarId,
      {
        isVisible: dto.isVisible,
        color: dto.color,
        name: dto.name,
      },
    );
  }

  @Delete(':calendarId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Stop syncing a calendar' })
  @ApiResponse({
    status: 204,
    description: 'Calendar sync stopped successfully',
  })
  @ApiBearerAuth()
  async unsyncCalendar(
    @Request() req: AuthenticatedRequest,
    @Param('calendarId') calendarId: string,
  ): Promise<void> {
    await this.calendarsService.unsyncCalendar(req.user.id, calendarId);
  }
}
