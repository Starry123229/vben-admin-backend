import { defineEventHandler } from 'h3';
import { eq } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysUser } from '~/db/schema';
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
  setRefreshTokenCookie,
} from '~/utils/cookie';
import { generateAccessToken } from '~/utils/jwt';
import { rotateRefreshToken } from '~/utils/refresh-token';
import { forbiddenResponse } from '~/utils/response';

/**
 * POST /api/auth/refresh
 * 从 HttpOnly Cookie 读刷新令牌，校验并轮换，签发新 accessToken
 * 契约特殊点：本接口返回【裸 accessToken 字符串】，不套统一信封
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event);
  if (!refreshToken) {
    return forbiddenResponse(event);
  }

  clearRefreshTokenCookie(event);
  const rotated = await rotateRefreshToken(refreshToken);
  if (!rotated) {
    return forbiddenResponse(event);
  }

  const [user] = await db
    .select()
    .from(sysUser)
    .where(eq(sysUser.id, rotated.userId))
    .limit(1);
  if (!user) {
    return forbiddenResponse(event);
  }

  const accessToken = generateAccessToken({
    homePath: user.homePath ?? undefined,
    id: user.id,
    realName: user.realName,
    roles: user.roles,
    username: user.username,
  });

  setRefreshTokenCookie(event, rotated.token);
  return accessToken;
});
