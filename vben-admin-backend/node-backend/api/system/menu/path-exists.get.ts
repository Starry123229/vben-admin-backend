import { defineEventHandler, getQuery } from 'h3';
import { eq } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysMenu } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/**
 * GET /api/system/menu/path-exists?path=X&id=Y
 * 菜单路径唯一性校验（根路径 '/' 视为已占用，与官方 mock 行为一致）
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id, path } = getQuery(event);
  if (!path) {
    return useResponseSuccess(false);
  }
  if (path === '/') {
    return useResponseSuccess(true);
  }

  const [row] = await db
    .select({ id: sysMenu.id })
    .from(sysMenu)
    .where(eq(sysMenu.path, String(path)))
    .limit(1);

  return useResponseSuccess(Boolean(row && String(row.id) !== String(id ?? '')));
});
