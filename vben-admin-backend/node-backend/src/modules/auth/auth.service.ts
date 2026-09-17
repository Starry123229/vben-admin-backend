import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ServiceException } from '../../common/result.js';
import { comparePassword, hashPassword } from '../../common/utils/password.js';
import { signAccessToken, generateRefreshToken, sha256 } from '../../common/utils/jwt.js';
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from '../../common/utils/cookie.js';
import { getClientIp, parseBrowser, parseOs } from '../../common/utils/ua.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';
import dayjs from 'dayjs';

/**
 * 认证服务（对标 Java 端 AuthService）
 *
 * accessToken：JWT（Authorization: Bearer 头，2h）
 * refreshToken：自管随机串（SHA-256 入库、HttpOnly Cookie「jwt」下发、每次刷新轮换）
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly prisma: PrismaService) {}

  /** 登录：校验凭据 → 签发双 token */
  async login(username: string, password: string, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    if (!username || !password) {
      throw ServiceException.badRequest('Username and password are required');
    }

    const user = await this.prisma.sysUser.findFirst({
      where: { username },
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      await this.recordLoginLog(user?.id ?? null, username, request, 'account', 0, '用户名或密码错误');
      throw ServiceException.forbidden('Username or password is incorrect.');
    }

    return this.loginByUserId(user.id, request, reply);
  }

  /** 按用户 ID 直接签发双 token（注册/手机号/二维码/第三方登录复用） */
  async loginByUserId(userId: bigint, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    const user = await this.prisma.sysUser.findUnique({ where: { id: userId } });
    if (!user) throw ServiceException.forbidden('账号不存在');
    if (user.status === 0) throw ServiceException.forbidden('该账号已被禁用，请联系管理员');

    await this.issueRefreshToken(userId, reply);
    await this.recordLoginLog(userId, user.username, request, 'account', 1, '登录成功');
    return signAccessToken(user.id);
  }

  /** 刷新 accessToken：校验 Cookie 中 refreshToken → 轮换 → 返回裸 token 字符串 */
  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<string> {
    const token = readRefreshCookie(request);
    if (!token) {
      clearRefreshCookie(reply);
      throw ServiceException.forbidden();
    }

    const record = await this.prisma.sysRefreshToken.findUnique({
      where: { tokenHash: sha256(token) },
    });

    const invalid = !record || record.revoked === 1 || record.expiresAt < new Date();
    if (invalid) {
      clearRefreshCookie(reply);
      throw ServiceException.forbidden();
    }

    // 轮换：作废旧 refresh，签发新的
    await this.prisma.sysRefreshToken.update({
      where: { id: record.id },
      data: { revoked: 1 },
    });
    await this.issueRefreshToken(record.userId, reply);

    const user = await this.prisma.sysUser.findUnique({ where: { id: record.userId } });
    if (!user || user.status === 0) {
      throw ServiceException.forbidden('该账号已被禁用，请联系管理员');
    }

    return signAccessToken(user.id);
  }

  /** 登出：作废 refresh、清理 Cookie；恒成功 */
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const token = readRefreshCookie(request);
    if (token) {
      const record = await this.prisma.sysRefreshToken.findUnique({
        where: { tokenHash: sha256(token) },
      });
      if (record) {
        await this.prisma.sysRefreshToken.update({
          where: { id: record.id },
          data: { revoked: 1 },
        });
      }
    }
    clearRefreshCookie(reply);
  }

  /** 当前用户权限码 */
  async getCodes(userId: bigint): Promise<string[]> {
    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId },
      include: { role: true },
    });

    if (userRoles.length === 0) return [];

    const activeRoles = userRoles
      .map((ur) => ur.role)
      .filter((r) => r.status === 1);

    if (activeRoles.length === 0) return [];

    // 超级管理员拥有全部权限码
    const isSuper = activeRoles.some((r) => r.code === 'super');
    if (isSuper) {
      const buttons = await this.prisma.sysMenu.findMany({
        where: { type: 'button', status: 1, NOT: { authCode: null } },
      });
      return [...new Set(buttons.map((m) => m.authCode))];
    }

    const activeRoleIds = activeRoles.map((r) => r.id);
    const roleMenus = await this.prisma.sysRoleMenu.findMany({
      where: { roleId: { in: activeRoleIds } },
      include: { menu: true },
    });

    const codes = roleMenus
      .map((rm) => rm.menu)
      .filter((m) => m.type === 'button' && m.status === 1 && m.authCode)
      .map((m) => m.authCode);

    return [...new Set(codes)];
  }

  /** 当前用户角色编码列表 */
  async getRoleCodes(userId: bigint): Promise<string[]> {
    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId },
      include: { role: true },
    });

    if (userRoles.length === 0) return [];

    return userRoles
      .map((ur) => ur.role)
      .filter((r) => r.status === 1)
      .map((r) => r.code);
  }

  // ============================== 扩展认证方法

  /** 注册：创建用户 → 自动分配 user 角色 → 签发双 token */
  async register(data: { username: string; password: string; realName?: string; phone?: string; email?: string }, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    if (!data.username || !data.password) throw ServiceException.badRequest('用户名和密码不能为空');
    const dup = await this.prisma.sysUser.count({ where: { username: data.username } });
    if (dup > 0) throw ServiceException.badRequest('用户名已存在');

    const passwordHash = await hashPassword(data.password);
    const now = dayjs().toDate();
    const user = await this.prisma.sysUser.create({
      data: {
        username: data.username, passwordHash,
        realName: data.realName || null, phone: data.phone || null, email: data.email || null,
        status: 1, createTime: now, updateTime: now,
      },
    });

    // 自动分配 user 角色
    const userRole = await this.prisma.sysRole.findUnique({ where: { code: 'user' } });
    if (userRole) {
      await this.prisma.sysUserRole.create({ data: { userId: user.id, roleId: userRole.id } });
    }

    return this.loginByUserId(user.id, request, reply);
  }

  /** 发送短信验证码（开发期返回 mockCode） */
  async sendSms(phone: string): Promise<{ mockCode: string | null }> {
    if (!phone) throw ServiceException.badRequest('手机号不能为空');
    // 开发期返回固定验证码
    const mockCode = '123456';
    return { mockCode };
  }

  /** 手机号 + 验证码登录（新手机号自动注册） */
  async phoneLogin(phone: string, code: string, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    if (!phone || !code) throw ServiceException.badRequest('手机号和验证码不能为空');
    // 开发期验证码固定为 123456
    if (code !== '123456') throw ServiceException.badRequest('验证码错误');

    let user = await this.prisma.sysUser.findUnique({ where: { phone } });
    if (!user) {
      // 自动注册
      if (process.env.PHONE_AUTO_REGISTER === 'false') {
        throw ServiceException.badRequest('该手机号未注册，请使用账号密码登录');
      }
      const now = dayjs().toDate();
      const passwordHash = await hashPassword(randomBytes(8).toString('hex'));
      user = await this.prisma.sysUser.create({
        data: { username: `phone_${phone}`, passwordHash, phone, status: 1, createTime: now, updateTime: now },
      });
      const userRole = await this.prisma.sysRole.findUnique({ where: { code: 'user' } });
      if (userRole) await this.prisma.sysUserRole.create({ data: { userId: user.id, roleId: userRole.id } });
    }
    if (user.status === 0) throw ServiceException.forbidden('该账号已被禁用');
    await this.recordLoginLog(user.id, user.username, request, 'phone', 1, '手机号登录成功');
    return this.loginByUserId(user.id, request, reply);
  }

  // 二维码登录状态（内存存储）
  private qrTickets = new Map<string, { status: string; userId?: bigint; createdAt: number }>();

  /** 生成二维码 ticket */
  async createQrTicket(): Promise<{ ticket: string; status: string }> {
    const ticket = randomBytes(16).toString('hex');
    this.qrTickets.set(ticket, { status: 'pending', createdAt: Date.now() });
    // 自动过期 5 分钟
    setTimeout(() => { const t = this.qrTickets.get(ticket); if (t && t.status === 'pending') this.qrTickets.delete(ticket); }, 5 * 60 * 1000);
    return { ticket, status: 'pending' };
  }

  /** 轮询二维码状态 */
  async pollQrTicket(ticket: string, request: FastifyRequest, reply: FastifyReply): Promise<{ ticket: string; status: string; accessToken?: string }> {
    const t = this.qrTickets.get(ticket);
    if (!t) throw ServiceException.badRequest('ticket 无效或已过期');
    if (t.status === 'pending') return { ticket, status: 'pending' };
    if (t.status === 'scanned') return { ticket, status: 'scanned' };
    if (t.status === 'confirmed' && t.userId) {
      const accessToken = signAccessToken(t.userId);
      await this.issueRefreshToken(t.userId, reply);
      const user = await this.prisma.sysUser.findUnique({ where: { id: t.userId } });
      if (user) await this.recordLoginLog(user.id, user.username, request, 'qrcode', 1, '二维码登录成功');
      this.qrTickets.delete(ticket);
      return { ticket, status: 'confirmed', accessToken };
    }
    return { ticket, status: 'pending' };
  }

  /** 模拟扫码（开发期用，将 ticket 状态改为 scanned + confirmed） */
  async scanQrTicket(ticket: string, userId: bigint): Promise<void> {
    const t = this.qrTickets.get(ticket);
    if (!t) throw ServiceException.badRequest('ticket 无效');
    t.status = 'confirmed';
    t.userId = userId;
  }

  /** 获取 OAuth 授权 URL */
  getOAuthUrl(provider: string): { url: string } {
    // mock：返回一个示例 URL
    return { url: `https://oauth.example.com/${provider}?client_id=mock&redirect_uri=${encodeURIComponent('http://localhost:5173/auth/callback')}` };
  }

  /** OAuth 回调登录（mock：自动创建或绑定用户） */
  async oauthCallback(provider: string, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    // mock：以 oauth_{provider} 为用户名查找或创建
    const username = `oauth_${provider}`;
    let user = await this.prisma.sysUser.findFirst({ where: { username } });
    if (!user) {
      if (process.env.OAUTH_AUTO_REGISTER === 'false') {
        throw ServiceException.badRequest('该第三方账号未绑定系统用户');
      }
      const now = dayjs().toDate();
      const passwordHash = await hashPassword(randomBytes(8).toString('hex'));
      user = await this.prisma.sysUser.create({
        data: { username, passwordHash, status: 1, createTime: now, updateTime: now },
      });
      const userRole = await this.prisma.sysRole.findUnique({ where: { code: 'user' } });
      if (userRole) await this.prisma.sysUserRole.create({ data: { userId: user.id, roleId: userRole.id } });
    }
    await this.recordLoginLog(user.id, user.username, request, `oauth:${provider}`, 1, `${provider} OAuth 登录成功`);
    return this.loginByUserId(user.id, request, reply);
  }

  /** 发送密码重置验证码 */
  async sendResetCode(email: string): Promise<{ mockCode: string | null }> {
    if (!email) throw ServiceException.badRequest('邮箱不能为空');
    return { mockCode: '123456' };
  }

  /** 重置密码 */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    if (!email || !code) throw ServiceException.badRequest('邮箱和验证码不能为空');
    if (code !== '123456') throw ServiceException.badRequest('验证码错误');
    if (!newPassword) throw ServiceException.badRequest('新密码不能为空');
    const user = await this.prisma.sysUser.findFirst({ where: { email } });
    if (!user) throw ServiceException.badRequest('用户不存在');
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.sysUser.update({ where: { id: user.id }, data: { passwordHash, updateTime: dayjs().toDate() } });
  }

  // ---------------------------------------------------------------------------- 私有方法

  /** 生成随机 refreshToken，SHA-256 入库，并写入 HttpOnly Cookie */
  private async issueRefreshToken(userId: bigint, reply: FastifyReply): Promise<void> {
    const token = generateRefreshToken();
    const refreshDays = Number(process.env.REFRESH_TOKEN_DAYS || 7);

    await this.prisma.sysRefreshToken.create({
      data: {
        userId,
        tokenHash: sha256(token),
        expiresAt: dayjs().add(refreshDays, 'day').toDate(),
        revoked: 0,
      },
    });

    setRefreshCookie(reply, token);
  }

  /** 记录登录日志 */
  private async recordLoginLog(
    userId: bigint | null,
    username: string,
    request: FastifyRequest,
    loginType: string,
    status: number,
    message: string,
  ): Promise<void> {
    try {
      const userAgent = (request.headers['user-agent'] as string) || '';
      await this.prisma.sysLoginLog.create({
        data: {
          userId,
          username,
          ip: getClientIp(request),
          browser: parseBrowser(userAgent),
          os: parseOs(userAgent),
          status,
          message,
          loginType,
        },
      });
    } catch (e) {
      // 日志记录失败不影响主流程
      this.logger.warn(`记录登录日志失败: ${(e as Error).message}`);
    }
  }
}
