import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PageResult, ServiceException } from '../../../common/result.js';
import { RoleSaveDto, AssignMenuDto } from './dto/system-role.dto.js';
import dayjs from 'dayjs';

/**
 * 系统角色管理服务（对标 Java 端 SysRoleService）
 * CRUD + 菜单分配 + 导出
 */
@Injectable()
export class SystemRoleService {
  constructor(private readonly prisma: PrismaService) {}

  /** 分页查询角色列表 */
  async listRoles(
    page: number,
    pageSize: number,
    name?: string,
    status?: number,
  ): Promise<PageResult<any>> {
    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (status !== undefined && status !== null) {
      where.status = status;
    }

    const [roles, total] = await Promise.all([
      this.prisma.sysRole.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.sysRole.count({ where }),
    ]);

    // 为每个角色附加 permissions（菜单 id 列表）
    const items = await Promise.all(roles.map((r) => this.toVO(r)));

    return new PageResult(items, total);
  }

  /** 新建角色 */
  async createRole(dto: RoleSaveDto): Promise<string> {
    if (!dto.name) {
      throw ServiceException.badRequest('角色名称不能为空');
    }
    if (!dto.code) {
      throw ServiceException.badRequest('角色编码不能为空');
    }

    const dup = await this.prisma.sysRole.count({
      where: { code: dto.code },
    });
    if (dup > 0) {
      throw ServiceException.badRequest('角色编码已存在');
    }

    const role = await this.prisma.sysRole.create({
      data: {
        name: dto.name,
        code: dto.code,
        status: dto.status ?? 1,
        remark: dto.remark || null,
        createTime: dayjs().toDate(),
      },
    });

    return role.id.toString();
  }

  /** 更新角色 */
  async updateRole(id: string, dto: RoleSaveDto): Promise<void> {
    const roleId = BigInt(id);
    const role = await this.prisma.sysRole.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw ServiceException.badRequest('角色不存在');
    }

    // 检查角色编码唯一性
    if (dto.code && dto.code !== role.code) {
      const dup = await this.prisma.sysRole.count({
        where: {
          code: dto.code,
          NOT: { id: roleId },
        },
      });
      if (dup > 0) {
        throw ServiceException.badRequest('角色编码已存在');
      }
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.remark !== undefined) data.remark = dto.remark || null;

    await this.prisma.sysRole.update({
      where: { id: roleId },
      data,
    });
  }

  /** 删除角色：禁止删除 super，有用户关联时拒绝删除 */
  async deleteRole(id: string): Promise<void> {
    const roleId = BigInt(id);
    const role = await this.prisma.sysRole.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw ServiceException.badRequest('角色不存在');
    }
    if (role.code === 'super') {
      throw ServiceException.badRequest('超级管理员角色不可删除');
    }

    // 检查是否有用户关联此角色
    const userCount = await this.prisma.sysUserRole.count({
      where: { roleId },
    });
    if (userCount > 0) {
      throw ServiceException.badRequest('该角色下存在用户，无法删除');
    }

    // 级联清理菜单关联
    await this.prisma.sysRoleMenu.deleteMany({
      where: { roleId },
    });

    await this.prisma.sysRole.delete({
      where: { id: roleId },
    });
  }

  /** 查询角色已分配的菜单 ID 列表 */
  async getMenuIds(roleId: string): Promise<string[]> {
    const roleMenus = await this.prisma.sysRoleMenu.findMany({
      where: { roleId: BigInt(roleId) },
    });
    return roleMenus.map((rm) => rm.menuId.toString());
  }

  /** 重新分配角色菜单（全量替换） */
  async assignMenus(roleId: string, dto: AssignMenuDto): Promise<void> {
    const rid = BigInt(roleId);
    const role = await this.prisma.sysRole.findUnique({
      where: { id: rid },
    });
    if (!role) {
      throw ServiceException.badRequest('角色不存在');
    }

    // 先删除旧关联
    await this.prisma.sysRoleMenu.deleteMany({
      where: { roleId: rid },
    });

    // 再批量插入新关联
    if (dto.menuIds && dto.menuIds.length > 0) {
      const data = dto.menuIds.map((mid) => ({
        roleId: rid,
        menuId: BigInt(mid),
      }));
      await this.prisma.sysRoleMenu.createMany({ data });
    }
  }

  /** 导出角色列表 */
  async exportRoles(name?: string, status?: number): Promise<any[]> {
    const where: any = {};
    if (name) where.name = { contains: name };
    if (status !== undefined && status !== null) where.status = status;

    const roles = await this.prisma.sysRole.findMany({
      where,
      orderBy: { id: 'desc' },
      take: 1000,
    });

    return roles.map((r) => ({
      id: r.id.toString(),
      name: r.name,
      code: r.code,
      status: r.status === 1 ? '启用' : '禁用',
      remark: r.remark || '',
      createTime: r.createTime
        ? dayjs(r.createTime).format('YYYY/MM/DD HH:mm:ss')
        : '',
    }));
  }

  // ----------------------------------------------------------------- 私有方法

  /** 实体转 VO（含 permissions = 菜单 ID 列表） */
  private async toVO(role: any): Promise<any> {
    const roleMenus = await this.prisma.sysRoleMenu.findMany({
      where: { roleId: role.id },
    });
    const permissions = roleMenus.map((rm) => rm.menuId);

    return {
      id: role.id.toString(),
      name: role.name,
      code: role.code,
      status: role.status,
      remark: role.remark,
      createTime: role.createTime
        ? dayjs(role.createTime).format('YYYY/MM/DD HH:mm:ss')
        : null,
      permissions,
    };
  }
}
