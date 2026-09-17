import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ServiceException } from '../../../common/result.js';
import { MenuSaveDto } from './dto/system-menu.dto.js';
import dayjs from 'dayjs';

/**
 * 系统菜单管理服务（对标 Java 端 SysMenuService）
 * 列表/树/CRUD/唯一性校验
 */
@Injectable()
export class SystemMenuService {
  constructor(private readonly prisma: PrismaService) {}

  /** 菜单扁平列表（含按钮型，管理页使用） */
  async listAll(): Promise<any[]> {
    const menus = await this.prisma.sysMenu.findMany({
      orderBy: { sort: 'asc' },
    });
    return menus.map((m) => this.toFlatVO(m));
  }

  /** 菜单树（管理页权限分配勾选用，不含按钮型） */
  async tree(): Promise<any[]> {
    const menus = await this.prisma.sysMenu.findMany({
      where: { type: { not: 'button' } },
      orderBy: { sort: 'asc' },
    });
    return this.buildTree(0n, menus);
  }

  /** 新建菜单 */
  async create(dto: MenuSaveDto): Promise<string> {
    if (!dto.name) {
      throw ServiceException.badRequest('菜单名称不能为空');
    }
    if (!dto.type) {
      throw ServiceException.badRequest('菜单类型不能为空');
    }

    // 唯一性校验
    await this.checkUnique(dto.name, dto.path, null);

    const menu = await this.prisma.sysMenu.create({
      data: {
        pid: dto.pid ? BigInt(dto.pid) : 0n,
        name: dto.name,
        type: dto.type,
        path: dto.path || null,
        component: dto.component || null,
        redirect: dto.redirect || null,
        authCode: dto.authCode || null,
        icon: dto.icon || null,
        status: dto.status ?? 1,
        sort: dto.sort ?? 0,
        meta: dto.meta || null,
        createTime: dayjs().toDate(),
        updateTime: dayjs().toDate(),
      },
    });

    return menu.id.toString();
  }

  /** 更新菜单 */
  async update(id: string, dto: MenuSaveDto): Promise<void> {
    const menuId = BigInt(id);
    const menu = await this.prisma.sysMenu.findUnique({
      where: { id: menuId },
    });
    if (!menu) {
      throw ServiceException.badRequest('菜单不存在');
    }

    // 唯一性校验
    await this.checkUnique(dto.name, dto.path, menuId);

    const data: any = { updateTime: dayjs().toDate() };
    if (dto.pid !== undefined) data.pid = dto.pid ? BigInt(dto.pid) : 0n;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.path !== undefined) data.path = dto.path || null;
    if (dto.component !== undefined) data.component = dto.component || null;
    if (dto.redirect !== undefined) data.redirect = dto.redirect || null;
    if (dto.authCode !== undefined) data.authCode = dto.authCode || null;
    if (dto.icon !== undefined) data.icon = dto.icon || null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sort !== undefined) data.sort = dto.sort;
    if (dto.meta !== undefined) data.meta = dto.meta || null;

    await this.prisma.sysMenu.update({
      where: { id: menuId },
      data,
    });
  }

  /** 删除菜单：有子节点则拒绝 */
  async remove(id: string): Promise<void> {
    const menuId = BigInt(id);
    const menu = await this.prisma.sysMenu.findUnique({
      where: { id: menuId },
    });
    if (!menu) {
      throw ServiceException.badRequest('菜单不存在');
    }

    // 检查子节点
    const childCount = await this.prisma.sysMenu.count({
      where: { pid: menuId },
    });
    if (childCount > 0) {
      throw ServiceException.badRequest('该菜单存在子节点，无法删除');
    }

    // 级联清理角色-菜单关联
    await this.prisma.sysRoleMenu.deleteMany({
      where: { menuId },
    });

    await this.prisma.sysMenu.delete({
      where: { id: menuId },
    });
  }

  /** 菜单名是否存在（排除指定 ID） */
  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const where: any = { name };
    if (excludeId) {
      where.NOT = { id: BigInt(excludeId) };
    }
    const count = await this.prisma.sysMenu.count({ where });
    return count > 0;
  }

  /** 菜单路径是否存在（排除指定 ID） */
  async pathExists(path: string, excludeId?: string): Promise<boolean> {
    if (!path) return false;
    const where: any = { path };
    if (excludeId) {
      where.NOT = { id: BigInt(excludeId) };
    }
    const count = await this.prisma.sysMenu.count({ where });
    return count > 0;
  }

  // ----------------------------------------------------------------- 私有方法

  /** 唯一性校验 */
  private async checkUnique(
    name: string | undefined,
    path: string | undefined,
    excludeId: bigint | null,
  ): Promise<void> {
    if (name) {
      const exists = await this.nameExists(name, excludeId?.toString());
      if (exists) {
        throw ServiceException.badRequest(`菜单名称(路由名)已存在：${name}`);
      }
    }
    if (path) {
      const exists = await this.pathExists(path, excludeId?.toString());
      if (exists) {
        throw ServiceException.badRequest(`路由路径已存在：${path}`);
      }
    }
  }

  /** 实体 → 扁平 VO */
  private toFlatVO(menu: any): any {
    return {
      id: menu.id.toString(),
      pid: menu.pid.toString(),
      name: menu.name,
      type: menu.type,
      path: menu.path,
      component: menu.component,
      redirect: menu.redirect,
      authCode: menu.authCode,
      icon: menu.icon,
      status: menu.status,
      sort: menu.sort,
      meta: this.parseMeta(menu.meta),
      createTime: menu.createTime
        ? dayjs(menu.createTime).format('YYYY/MM/DD HH:mm:ss')
        : null,
      updateTime: menu.updateTime
        ? dayjs(menu.updateTime).format('YYYY/MM/DD HH:mm:ss')
        : null,
    };
  }

  /** 递归组树 */
  private buildTree(pid: bigint, menus: any[]): any[] {
    return menus
      .filter((m) => m.pid === pid)
      .map((menu) => this.toTreeNode(menu, menus));
  }

  /** 实体 → 树节点 */
  private toTreeNode(menu: any, menus: any[]): Record<string, any> {
    const node: Record<string, any> = {
      id: menu.id.toString(),
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

  /** meta JSON → 对象 */
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
