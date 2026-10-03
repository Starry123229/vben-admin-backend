import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ServiceException } from '../../common/result.js';
import { comparePassword, hashPassword } from '../../common/utils/password.js';
import { signAccessToken, generateRefreshToken, sha256 } from '../../common/utils/jwt.js';
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from '../../common/utils/cookie.js';
import { getClientIp, parseBrowser, parseOs } from '../../common/utils/ua.js';
import { RedisService } from '../../common/redis/redis.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';
import dayjs from 'dayjs';

/**
 * 认证服务（对标 Java 端 AuthService）
 *
 * accessToken：JWT（Authorization: Bearer 头，2h）
 * refreshToken：自管随机串（SHA-256 入库、HttpOnly Cookie「jwt」下发、每次刷新轮换）
 *
 * Redis 场景：登录失败锁定、验证码存储、二维码会话、登录限流、用户/权限缓存
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================== 登录失败锁定（Redis 实现，多实例共享）
  // 参数：默认 5 次失败锁定 30 分钟（与 Java 端对齐）
  private static readonly LOGIN_MAX_FAIL = 5;
  private static readonly LOGIN_LOCK_MINUTES = 30;
  private static readonly LOGIN_FAIL_WINDOW_SECONDS = 30 * 60; // 30 分钟窗口

  /** 校验账号是否锁定 */
  private async checkUserLock(username: string): Promise<void> {
    const lockKey = `login:lock:${username}`;
    const locked = await this.redis.getRaw(lockKey);
    if (locked) {
      const ttl = await this.redis.getTtl(lockKey);
      const minutesLeft = ttl > 0 ? Math.ceil(ttl / 60) : 1;
      throw ServiceException.badRequest(`失败次数过多，账号已锁定，请 ${minutesLeft} 分钟后再试`);
    }
  }

  /** 记录登录失败 */
  private async recordLoginFail(username: string): Promise<void> {
    const failKey = `login:fail:${username}`;
    const count = await this.redis.incr(failKey, AuthService.LOGIN_FAIL_WINDOW_SECONDS);
    if (count >= AuthService.LOGIN_MAX_FAIL) {
      await this.redis.set(`login:lock:${username}`, '1', AuthService.LOGIN_LOCK_MINUTES * 60);
      await this.redis.del(failKey);
      this.logger.warn(`账号 [${username}] 连续登录失败达 ${AuthService.LOGIN_MAX_FAIL} 次，锁定 ${AuthService.LOGIN_LOCK_MINUTES} 分钟`);
    }
  }

  /** 登录成功后清除失败计数 */
  private async clearLoginFail(username: string): Promise<void> {
    await this.redis.del(`login:fail:${username}`);
  }

  // ============================== 登录限流（Redis 实现，多实例共享）
  // 同一 IP 1 分钟内最多 10 次登录请求
  private static readonly RATE_LIMIT_MAX = 10;
  private static readonly RATE_LIMIT_WINDOW = 60; // 秒

  /** 登录限流校验 */
  private async checkRateLimit(request: FastifyRequest): Promise<void> {
    const ip = getClientIp(request);
    const key = `rate:login:${ip}`;
    const count = await this.redis.incr(key, AuthService.RATE_LIMIT_WINDOW);
    if (count > AuthService.RATE_LIMIT_MAX) {
      throw ServiceException.badRequest('登录尝试过于频繁，请1分钟后再试');
    }
  }

  // ============================== 核心认证方法

  /** 登录：校验凭据 → 签发双 token（含限流 + 失败锁定） */
  async login(username: string, password: string, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    if (!username || !password) {
      throw ServiceException.badRequest('Username and password are required');
    }

    // 登录限流
    await this.checkRateLimit(request);

    // 账号锁定校验
    await this.checkUserLock(username);

    const user = await this.prisma.sysUser.findFirst({
      where: { username },
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      await this.recordLoginFail(username);
      await this.recordLoginLog(user?.id ?? null, username, request, 'account', 0, '用户名或密码错误');
      throw ServiceException.forbidden('Username or password is incorrect.');
    }

    await this.clearLoginFail(username);
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

  /** 登出：作废 refresh、清理 Cookie、将 accessToken 加入黑名单；恒成功 */
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // 将 accessToken 加入 Redis 黑名单（TTL 与 token 过期时间对齐）
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);
      // JWT 默认 2h 过期，设置黑名单 TTL 为 7200 秒
      const accessTokenTtl = Number(process.env.ACCESS_TOKEN_EXPIRES_HOURS || 2) * 3600;
      await this.redis.set(`token:blacklist:${accessToken}`, '1', accessTokenTtl);
    }

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

  /** 当前用户权限码（Redis 缓存，TTL 10 分钟） */
  async getCodes(userId: bigint): Promise<string[]> {
    const cacheKey = `user:codes:${userId.toString()}`;
    const cached = await this.redis.get<string[]>(cacheKey);
    if (cached) return cached;

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
    let result: string[];
    if (isSuper) {
      const buttons = await this.prisma.sysMenu.findMany({
        where: { type: 'button', status: 1, NOT: { authCode: null } },
      });
      result = [...new Set(buttons.map((m) => m.authCode))];
    } else {
      const activeRoleIds = activeRoles.map((r) => r.id);
      const roleMenus = await this.prisma.sysRoleMenu.findMany({
        where: { roleId: { in: activeRoleIds } },
        include: { menu: true },
      });

      result = [...new Set(
        roleMenus
          .map((rm) => rm.menu)
          .filter((m) => m.type === 'button' && m.status === 1 && m.authCode)
          .map((m) => m.authCode)
      )];
    }

    await this.redis.set(cacheKey, result, 600); // 10 分钟
    return result;
  }

  /** 当前用户角色编码列表（Redis 缓存，TTL 10 分钟） */
  async getRoleCodes(userId: bigint): Promise<string[]> {
    const cacheKey = `user:roles:${userId.toString()}`;
    const cached = await this.redis.get<string[]>(cacheKey);
    if (cached) return cached;

    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId },
      include: { role: true },
    });

    if (userRoles.length === 0) return [];

    const result = userRoles
      .map((ur) => ur.role)
      .filter((r) => r.status === 1)
      .map((r) => r.code);

    await this.redis.set(cacheKey, result, 600); // 10 分钟
    return result;
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

  // ============================== 验证码存储（Redis 实现，TTL 5 分钟）

  /** 生成 6 位验证码并存储到 Redis */
  private generateCode(): string {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  }

  /** 发送短信验证码（开发期返回 mockCode） */
  async sendSms(phone: string): Promise<{ mockCode: string | null }> {
    if (!phone) throw ServiceException.badRequest('手机号不能为空');
    const code = this.generateCode();
    await this.redis.set(`code:sms:${phone}`, code, 300); // 5 分钟
    return { mockCode: code };
  }

  /** 校验验证码（成功后即作废） */
  private async verifyCode(key: string, code: string): Promise<boolean> {
    const stored = await this.redis.getRaw(key);
    if (!stored || stored !== code) return false;
    await this.redis.del(key);
    return true;
  }

  /** 手机号 + 验证码登录（新手机号自动注册） */
  async phoneLogin(phone: string, code: string, request: FastifyRequest, reply: FastifyReply): Promise<string> {
    if (!phone || !code) throw ServiceException.badRequest('手机号和验证码不能为空');

    // 登录限流
    await this.checkRateLimit(request);

    if (!await this.verifyCode(`code:sms:${phone}`, code)) {
      throw ServiceException.badRequest('验证码错误或已过期');
    }

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

  // ============================== 二维码登录会话（Redis 实现，TTL 5 分钟）

  /** 生成二维码 ticket */
  async createQrTicket(): Promise<{ ticket: string; status: string }> {
    const ticket = randomBytes(16).toString('hex');
    await this.redis.set(`qr:ticket:${ticket}`, { status: 'pending' }, 300); // 5 分钟
    return { ticket, status: 'pending' };
  }

  /** 轮询二维码状态 */
  async pollQrTicket(ticket: string, request: FastifyRequest, reply: FastifyReply): Promise<{ ticket: string; status: string; accessToken?: string }> {
    const session = await this.redis.get<{ status: string; userId?: string; accessToken?: string }>(`qr:ticket:${ticket}`);
    if (!session) throw ServiceException.badRequest('ticket 无效或已过期');
    if (session.status === 'pending') return { ticket, status: 'pending' };
    if (session.status === 'scanned') return { ticket, status: 'scanned' };
    if (session.status === 'confirmed' && session.userId) {
      const userId = BigInt(session.userId);
      const accessToken = signAccessToken(userId);
      await this.issueRefreshToken(userId, reply);
      const user = await this.prisma.sysUser.findUnique({ where: { id: userId } });
      if (user) await this.recordLoginLog(user.id, user.username, request, 'qrcode', 1, '二维码登录成功');
      await this.redis.del(`qr:ticket:${ticket}`);
      return { ticket, status: 'confirmed', accessToken };
    }
    return { ticket, status: 'pending' };
  }

  /** 模拟扫码（开发期用，将 ticket 状态改为 confirmed） */
  async scanQrTicket(ticket: string, userId: bigint): Promise<void> {
    const session = await this.redis.get<{ status: string; userId?: string }>(`qr:ticket:${ticket}`);
    if (!session) throw ServiceException.badRequest('ticket 无效');
    session.status = 'confirmed';
    session.userId = userId.toString();
    await this.redis.set(`qr:ticket:${ticket}`, session, 300); // 刷新 TTL
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

  /** 发送密码重置验证码（Redis 存储，TTL 5 分钟） */
  async sendResetCode(email: string): Promise<{ mockCode: string | null }> {
    if (!email) throw ServiceException.badRequest('邮箱不能为空');
    const code = this.generateCode();
    await this.redis.set(`code:reset:${email}`, code, 300); // 5 分钟
    return { mockCode: code };
  }

  /** 重置密码 */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    if (!email || !code) throw ServiceException.badRequest('邮箱和验证码不能为空');
    if (!await this.verifyCode(`code:reset:${email}`, code)) {
      throw ServiceException.badRequest('验证码错误或已过期');
    }
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
