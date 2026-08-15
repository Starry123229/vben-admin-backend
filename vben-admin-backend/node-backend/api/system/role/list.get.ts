import { defineEventHandler, getQuery } from 'h3';
import { and, asc, count, eq, gte, like, lte, type SQL } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysRole, sysRoleMenu } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

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
 * GET /api/system/role/list
 * 角色管理列表：SQL 分页 + 过滤，permissions 为该角色绑定的导航菜单 id 集合
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { page = 1, pageSize = 20, name, remark, status, startTime, endTime } = getQuery(event);

  const conditions: SQL[] = [];
  if (name) {
    conditions.push(like(sysRole.name, `%${name}%`));
  }
  if (remark) {
    conditions.push(like(sysRole.remark, `%${remark}%`));
  }
  if (status === '0' || status === '1') {
    conditions.push(eq(sysRole.status, Number(status)));
  }
  const start = new Date(String(startTime));
  if (startTime && !Number.isNaN(start.getTime())) {
    conditions.push(gte(sysRole.createTime, start));
  }
  const end = new Date(String(endTime));
  if (endTime && !Number.isNaN(end.getTime())) {
    conditions.push(lte(sysRole.createTime, end));
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
      .from(sysRole)
      .where(where)
      .orderBy(asc(sysRole.id))
      .limit(pageSizeNumber)
      .offset((pageNumber - 1) * pageSizeNumber),
    db.select({ value: count() }).from(sysRole).where(where),
  ]);

  // 批量取各角色的菜单绑定，组装 permissions（菜单 id 列表）
  const binds = await db
    .select({ menuId: sysRoleMenu.menuId, role: sysRoleMenu.role })
    .from(sysRoleMenu);
  const permissionMap = new Map<string, number[]>();
  for (const bind of binds) {
    const list = permissionMap.get(bind.role) ?? [];
    list.push(bind.menuId);
    permissionMap.set(bind.role, list);
  }

  const items = rows.map((row) => ({
    createTime: formatterCN.format(row.createTime),
    id: row.id,
    name: row.name,
    permissions: permissionMap.get(row.code) ?? [],
    remark: row.remark,
    status: row.status,
  }));

  return useResponseSuccess({ items, total: totalRow.value });
});
