import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PageResult, ServiceException } from '../../../common/result';
import { hashPassword } from '../../../common/utils/password';
import { SystemUserSaveDto } from './dto/system-user.dto';
import dayjs = require('dayjs');

/**
 * 系统用户管理服务（对标 Java 端 SysUserService）
 * CRUD + 分页 + 导出 + 重置密码
 */
@Injectable()
export class SystemUserService {
  constructor(private readonly prisma: PrismaService) {}

  /** 分页查询用户列表（脱敏，附带角色） */
  async listUsers(
    page: number,
    pageSize: number,
    username?: string,
    status?: number,
    deptId?: string,
  ): Promise<PageResult<any>> {
    const where: any = {};
    if (username) {
      where.username = { contains: username };
    }
    if (status !== undefined && status !== null) {
      where.status = status;
    }
    if (deptId) {
      where.deptId = BigInt(deptId);
    }

    const [users, total] = await Promise.all([
      this.prisma.sysUser.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.sysUser.count({ where }),
    ]);

    const items = await Promise.all(users.map((u) => this.toVO(u)));

    return new PageResult(items, total);
  }

  /** 新建用户 */
  async createUser(dto: SystemUserSaveDto): Promise<string> {
    if (!dto.username) {
      throw ServiceException.badRequest('登录名不能为空');
    }
    if (!dto.password) {
      throw ServiceException.badRequest('密码不能为空');
    }

    // 检查用户名是否已存在
    const dup = await this.prisma.sysUser.count({
      where: { username: dto.username },
    });
    if (dup > 0) {
      throw ServiceException.badRequest('登录名已存在');
    }

    const passwordHash = await hashPassword(dto.password);
    const now = dayjs().toDate();

    const user = await this.prisma.sysUser.create({
      data: {
        username: dto.username,
        passwordHash,
        realName: dto.realName || null,
        avatar: dto.avatar || null,
        homePath: dto.homePath || null,
        deptId: dto.deptId ? BigInt(dto.deptId) : null,
        status: dto.status ?? 1,
        remark: dto.remark || null,
        createTime: now,
        updateTime: now,
      },
    });

    // 绑定角色
    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.bindRoles(user.id, dto.roleIds);
    }

    return user.id.toString();
  }

  /** 更新用户 */
  async updateUser(id: string, dto: SystemUserSaveDto): Promise<void> {
    const userId = BigInt(id);
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw ServiceException.badRequest('用户不存在');
    }

    // 检查用户名唯一性
    if (dto.username && dto.username !== user.username) {
      const dup = await this.prisma.sysUser.count({
        where: {
          username: dto.username,
          NOT: { id: userId },
        },
      });
      if (dup > 0) {
        throw ServiceException.badRequest('登录名已存在');
      }
    }

    const data: any = { updateTime: dayjs().toDate() };
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.realName !== undefined) data.realName = dto.realName || null;
    if (dto.avatar !== undefined) data.avatar = dto.avatar || null;
    if (dto.homePath !== undefined) data.homePath = dto.homePath || null;
    if (dto.deptId !== undefined)
      data.deptId = dto.deptId ? BigInt(dto.deptId) : null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.remark !== undefined) data.remark = dto.remark || null;
    if (dto.password) {
      data.passwordHash = await hashPassword(dto.password);
    }

    await this.prisma.sysUser.update({
      where: { id: userId },
      data,
    });

    // 仅当请求携带角色列表时才重新绑定
    if (dto.roleIds !== undefined && dto.roleIds !== null) {
      await this.bindRoles(userId, dto.roleIds);
    }
  }

  /** 删除用户（禁止删除自己） */
  async deleteUser(id: string, currentUserId: string): Promise<void> {
    const userId = BigInt(id);
    if (userId === BigInt(currentUserId)) {
      throw ServiceException.badRequest('不能删除当前登录账号');
    }

    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw ServiceException.badRequest('用户不存在');
    }

    // 删除用户-角色关联
    await this.prisma.sysUserRole.deleteMany({
      where: { userId },
    });

    await this.prisma.sysUser.delete({
      where: { id: userId },
    });
  }

  /** 重置密码 */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const userId = BigInt(id);
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw ServiceException.badRequest('用户不存在');
    }
    if (!newPassword) {
      throw ServiceException.badRequest('新密码不能为空');
    }

    const passwordHash = await hashPassword(newPassword);
    await this.prisma.sysUser.update({
      where: { id: userId },
      data: { passwordHash, updateTime: dayjs().toDate() },
    });
  }

  /** 导出用户列表（返回 JSON 数据，前端可导出 Excel） */
  async exportUsers(
    username?: string,
    status?: number,
    deptId?: string,
  ): Promise<any[]> {
    const where: any = {};
    if (username) where.username = { contains: username };
    if (status !== undefined && status !== null) where.status = status;
    if (deptId) where.deptId = BigInt(deptId);

    const users = await this.prisma.sysUser.findMany({
      where,
      orderBy: { id: 'desc' },
      take: 1000,
    });

    return Promise.all(
      users.map(async (u) => ({
        id: u.id.toString(),
        username: u.username,
        realName: u.realName || '',
        deptId: u.deptId?.toString() || '',
        status: u.status === 1 ? '启用' : '禁用',
        remark: u.remark || '',
        createTime: u.createTime
          ? dayjs(u.createTime).format('YYYY/MM/DD HH:mm:ss')
          : '',
      })),
    );
  }

  // ----------------------------------------------------------------- 私有方法

  /** 替换用户-角色关联 */
  private async bindRoles(userId: bigint, roleIds: string[]): Promise<void> {
    await this.prisma.sysUserRole.deleteMany({
      where: { userId },
    });

    if (!roleIds || roleIds.length === 0) return;

    const data = roleIds.map((rid) => ({
      userId,
      roleId: BigInt(rid),
    }));
    await this.prisma.sysUserRole.createMany({ data });
  }

  /** 实体转脱敏 VO（含角色） */
  private async toVO(user: any): Promise<any> {
    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const roleIds = userRoles.map((ur) => ur.roleId.toString());
    const roleCodes = userRoles
      .map((ur) => ur.role)
      .map((r) => r.code);

    return {
      id: user.id.toString(),
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      homePath: user.homePath,
      deptId: user.deptId?.toString() || null,
      status: user.status,
      remark: user.remark,
      createTime: user.createTime
        ? dayjs(user.createTime).format('YYYY/MM/DD HH:mm:ss')
        : null,
      roleIds,
      roleCodes,
    };
  }
}
