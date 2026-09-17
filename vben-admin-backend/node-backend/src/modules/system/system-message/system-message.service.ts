import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { PageResult, ServiceException } from '../../../common/result.js';
import dayjs from 'dayjs';

@Injectable()
export class SystemMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: bigint, page: number, pageSize: number, isRead?: number) {
    const where: any = { userId };
    if (isRead !== undefined && isRead !== null) where.isRead = isRead;
    const [items, total] = await Promise.all([
      this.prisma.sysMessage.findMany({ where, orderBy: { createTime: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.sysMessage.count({ where }),
    ]);
    return new PageResult(
      items.map((m) => ({
        id: m.id.toString(),
        userId: m.userId.toString(),
        senderId: m.senderId.toString(),
        title: m.title,
        content: m.content,
        type: m.type,
        bizId: m.bizId,
        isRead: m.isRead,
        createTime: dayjs(m.createTime).format('YYYY/MM/DD HH:mm:ss'),
      })),
      total,
    );
  }

  async unreadCount(userId: bigint): Promise<{ unread: number }> {
    const count = await this.prisma.sysMessage.count({ where: { userId, isRead: 0 } });
    return { unread: count };
  }

  async markRead(id: string, userId: bigint): Promise<void> {
    const msg = await this.prisma.sysMessage.findUnique({ where: { id: BigInt(id) } });
    if (!msg) throw ServiceException.badRequest('消息不存在');
    if (msg.userId !== userId) throw ServiceException.forbidden('无权操作此消息');
    await this.prisma.sysMessage.update({ where: { id: BigInt(id) }, data: { isRead: 1 } });
  }

  async markAllRead(userId: bigint): Promise<void> {
    await this.prisma.sysMessage.updateMany({ where: { userId, isRead: 0 }, data: { isRead: 1 } });
  }

  async send(data: { userId: number; title: string; content?: string; type?: string; email?: string }): Promise<void> {
    if (!data.userId) throw ServiceException.badRequest('用户 ID 不能为空');
    if (!data.title) throw ServiceException.badRequest('消息标题不能为空');
    await this.prisma.sysMessage.create({
      data: {
        userId: BigInt(data.userId),
        senderId: 0n,
        title: data.title,
        content: data.content || null,
        type: data.type || 'notice',
        isRead: 0,
        createTime: dayjs().toDate(),
      },
    });
  }
}
