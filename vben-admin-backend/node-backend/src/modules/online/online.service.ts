import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import dayjs from 'dayjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class OnlineUserService {
  constructor(private readonly prisma: PrismaService) {}

  /** 在线用户列表（基于 refresh_token 表中未过期且未撤销的记录） */
  async list(username?: string): Promise<any[]> {
    // 查询所有有效的 refresh token（未过期、未撤销）
    // 不使用 include，避免外键不一致时报错
    const tokens = await this.prisma.sysRefreshToken.findMany({
      where: {
        revoked: 0,
        expiresAt: { gt: new Date() },
      },
    });

    // 批量查用户
    const userIds = [...new Set(tokens.map((t) => t.userId))];
    const users = userIds.length > 0
      ? await this.prisma.sysUser.findMany({ where: { id: { in: userIds } } })
      : [];
    const userMap = new Map(users.map((u) => [u.id.toString(), u]));

    const result = [];
    const seenUserIds = new Set<string>();

    for (const token of tokens) {
      if (seenUserIds.has(token.userId.toString())) continue;
      seenUserIds.add(token.userId.toString());

      const user = userMap.get(token.userId.toString());
      if (!user) continue; // 跳过找不到用户的记录

      if (username && !user.username.includes(username)) continue;

      result.push({
        token: token.tokenHash.substring(0, 32) + '...',
        userId: token.userId.toString(),
        username: user.username,
        loginTime: dayjs(token.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      });
    }

    return result;
  }

  /** 强制下线：撤销用户的 refresh token */
  async forceLogout(tokenOrId: string, currentUserId: string): Promise<void> {
    // 尝试按 userId 撤销
    try {
      const userId = BigInt(tokenOrId);
      if (userId === BigInt(currentUserId)) {
        throw new Error('不能强制下线当前登录账号');
      }
      await this.prisma.sysRefreshToken.updateMany({
        where: { userId },
        data: { revoked: 1 },
      });
      return;
    } catch (e) {
      if (e instanceof Error && e.message.includes('不能')) throw e;
      // 不是数字 ID，尝试按 token hash 查找
    }

    // 按 token hash 前缀匹配
    await this.prisma.sysRefreshToken.updateMany({
      where: { tokenHash: { startsWith: tokenOrId.substring(0, 32) } },
      data: { revoked: 1 },
    });
  }
}
