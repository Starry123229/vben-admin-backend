import { defineEventHandler, getRouterParam } from 'h3';
import { eq } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysDept } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

/**
 * DELETE /api/system/dept/:id
 * 删除部门：存在子部门时拒绝删除（需先删子部门）
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const id = Number(getRouterParam(event, 'id'));
  if (!Number.isInteger(id)) {
    return useResponseError('BadRequestException', 'Invalid dept id');
  }

  const [child] = await db
    .select({ id: sysDept.id })
    .from(sysDept)
    .where(eq(sysDept.pid, id))
    .limit(1);
  if (child) {
    return useResponseError('DeptHasChildren', '请先删除子部门');
  }

  await db.delete(sysDept).where(eq(sysDept.id, id));
  return useResponseSuccess(null);
});
