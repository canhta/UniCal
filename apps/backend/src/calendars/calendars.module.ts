import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';
import { GoogleCalendarService } from './services/google-calendar.service';
import { MicrosoftCalendarService } from './services/microsoft-calendar.service';
import { AccountsModule } from '../accounts/accounts.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule, ConfigModule, AccountsModule],
  controllers: [CalendarsController],
  providers: [
    CalendarsService,
    GoogleCalendarService,
    MicrosoftCalendarService,
    PrismaService,
  ],
  exports: [CalendarsService],
})
export class CalendarsModule {}
