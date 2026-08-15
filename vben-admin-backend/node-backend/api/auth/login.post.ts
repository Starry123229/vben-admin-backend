import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '~/db/client';
import { sysUser } from '~/db/schema';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '~/utils/cookie';
import { generateAccessToken } from '~/utils/jwt';
import { verifyPassword } from '~/utils/password';
import { issueRefreshToken } from '~/utils/refresh-token';
import { forbiddenResponse, useResponseError, useResponseSuccess } from '~/utils/response';

/** 登录参数校验：用户名密码均必填 */
const loginSchema = z.object({
  password: z.string().min(1),
  username: z.string().min(1),
});

/**
 * POST /api/auth/login
 * 成功：返回用户信息 + accessToken（信封格式），refreshToken 写入 HttpOnly Cookie
 * 失败：403（账号密码错误）；契约要求失败时同时清 Cookie
 */
export default defineEventHandler(async (event) => {
  const parsed = loginSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    setResponseStatus(event, 400);
    return useResponseError(
      'BadRequestException',
      'Username and password are required',
    );
  }
  const { password, username } = parsed.data;

  const [user] = await db
    .select()
    .from(sysUser)
    .where(eq(sysUser.username, username))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.password))) {
    clearRefreshTokenCookie(event);
    return forbiddenResponse(event, 'Username or password is incorrect.');
  }

  const payload = {
    homePath: user.homePath ?? undefined,
    id: user.id,
    realName: user.realName,
    roles: user.roles,
    username: user.username,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = await issueRefreshToken(user.id);
  setRefreshTokenCookie(event, refreshToken);

  return useResponseSuccess({ ...payload, accessToken });
});
