import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRole } from '@unical/core';
import { ADMIN_ROLES_KEY } from '../decorators/admin-roles.decorator';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request: {
      user?: { id: string; [key: string]: any };
    } = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Fetch user with roles from database
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithRoles) {
      return false;
    }

    // Check if user has any of the required admin roles
    const userRoles = userWithRoles.roles.map((ur) => ur.role.name);
    const hasAdminRole = userRoles.some((role) =>
      ['SuperAdmin', 'Admin'].includes(role),
    );

    if (!hasAdminRole) {
      return false;
    }

    // Check if user has specific required roles
    return requiredRoles.some((role) => userRoles.includes(role as string));
  }
}
