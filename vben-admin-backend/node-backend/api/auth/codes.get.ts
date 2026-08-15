import { defineEventHandler } from 'h3';
import { inArray } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysRoleCode } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/**
 * GET /api/auth/codes
 * 返回当前用户所有角色的权限码集合（按钮级权限控制数据源）
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const rows = await db
    .select({ code: sysRoleCode.code })
    .from(sysRoleCode)
    .where(inArray(sysRoleCode.role, userinfo.roles));

  return useResponseSuccess(rows.map((row) => row.code));
});
