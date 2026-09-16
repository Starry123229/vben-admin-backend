import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 权限 Guard（对标 Java 端 @SaCheckPermission + @SaCheckRole）
 * 先检查角色，再检查权限码。super 角色拥有全部权限。
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // 检查权限码
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = BigInt(request.user.id);

    // 查用户角色
    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const activeRoles = userRoles
      .map((ur) => ur.role)
      .filter((r) => r.status === 1);

    const roleCodes = activeRoles.map((r) => r.code);
    const isSuper = roleCodes.includes('super');

    // 角色校验
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = isSuper || requiredRoles.some((r) => roleCodes.includes(r));
      if (!hasRole) {
        throw new ForbiddenException('无权限执行此操作');
      }
    }

    // 权限码校验：super 直接通过
    if (isSuper) {
      return true;
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      // 查用户通过角色关联的 button 型菜单的 authCode
      const activeRoleIds = activeRoles.map((r) => r.id);
      const roleMenus = await this.prisma.sysRoleMenu.findMany({
        where: { roleId: { in: activeRoleIds } },
        include: { menu: true },
      });

      const userCodes = roleMenus
        .map((rm) => rm.menu)
        .filter((m) => m && m.type === 'button' && m.status === 1 && m.authCode)
        .map((m) => m.authCode) as string[];
      const uniqueCodes = [...new Set(userCodes)];

      const hasPermission = requiredPermissions.some((p) =>
        uniqueCodes.includes(p),
      );
      if (!hasPermission) {
        throw new ForbiddenException('无权限执行此操作');
      }
    }

    return true;
  }
}
