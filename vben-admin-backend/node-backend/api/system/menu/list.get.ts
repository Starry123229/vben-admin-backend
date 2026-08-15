import { defineEventHandler } from 'h3';
import { asc } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysMenu } from '~/db/schema';
import { verifyAccessToken } from '~/utils/jwt';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/** 菜单管理树节点（含按钮级权限节点） */
interface MgmtMenuNode {
  id: number;
  pid?: number;
  name: string;
  status: number;
  type: string;
  path: string;
  component?: string;
  authCode?: string;
  meta: Record<string, any>;
  children?: MgmtMenuNode[];
}

/**
 * GET /api/system/menu/list
 * 菜单管理列表：返回全量菜单树（含 catalog/menu/button/embedded/link 全部类型）
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const rows = await db
    .select()
    .from(sysMenu)
    .orderBy(asc(sysMenu.sort), asc(sysMenu.id));

  const build = (pid: number): MgmtMenuNode[] =>
    rows
      .filter((row) => row.pid === pid)
      .map((row) => {
        const children = build(row.id);
        const node: MgmtMenuNode = {
          id: row.id,
          meta: row.meta,
          name: row.name,
          path: row.path,
          status: row.status,
          type: row.type,
        };
        if (row.pid !== 0) node.pid = row.pid;
        if (row.component) node.component = row.component;
        if (row.authCode) node.authCode = row.authCode;
        if (children.length > 0) node.children = children;
        return node;
      });

  return useResponseSuccess(build(0));
});
