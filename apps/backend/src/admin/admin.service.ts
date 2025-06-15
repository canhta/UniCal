import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus, LeadStatus, Prisma } from '@prisma/client';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserResponseDto,
  CreateClientUserDto,
  UpdateClientUserDto,
  ClientUserResponseDto,
  ClientUserDetailResponseDto,
  DashboardStatsDto,
  SearchResultDto,
  PageOptionsDto,
  PageDto,
  createPageMeta,
  AdminRole,
  AuditAction,
  CreateLeadDto,
  UpdateLeadDto,
  LeadResponseDto,
  ConvertLeadDto,
} from '@unical/core';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Admin User Management
  async getAdminUsers(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<AdminUserResponseDto>> {
    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: {
                name: {
                  in: ['SuperAdmin', 'Admin'],
                },
              },
            },
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pageOptions.skip,
        take: pageOptions.take,
      }),
      this.prisma.user.count({
        where: {
          roles: {
            some: {
              role: {
                name: {
                  in: ['SuperAdmin', 'Admin'],
                },
              },
            },
          },
        },
      }),
    ]);

    const adminUserDtos: AdminUserResponseDto[] = users.map((user) => {
      const adminRole = user.roles.find((ur) =>
        ['SuperAdmin', 'Admin'].includes(ur.role.name),
      );
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: (adminRole?.role.name as AdminRole) || AdminRole.ADMIN,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      };
    });

    const meta = createPageMeta(pageOptions, totalCount);
    return new PageDto(adminUserDtos, meta);
  }

  async createAdminUser(
    createAdminUserDto: CreateAdminUserDto,
    performingUserId: string,
  ): Promise<AdminUserResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get or create the role
    const role = await this.prisma.role.findUnique({
      where: { name: createAdminUserDto.role },
    });

    if (!role) {
      throw new BadRequestException(
        `Role ${createAdminUserDto.role} not found`,
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email: createAdminUserDto.email,
        fullName: createAdminUserDto.fullName,
        status: UserStatus.ACTIVE,
        roles: {
          create: {
            roleId: role.id,
            assignedBy: performingUserId,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.CREATE_ADMIN_USER,
      'AdminUser',
      user.id,
      {
        email: createAdminUserDto.email,
        fullName: createAdminUserDto.fullName,
        role: createAdminUserDto.role,
      },
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: createAdminUserDto.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async updateAdminUser(
    userId: string,
    updateAdminUserDto: UpdateAdminUserDto,
    performingUserId: string,
  ): Promise<AdminUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    // Check if user is actually an admin
    const isAdmin = user.roles.some((ur) =>
      ['SuperAdmin', 'Admin'].includes(ur.role.name),
    );

    if (!isAdmin) {
      throw new BadRequestException('User is not an admin');
    }

    // Prevent self-deactivation/demotion if sole Super Admin
    if (
      userId === performingUserId &&
      (updateAdminUserDto.status === UserStatus.INACTIVE ||
        updateAdminUserDto.role === AdminRole.ADMIN)
    ) {
      const superAdminCount = await this.prisma.user.count({
        where: {
          roles: {
            some: {
              role: {
                name: 'SuperAdmin',
              },
            },
          },
          status: UserStatus.ACTIVE,
        },
      });

      if (superAdminCount === 1) {
        throw new ForbiddenException(
          'Cannot deactivate or demote the only active Super Admin',
        );
      }
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (updateAdminUserDto.fullName) {
      updateData.fullName = updateAdminUserDto.fullName;
    }

    if (updateAdminUserDto.status) {
      updateData.status = updateAdminUserDto.status;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Handle role update if provided
    if (updateAdminUserDto.role) {
      const newRole = await this.prisma.role.findUnique({
        where: { name: updateAdminUserDto.role },
      });

      if (!newRole) {
        throw new BadRequestException(
          `Role ${updateAdminUserDto.role} not found`,
        );
      }

      // Remove existing admin roles and add new one
      await this.prisma.userRole.deleteMany({
        where: {
          userId,
          role: {
            name: {
              in: ['SuperAdmin', 'Admin'],
            },
          },
        },
      });

      await this.prisma.userRole.create({
        data: {
          userId,
          roleId: newRole.id,
          assignedBy: performingUserId,
        },
      });
    }

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.UPDATE_ADMIN_USER,
      'AdminUser',
      userId,
      {
        oldValues: {
          fullName: user.fullName,
          status: user.status,
        },
        newValues: updateAdminUserDto,
      },
    );

    const currentRole =
      updateAdminUserDto.role ||
      (user.roles.find((ur) => ['SuperAdmin', 'Admin'].includes(ur.role.name))
        ?.role.name as AdminRole) ||
      AdminRole.ADMIN;

    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: currentRole,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLoginAt: updatedUser.lastLoginAt,
    };
  }

  // Client User Management
  async getClientUsers(
    pageOptions: PageOptionsDto,
    status?: UserStatus,
  ): Promise<PageDto<ClientUserResponseDto>> {
    const where: Prisma.UserWhereInput = {
      roles: {
        none: {
          role: {
            name: {
              in: ['SuperAdmin', 'Admin'],
            },
          },
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pageOptions.skip,
        take: pageOptions.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    const clientUserDtos: ClientUserResponseDto[] = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: user.status,
      registrationDate: user.registrationDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    const meta = createPageMeta(pageOptions, totalCount);
    return new PageDto(clientUserDtos, meta);
  }

  async getClientUserDetails(
    userId: string,
  ): Promise<ClientUserDetailResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        subscriptions: {
          include: {
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Client user not found');
    }

    // Check if user is actually a client (not admin)
    const isAdmin = user.roles.some((ur) =>
      ['SuperAdmin', 'Admin'].includes(ur.role.name),
    );

    if (isAdmin) {
      throw new BadRequestException('User is an admin, not a client');
    }

    const subscription = user.subscriptions[0];

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: user.status,
      registrationDate: user.registrationDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      timeZone: user.timeZone,
      roles: user.roles.map((ur) => ur.role.name),
      subscription: subscription
        ? {
            id: subscription.id,
            planName: subscription.plan.name,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate || undefined,
            renewalDate: subscription.renewalDate || undefined,
          }
        : undefined,
    };
  }

  async createClientUser(
    createClientUserDto: CreateClientUserDto,
    performingUserId: string,
  ): Promise<ClientUserResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createClientUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userData: Prisma.UserCreateInput = {
      email: createClientUserDto.email,
      fullName: createClientUserDto.fullName,
      phoneNumber: createClientUserDto.phoneNumber,
      status: UserStatus.ACTIVE,
    };

    // TODO: Handle initial password if provided
    // This would typically involve hashing the password or sending an invitation

    const user = await this.prisma.user.create({
      data: userData,
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.CREATE_CLIENT_USER,
      'ClientUser',
      user.id,
      {
        email: createClientUserDto.email,
        fullName: createClientUserDto.fullName,
        phoneNumber: createClientUserDto.phoneNumber,
      },
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: user.status,
      registrationDate: user.registrationDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateClientUser(
    userId: string,
    updateClientUserDto: UpdateClientUserDto,
    performingUserId: string,
  ): Promise<ClientUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Client user not found');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (updateClientUserDto.fullName) {
      updateData.fullName = updateClientUserDto.fullName;
    }

    if (updateClientUserDto.phoneNumber !== undefined) {
      updateData.phoneNumber = updateClientUserDto.phoneNumber;
    }

    if (updateClientUserDto.status) {
      updateData.status = updateClientUserDto.status;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.UPDATE_CLIENT_USER,
      'ClientUser',
      userId,
      {
        oldValues: {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          status: user.status,
        },
        newValues: updateClientUserDto,
      },
    );

    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      status: updatedUser.status,
      registrationDate: updatedUser.registrationDate,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async deleteClientUser(
    userId: string,
    performingUserId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Client user not found');
    }

    // Soft delete by setting status to DELETED
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.DELETED },
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.DELETE_CLIENT_USER,
      'ClientUser',
      userId,
      {
        email: user.email,
        fullName: user.fullName,
      },
    );
  }

  // Lead Management
  async getLeads(
    pageOptions: PageOptionsDto,
    status?: LeadStatus[],
  ): Promise<PageDto<LeadResponseDto>> {
    const where: Prisma.LeadWhereInput = {};

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    const [leads, totalCount] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pageOptions.skip,
        take: pageOptions.take,
      }),
      this.prisma.lead.count({ where }),
    ]);

    const leadDtos: LeadResponseDto[] = leads.map((lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email,
      phoneNumber: lead.phoneNumber,
      companyName: lead.companyName,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      assignedToId: lead.assignedToId,
      assignedToName: lead.assignedTo?.fullName || null,
      convertedToUserId: lead.convertedToUserId,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    const meta = createPageMeta(pageOptions, totalCount);
    return new PageDto(leadDtos, meta);
  }

  async getLeadDetails(leadId: string): Promise<LeadResponseDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return {
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email,
      phoneNumber: lead.phoneNumber,
      companyName: lead.companyName,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      assignedToId: lead.assignedToId,
      assignedToName: lead.assignedTo?.fullName || null,
      convertedToUserId: lead.convertedToUserId,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  async createLead(
    createLeadDto: CreateLeadDto,
    performingUserId: string,
  ): Promise<LeadResponseDto> {
    // Check if lead with email already exists
    const existingLead = await this.prisma.lead.findFirst({
      where: { email: createLeadDto.email },
    });

    if (existingLead) {
      throw new ConflictException('Lead with this email already exists');
    }

    const lead = await this.prisma.lead.create({
      data: {
        email: createLeadDto.email,
        fullName: createLeadDto.fullName,
        phoneNumber: createLeadDto.phoneNumber,
        companyName: createLeadDto.companyName,
        source: createLeadDto.source,
        notes: createLeadDto.notes,
        assignedToId: createLeadDto.assignedToId,
      },
      include: {
        assignedTo: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.CREATE_LEAD,
      'Lead',
      lead.id,
      {
        email: createLeadDto.email,
        fullName: createLeadDto.fullName,
        companyName: createLeadDto.companyName,
      },
    );

    return {
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email,
      phoneNumber: lead.phoneNumber,
      companyName: lead.companyName,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      assignedToId: lead.assignedToId,
      assignedToName: lead.assignedTo?.fullName || null,
      convertedToUserId: lead.convertedToUserId,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  async updateLead(
    leadId: string,
    updateLeadDto: UpdateLeadDto,
    performingUserId: string,
  ): Promise<LeadResponseDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const updateData: Prisma.LeadUpdateInput = {};

    if (updateLeadDto.fullName) {
      updateData.fullName = updateLeadDto.fullName;
    }

    if (updateLeadDto.email) {
      updateData.email = updateLeadDto.email;
    }

    if (updateLeadDto.phoneNumber !== undefined) {
      updateData.phoneNumber = updateLeadDto.phoneNumber;
    }

    if (updateLeadDto.companyName !== undefined) {
      updateData.companyName = updateLeadDto.companyName;
    }

    if (updateLeadDto.source !== undefined) {
      updateData.source = updateLeadDto.source;
    }

    if (updateLeadDto.status) {
      updateData.status = updateLeadDto.status;
    }

    if (updateLeadDto.notes !== undefined) {
      updateData.notes = updateLeadDto.notes;
    }

    if (updateLeadDto.assignedToId !== undefined) {
      updateData.assignedTo = updateLeadDto.assignedToId
        ? { connect: { id: updateLeadDto.assignedToId } }
        : { disconnect: true };
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, fullName: true },
        },
      },
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.UPDATE_LEAD,
      'Lead',
      leadId,
      {
        oldValues: {
          fullName: lead.fullName,
          email: lead.email,
          status: lead.status,
        },
        newValues: updateLeadDto,
      },
    );

    return {
      id: updatedLead.id,
      fullName: updatedLead.fullName,
      email: updatedLead.email,
      phoneNumber: updatedLead.phoneNumber,
      companyName: updatedLead.companyName,
      source: updatedLead.source,
      status: updatedLead.status,
      notes: updatedLead.notes,
      assignedToId: updatedLead.assignedToId,
      assignedToName: updatedLead.assignedTo?.fullName || null,
      convertedToUserId: updatedLead.convertedToUserId,
      createdAt: updatedLead.createdAt,
      updatedAt: updatedLead.updatedAt,
    };
  }

  async convertLead(
    leadId: string,
    convertLeadDto: ConvertLeadDto,
    performingUserId: string,
  ): Promise<ClientUserResponseDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.convertedToUserId) {
      throw new BadRequestException('Lead has already been converted');
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: lead.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user from lead
    const userData: Prisma.UserCreateInput = {
      email: lead.email,
      fullName: lead.fullName,
      phoneNumber: lead.phoneNumber,
      status: UserStatus.ACTIVE,
    };

    // TODO: Handle initial password if provided
    if (convertLeadDto.initialPassword) {
      // Hash password and set it
      // userData.password = await bcrypt.hash(convertLeadDto.initialPassword, 10);
    }

    const user = await this.prisma.user.create({
      data: userData,
    });

    // Assign default roles or specified roles
    const rolesToAssign = convertLeadDto.roles || ['Client'];
    for (const roleName of rolesToAssign) {
      const role = await this.prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            assignedBy: performingUserId,
          },
        });
      }
    }

    // Update lead to mark as converted
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CONVERTED' as LeadStatus,
        convertedToUserId: user.id,
      },
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.CONVERT_LEAD,
      'Lead',
      leadId,
      {
        leadEmail: lead.email,
        leadFullName: lead.fullName,
        convertedToUserId: user.id,
      },
    );

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: user.status,
      registrationDate: user.registrationDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deleteLead(leadId: string, performingUserId: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Soft delete by updating status (if you prefer) or hard delete
    await this.prisma.lead.delete({
      where: { id: leadId },
    });

    // Record audit log
    await this.auditLogService.recordAudit(
      performingUserId,
      AuditAction.DELETE_LEAD,
      'Lead',
      leadId,
      {
        email: lead.email,
        fullName: lead.fullName,
      },
    );
  }

  // Dashboard and Search
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalClientUsers,
      totalAdminUsers,
      newRegistrationsThisMonth,
      newRegistrationsLastMonth,
      activeSubscriptions,
      pendingLeads,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          roles: {
            none: {
              role: {
                name: {
                  in: ['SuperAdmin', 'Admin'],
                },
              },
            },
          },
          status: { not: UserStatus.DELETED },
        },
      }),
      this.prisma.user.count({
        where: {
          roles: {
            some: {
              role: {
                name: {
                  in: ['SuperAdmin', 'Admin'],
                },
              },
            },
          },
          status: { not: UserStatus.DELETED },
        },
      }),
      this.prisma.user.count({
        where: {
          registrationDate: { gte: startOfMonth },
          roles: {
            none: {
              role: {
                name: {
                  in: ['SuperAdmin', 'Admin'],
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          registrationDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          roles: {
            none: {
              role: {
                name: {
                  in: ['SuperAdmin', 'Admin'],
                },
              },
            },
          },
        },
      }),
      this.prisma.userSubscription.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      this.prisma.lead.count({
        where: {
          status: { in: ['NEW', 'CONTACTED'] },
        },
      }),
    ]);

    const userGrowthPercentage =
      newRegistrationsLastMonth > 0
        ? ((newRegistrationsThisMonth - newRegistrationsLastMonth) /
            newRegistrationsLastMonth) *
          100
        : newRegistrationsThisMonth > 0
          ? 100
          : 0;

    return {
      totalClientUsers,
      totalAdminUsers,
      newRegistrationsThisMonth,
      activeSubscriptions,
      pendingLeads,
      revenueThisMonth: 0, // TODO: Implement revenue calculation
      userGrowthPercentage: Math.round(userGrowthPercentage * 100) / 100,
    };
  }

  async searchUsers(query: string): Promise<SearchResultDto[]> {
    const [clientUsers, adminUsers, leads] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
            {
              roles: {
                none: {
                  role: {
                    name: {
                      in: ['SuperAdmin', 'Admin'],
                    },
                  },
                },
              },
            },
            { status: { not: UserStatus.DELETED } },
          ],
        },
        take: 10,
      }),
      this.prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
            {
              roles: {
                some: {
                  role: {
                    name: {
                      in: ['SuperAdmin', 'Admin'],
                    },
                  },
                },
              },
            },
            { status: { not: UserStatus.DELETED } },
          ],
        },
        take: 5,
      }),
      this.prisma.lead.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    const results: SearchResultDto[] = [
      ...clientUsers.map((user) => ({
        id: user.id,
        type: 'client_user' as const,
        name: user.fullName,
        email: user.email,
        status: user.status,
        additionalInfo: `Registered: ${user.registrationDate.toLocaleDateString()}`,
      })),
      ...adminUsers.map((user) => ({
        id: user.id,
        type: 'admin_user' as const,
        name: user.fullName,
        email: user.email,
        status: user.status,
        additionalInfo: 'Admin User',
      })),
      ...leads.map((lead) => ({
        id: lead.id,
        type: 'lead' as const,
        name: lead.fullName,
        email: lead.email,
        status: lead.status,
        additionalInfo: lead.companyName || 'No company',
      })),
    ];

    return results;
  }
}
