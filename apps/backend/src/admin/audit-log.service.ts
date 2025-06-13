import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditAction,
  AuditLogResponseDto,
  AuditLogFilterDto,
  PageOptionsDto,
  PageDto,
  createPageMeta,
} from '@unical/core';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async recordAudit(
    performingUserId: string,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditData: Prisma.AuditLogCreateInput = {
      performingUser: { connect: { id: performingUserId } },
      action,
      entityType,
      details: details as Prisma.InputJsonValue,
      ipAddress,
      userAgent,
    };

    // Set the appropriate entity ID based on entity type
    if (
      entityType === 'User' ||
      entityType === 'AdminUser' ||
      entityType === 'ClientUser'
    ) {
      if (entityId) {
        auditData.affectedUser = { connect: { id: entityId } };
      }
    } else if (entityType === 'Lead' && entityId) {
      auditData.affectedLead = { connect: { id: entityId } };
    }

    await this.prisma.auditLog.create({
      data: auditData,
    });
  }

  async getAuditLogs(
    filters: AuditLogFilterDto,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<AuditLogResponseDto>> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.performingUserId) {
      where.performingUserId = filters.performingUserId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.fromDate || filters.toDate) {
      where.timestamp = {};
      if (filters.fromDate) {
        where.timestamp.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        where.timestamp.lte = new Date(filters.toDate);
      }
    }

    const [auditLogs, totalCount] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          performingUser: {
            select: { id: true, fullName: true, email: true },
          },
          affectedUser: {
            select: { id: true, fullName: true, email: true },
          },
          affectedLead: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip: pageOptions.skip,
        take: pageOptions.take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const auditLogDtos: AuditLogResponseDto[] = auditLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      performingUserId: log.performingUserId,
      performingUserName: log.performingUser.fullName,
      action: log.action,
      entityType: log.entityType,
      affectedUserId: log.affectedUserId || undefined,
      affectedUserName: log.affectedUser?.fullName || undefined,
      affectedLeadId: log.affectedLeadId || undefined,
      details: log.details,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    }));

    const meta = createPageMeta(pageOptions, totalCount);
    return new PageDto(auditLogDtos, meta);
  }

  async getUserAuditLogs(
    userId: string,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<AuditLogResponseDto>> {
    const where: Prisma.AuditLogWhereInput = {
      OR: [{ performingUserId: userId }, { affectedUserId: userId }],
    };

    const [auditLogs, totalCount] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          performingUser: {
            select: { id: true, fullName: true, email: true },
          },
          affectedUser: {
            select: { id: true, fullName: true, email: true },
          },
          affectedLead: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip: pageOptions.skip,
        take: pageOptions.take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const auditLogDtos: AuditLogResponseDto[] = auditLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      performingUserId: log.performingUserId,
      performingUserName: log.performingUser.fullName,
      action: log.action,
      entityType: log.entityType,
      affectedUserId: log.affectedUserId || undefined,
      affectedUserName: log.affectedUser?.fullName || undefined,
      affectedLeadId: log.affectedLeadId || undefined,
      details: log.details,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
    }));

    const meta = createPageMeta(pageOptions, totalCount);
    return new PageDto(auditLogDtos, meta);
  }
}
