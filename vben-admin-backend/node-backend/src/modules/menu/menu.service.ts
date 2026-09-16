import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ServiceException } from '../../common/result';
import dayjs = require('dayjs');

/**
 * 菜单服务（对标 Java 端 SysMenuService）
 */
@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 用户可访问的路由树（契约 §3.6）：
   * 授权菜单（button 型除外）→ 按 pid 组树 → sort 升序 → meta 解析为对象
   */
  async buildRoutesByUserId(userId: bigint) {
    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId },
      include: { role: true },
    });

    if (userRoles.length === 0) return [];

    const activeRoles = userRoles
      .map((ur) => ur.role)
      .filter((r) => r.status === 1);

    if (activeRoles.length === 0) return [];

    const roleIds = activeRoles.map((r) => r.id);
    const isSuper = activeRoles.some((r) => r.code === 'super');

    let menus;
    if (isSuper) {
      // 超级管理员拥有全部权限：直接返回所有启用的非 button 菜单
      menus = await this.prisma.sysMenu.findMany({
        where: { type: { not: 'button' }, status: 1 },
        orderBy: { sort: 'asc' },
      });
    } else {
      const roleMenus = await this.prisma.sysRoleMenu.findMany({
        where: { roleId: { in: roleIds } },
        include: { menu: true },
      });

      const menuIds = [...new Set(roleMenus.map((rm) => rm.menuId))];
      if (menuIds.length === 0) return [];

      menus = await this.prisma.sysMenu.findMany({
        where: {
          id: { in: menuIds },
          type: { not: 'button' },
          status: 1,
        },
        orderBy: { sort: 'asc' },
      });
    }

    return this.buildTree(0n, menus);
  }

  /** 递归组树：同层按 sort 升序 */
  private buildTree(pid: bigint, menus: any[]): any[] {
    return menus
      .filter((m) => m.pid === pid)
      .map((menu) => this.toNode(menu, menus));
  }

  /** 实体 → 前端节点（meta 解析为对象；null 字段不输出） */
  private toNode(menu: any, menus: any[]): Record<string, any> {
    const node: Record<string, any> = {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      type: menu.type,
      status: menu.status,
      sort: menu.sort,
    };

    if (menu.component) node.component = menu.component;
    if (menu.redirect) node.redirect = menu.redirect;
    if (menu.authCode) node.authCode = menu.authCode;
    if (menu.icon) node.icon = menu.icon;

    const meta = this.parseMeta(menu.meta);
    if (meta) node.meta = meta;

    const children = this.buildTree(menu.id, menus);
    if (children.length > 0) {
      node.children = children;
    }

    return node;
  }

  /** meta JSON → 对象（解析失败返回 null） */
  private parseMeta(meta: any): Record<string, any> | null {
    if (!meta) return null;
    if (typeof meta === 'object') return meta;
    try {
      return typeof meta === 'string' ? JSON.parse(meta) : null;
    } catch {
      return null;
    }
  }
}
