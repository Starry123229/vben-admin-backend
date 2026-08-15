import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';

import { db } from '~/db/client';
import { sysDept } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import {
  unAuthorizedResponse,
  useResponseError,
  useResponseSuccess,
} from '~/utils/response';

const createSchema = z.object({
  name: z.string().min(1).max(64),
  pid: z.number().int().min(0).default(0),
  remark: z.string().max(255).optional(),
  status: z.number().int().refine((v) => v === 0 || v === 1).default(1),
});

/**
 * POST /api/system/dept
 * 新建部门（真实落库；官方 mock 为演示环境直接返回）
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const parsed = createSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    return useResponseError('BadRequestException', 'Invalid dept payload');
  }

  await db.insert(sysDept).values(parsed.data);
  return useResponseSuccess(null);
});
