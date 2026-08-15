import { defineEventHandler } from 'h3';
import { asc } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysDept } from '~/db/schema';
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

/** 部门树节点 */
interface DeptNode {
  id: number;
  pid: number;
  name: string;
  status: number;
  createTime: string;
  remark: string | null;
  children?: DeptNode[];
}

/**
 * GET /api/system/dept/list
 * 部门管理列表：全量部门树
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const rows = await db.select().from(sysDept).orderBy(asc(sysDept.id));

  const build = (pid: number): DeptNode[] =>
    rows
      .filter((row) => row.pid === pid)
      .map((row) => {
        const children = build(row.id);
        const node: DeptNode = {
          createTime: formatterCN.format(row.createTime),
          id: row.id,
          name: row.name,
          pid: row.pid,
          remark: row.remark,
          status: row.status,
        };
        if (children.length > 0) node.children = children;
        return node;
      });

  return useResponseSuccess(build(0));
});
