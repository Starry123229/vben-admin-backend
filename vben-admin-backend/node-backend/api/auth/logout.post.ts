import { defineEventHandler } from 'h3';

import {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} from '~/utils/cookie';
import { revokeRefreshToken } from '~/utils/refresh-token';
import { useResponseSuccess } from '~/utils/response';

/**
 * POST /api/auth/logout
 * 吊销库中的刷新令牌（比 mock 只清 Cookie 更强：旧令牌立即失效）并清 Cookie
 */
export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event);
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  clearRefreshTokenCookie(event);
  return useResponseSuccess('');
});
