import { asc, eq, inArray } from 'drizzle-orm';

import { db } from '~/db/client';
import { sysMenu, sysRoleMenu } from '~/db/schema';

/** 菜单节点输出结构（与 mock /menu/all 的返回形状严格一致） */
export interface MenuNode {
  name: string;
  path: string;
  component?: string;
  redirect?: string;
  meta: Record<string, any>;
  children?: MenuNode[];
}

/**
 * 按角色查询可见菜单并组装为树
 * 排序规则：sort 升序、id 升序（同级顺序与 mock 输出一致）
 */
export async function getMenuTreeByRoles(roles: string[]): Promise<MenuNode[]> {
  if (roles.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      component: sysMenu.component,
      id: sysMenu.id,
      meta: sysMenu.meta,
      name: sysMenu.name,
      path: sysMenu.path,
      pid: sysMenu.pid,
      redirect: sysMenu.redirect,
    })
    .from(sysMenu)
    .innerJoin(sysRoleMenu, eq(sysMenu.id, sysRoleMenu.menuId))
    .where(inArray(sysRoleMenu.role, roles))
    .orderBy(asc(sysMenu.sort), asc(sysMenu.id));

  // 同一菜单绑定多角色时会查出重复行，按 id 去重
  const seen = new Set<number>();
  const menus = rows.filter((row) =>
    seen.has(row.id) ? false : seen.add(row.id),
  );

  const build = (pid: number): MenuNode[] =>
    menus
      .filter((m) => m.pid === pid)
      .map((m) => {
        const children = build(m.id);
        const node: MenuNode = { meta: m.meta, name: m.name, path: m.path };
        if (m.component) node.component = m.component;
        if (m.redirect) node.redirect = m.redirect;
        if (children.length > 0) node.children = children;
        return node;
      });

  return build(0);
}
