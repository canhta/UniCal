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
import { GoogleCalendarSyncService } from './google-calendar-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AuthenticatedRequest,
  PlatformCalendarDto,
  CalendarResponseDto,
  SyncCalendarDto,
  UpdateCalendarSettingsDto,
  CreateEventRequestDto,
  UpdateEventRequestDto,
} from '@unical/core';

@ApiTags('Calendars')
@Controller('calendars')
export class CalendarsController {
  constructor(
    private readonly calendarsService: CalendarsService,
    private readonly googleSyncService: GoogleCalendarSyncService,
  ) {}

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

  // Google Calendar Sync Endpoints

  @Post('sync/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Manually trigger sync for Google Calendar account',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync completed successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
          calendarId: { type: 'string' },
          eventsProcessed: { type: 'number' },
          eventsCreated: { type: 'number' },
          eventsUpdated: { type: 'number' },
          eventsDeleted: { type: 'number' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  @ApiBearerAuth()
  async syncAccount(
    @Request() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ) {
    return this.googleSyncService.syncAccountCalendars(req.user.id, accountId);
  }

  @Post('sync/:accountId/calendar/:calendarId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually trigger sync for specific calendar' })
  @ApiResponse({
    status: 200,
    description: 'Calendar sync completed successfully',
    schema: {
      type: 'object',
      properties: {
        accountId: { type: 'string' },
        calendarId: { type: 'string' },
        eventsProcessed: { type: 'number' },
        eventsCreated: { type: 'number' },
        eventsUpdated: { type: 'number' },
        eventsDeleted: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiBearerAuth()
  async syncSpecificCalendar(
    @Request() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
    @Param('calendarId') calendarId: string,
  ) {
    return this.googleSyncService.syncCalendar(
      req.user.id,
      accountId,
      calendarId,
    );
  }

  @Post('webhooks/:accountId/setup')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set up webhooks for Google Calendar account' })
  @ApiResponse({
    status: 200,
    description: 'Webhooks set up successfully',
  })
  @ApiBearerAuth()
  setupWebhooks(
    @Request() req: AuthenticatedRequest,
    @Param('accountId') accountId: string,
  ): { message: string } {
    this.googleSyncService.setupWebhookForAccount(req.user.id, accountId);
    return { message: 'Webhooks setup initiated' };
  }

  @Post('webhooks/google')
  @ApiOperation({ summary: 'Google Calendar webhook notification endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Webhook notification processed',
  })
  handleGoogleWebhook(
    @Query('channelId') channelId: string,
    @Body() payload: { resourceId?: string },
  ): { message: string } {
    this.googleSyncService.handleWebhookNotification(
      channelId,
      payload?.resourceId,
    );
    return { message: 'Webhook notification processed' };
  }

  // Event Management Endpoints

  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get events for user calendars' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          externalId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          isAllDay: { type: 'boolean' },
          location: { type: 'string' },
          calendarId: { type: 'string' },
          calendar: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              color: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  async getUserEvents(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('calendarIds') calendarIds?: string,
  ) {
    return this.calendarsService.getUserEvents(req.user.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      calendarIds: calendarIds ? calendarIds.split(',') : undefined,
    });
  }

  @Post('events')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
  })
  @ApiBearerAuth()
  async createEvent(
    @Request() req: AuthenticatedRequest,
    @Body() eventData: CreateEventRequestDto,
  ) {
    return this.calendarsService.createUserEvent(req.user.id, eventData);
  }

  @Put('events/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
  })
  @ApiBearerAuth()
  async updateEvent(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() eventData: UpdateEventRequestDto,
  ) {
    return this.calendarsService.updateUserEvent(
      req.user.id,
      eventId,
      eventData,
    );
  }

  @Delete('events/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({
    status: 204,
    description: 'Event deleted successfully',
  })
  @ApiBearerAuth()
  async deleteEvent(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    await this.calendarsService.deleteUserEvent(req.user.id, eventId);
  }
}
