import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '~/db/client';
import { sysDept } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

const updateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  pid: z.number().int().min(0).optional(),
  remark: z.string().max(255).optional(),
  status: z.number().int().refine((v) => v === 0 || v === 1).optional(),
});

/**
 * PUT /api/system/dept/:id
 * 更新部门（真实落库）
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

  const parsed = updateSchema.safeParse(await readBody(event));
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return useResponseError('BadRequestException', 'Invalid dept payload');
  }

  // 不允许把部门挂到自己名下形成环
  if (parsed.data.pid === id) {
    return useResponseError('BadRequestException', 'Parent cannot be itself');
  }

  await db.update(sysDept).set(parsed.data).where(eq(sysDept.id, id));
  return useResponseSuccess(null);
});
