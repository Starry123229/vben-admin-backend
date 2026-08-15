import { defineEventHandler } from 'h3';

import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/**
 * GET /api/user/info
 * 返回当前登录用户信息（id/username/realName/roles/homePath，来自令牌载荷）
 */
export default defineEventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  return useResponseSuccess(userinfo);
});
