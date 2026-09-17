import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ServiceException } from '../../../common/result.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemNoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(userId: bigint): Promise<any[]> {
    const userRoles = await this.prisma.sysUserRole.findMany({ where: { userId }, select: { roleId: true } });
    const roleIds = userRoles.map((ur) => ur.roleId);
    const notices = await this.prisma.sysNotice.findMany({
      where: { OR: [{ userId }, { roleId: { in: roleIds } }] },
      orderBy: { createTime: 'desc' },
    });
    return notices.map((n) => ({
      id: n.id.toString(), title: n.title, message: n.message, avatar: n.avatar,
      link: n.link, isRead: n.isRead, type: n.type,
      createTime: dayjs(n.createTime).format('YYYY/MM/DD HH:mm:ss'),
    }));
  }

  async markRead(id: string, userId: bigint): Promise<void> {
    const notice = await this.prisma.sysNotice.findUnique({ where: { id: BigInt(id) } });
    if (!notice) throw ServiceException.badRequest('通知不存在');
    // 通知可见用户均可标记已读（包括直接发给自己的和按角色广播的）
    await this.prisma.sysNotice.update({ where: { id: BigInt(id) }, data: { isRead: 1 } });
  }

  async markAllRead(userId: bigint): Promise<void> {
    await this.prisma.sysNotice.updateMany({ where: { userId, isRead: 0 }, data: { isRead: 1 } });
  }

  async deleteNotice(id: string, userId: bigint): Promise<void> {
    const notice = await this.prisma.sysNotice.findUnique({ where: { id: BigInt(id) } });
    if (!notice) throw ServiceException.badRequest('通知不存在');
    // 通知可见用户均可删除
    await this.prisma.sysNotice.delete({ where: { id: BigInt(id) } });
  }

  async clearAll(userId: bigint): Promise<void> {
    await this.prisma.sysNotice.deleteMany({ where: { userId } });
  }

  async sendToUser(data: any): Promise<void> {
    if (!data.userId) throw ServiceException.badRequest('用户 ID 不能为空');
    if (!data.title) throw ServiceException.badRequest('通知标题不能为空');
    await this.prisma.sysNotice.create({
      data: {
        title: data.title, message: data.message || data.content || null,
        avatar: data.avatar || null, link: data.link || null,
        isRead: 0, userId: BigInt(data.userId), roleId: null,
        type: data.type || 'info', createTime: dayjs().toDate(),
      },
    });
  }

  async broadcast(data: any): Promise<number> {
    if (!data.roleId) throw ServiceException.badRequest('角色 ID 不能为空');
    if (!data.title) throw ServiceException.badRequest('通知标题不能为空');
    const users = await this.prisma.sysUserRole.findMany({ where: { roleId: BigInt(data.roleId) }, select: { userId: true } });
    if (users.length === 0) return 0;
    const now = dayjs().toDate();
    await this.prisma.sysNotice.createMany({
      data: users.map((u) => ({
        title: data.title, message: data.message || data.content || null,
        avatar: data.avatar || null, link: data.link || null,
        isRead: 0, userId: u.userId, roleId: BigInt(data.roleId),
        type: data.type || 'info', createTime: now,
      })),
    });
    return users.length;
  }
}
