import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [AuthModule, UserModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, AuditLogService],
  exports: [AdminService, AuditLogService],
})
export class AdminModule {}
