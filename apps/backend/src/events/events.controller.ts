import {
  Controller,
  Get,
  Post,
  Patch,
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
import { EventsService } from './events.service';
import {
  EventResponseDto,
  CreateEventRequestDto,
  UpdateEventRequestDto,
  GetEventsQueryDto,
} from './dto/events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
}

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiBearerAuth()
  async createEvent(
    @Request() req: AuthenticatedRequest,
    @Body() createEventDto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.createEventForUser(req.user.id, createEventDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get events for current user' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventResponseDto],
  })
  @ApiBearerAuth()
  async getEvents(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetEventsQueryDto,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.getEventsForUser(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiBearerAuth()
  async getEventById(
    @Request() req: AuthenticatedRequest,
    @Param('id') eventId: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.getEventById(req.user.id, eventId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiBearerAuth()
  async updateEvent(
    @Request() req: AuthenticatedRequest,
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.updateEvent(req.user.id, eventId, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiBearerAuth()
  async deleteEvent(
    @Request() req: AuthenticatedRequest,
    @Param('id') eventId: string,
  ): Promise<void> {
    await this.eventsService.deleteEvent(req.user.id, eventId);
  }
}
