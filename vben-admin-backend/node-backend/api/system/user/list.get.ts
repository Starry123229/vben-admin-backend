import { defineEventHandler, getQuery } from 'h3';
import { and, asc, count, eq, gte, like, lte, type SQL } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysUser } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/** 契约要求的时间展示格式（zh-CN + 上海时区） */
const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
});

/**
 * GET /api/system/user/list
 * 用户管理列表：SQL 分页 + 多条件过滤（name 模糊 / status / deptId / 创建时间区间）
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { page = 1, pageSize = 20, name, remark, status, deptId, startTime, endTime } = getQuery(event);

  const conditions: SQL[] = [];
  if (name) {
    conditions.push(like(sysUser.username, `%${name}%`));
  }
  if (remark) {
    conditions.push(like(sysUser.remark, `%${remark}%`));
  }
  if (status === '0' || status === '1') {
    conditions.push(eq(sysUser.status, Number(status)));
  }
  if (deptId && Number.isFinite(Number(deptId))) {
    conditions.push(eq(sysUser.deptId, Number(deptId)));
  }
  const start = new Date(String(startTime));
  if (startTime && !Number.isNaN(start.getTime())) {
    conditions.push(gte(sysUser.createTime, start));
  }
  const end = new Date(String(endTime));
  if (endTime && !Number.isNaN(end.getTime())) {
    conditions.push(lte(sysUser.createTime, end));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const pageNumber = Math.max(1, Number.parseInt(String(page), 10) || 1);
  const pageSizeNumber = Math.min(
    100,
    Math.max(1, Number.parseInt(String(pageSize), 10) || 10),
  );

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(sysUser)
      .where(where)
      .orderBy(asc(sysUser.id))
      .limit(pageSizeNumber)
      .offset((pageNumber - 1) * pageSizeNumber),
    db.select({ value: count() }).from(sysUser).where(where),
  ]);

  const items = rows.map((row) => ({
    createTime: formatterCN.format(row.createTime),
    deptId: row.deptId,
    id: row.id,
    /** 契约字段 name：展示用名称 */
    name: row.username,
    remark: row.remark,
    status: row.status,
  }));

  return useResponseSuccess({ items, total: totalRow.value });
});
