import { defineEventHandler, getQuery } from 'h3';
import { eq } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysMenu } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/**
 * GET /api/system/menu/name-exists?name=X&id=Y
 * 菜单名唯一性校验：name 已存在且不属于当前 id 时返回 true
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id, name } = getQuery(event);
  if (!name) {
    return useResponseSuccess(false);
  }

  const [row] = await db
    .select({ id: sysMenu.id })
    .from(sysMenu)
    .where(eq(sysMenu.name, String(name)))
    .limit(1);

  return useResponseSuccess(Boolean(row && String(row.id) !== String(id ?? '')));
});
