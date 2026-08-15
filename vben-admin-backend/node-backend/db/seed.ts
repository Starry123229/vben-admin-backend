/**
 * 种子数据脚本：pnpm seed
 * 数据与官方 backend-mock 完全对齐（3 用户 / 3 组权限码 / 角色化菜单树）
 * 幂等：每次执行先清空相关表再写入
 */
import { hashPassword } from '~/utils/password';

import { db } from './client';
import { sysMenu, sysRoleCode, sysRoleMenu, sysUser } from './schema';

const ROLES = ['super', 'admin', 'user'] as const;
type Role = (typeof ROLES)[number];

/** 各角色专属的 access 演示页（对应 mock 的 roleWithMenus） */
const ROLE_VARIANT: Record<Role, { component: string; name: string; path: string; title: string }> = {
  admin: { component: '/demos/access/admin-visible', name: 'AccessAdminVisibleDemo', path: '/demos/access/admin-visible', title: 'demos.access.adminVisible' },
  super: { component: '/demos/access/super-visible', name: 'AccessSuperVisibleDemo', path: '/demos/access/super-visible', title: 'demos.access.superVisible' },
  user: { component: '/demos/access/user-visible', name: 'AccessUserVisibleDemo', path: '/demos/access/user-visible', title: 'demos.access.userVisible' },
};

/** 角色权限码（对应 mock 的 MOCK_CODES） */
const ROLE_CODES: Record<Role, string[]> = {
  admin: ['AC_100010', 'AC_100020', 'AC_100030'],
  super: ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010'],
  user: ['AC_1000001', 'AC_1000002'],
};

/** 插入菜单并返回自增 id（MySQL 需用 $returningId 获取主键） */
async function insertMenu(values: typeof sysMenu.$inferInsert) {
  const [row] = await db.insert(sysMenu).values(values).$returningId();
  return row.id;
}

/** 将菜单绑定到角色 */
function bindMenu(menuId: number, roles: Role[]) {
  return db.insert(sysRoleMenu).values(roles.map((role) => ({ menuId, role })));
}

async function seed() {
  // 清空旧数据（强制全部重新登录，刷新令牌由外键语义级联清理）
  await db.delete(sysRoleMenu);
  await db.delete(sysMenu);
  await db.delete(sysRoleCode);
  await db.delete(sysUser);

  // ---- 用户（密码统一 123456，bcrypt 哈希） ----
  const password = await hashPassword('123456');
  await db.insert(sysUser).values([
    { homePath: null, password, realName: 'Vben Admin', roles: ['super'], username: 'vben' },
    { homePath: '/workspace', password, realName: 'Admin', roles: ['admin'], username: 'admin' },
    { homePath: '/analytics', password, realName: 'Jack', roles: ['user'], username: 'jack' },
  ]);

  // ---- 权限码 ----
  for (const role of ROLES) {
    await db.insert(sysRoleCode).values(
      ROLE_CODES[role].map((code) => ({ code, role })),
    );
  }

  // ---- 菜单树（结构与 mock 的 MOCK_MENUS 输出一致） ----

  // Dashboard 目录（全角色可见）
  const dashboardId = await insertMenu({ meta: { order: -1, title: 'page.dashboard.title' }, name: 'Dashboard', path: '/dashboard', redirect: '/analytics', sort: 1 });
  await bindMenu(dashboardId, [...ROLES]);

  const analyticsId = await insertMenu({ component: '/dashboard/analytics/index', meta: { affixTab: true, title: 'page.dashboard.analytics' }, name: 'Analytics', path: '/analytics', pid: dashboardId, sort: 1 });
  await bindMenu(analyticsId, [...ROLES]);

  const workspaceId = await insertMenu({ component: '/dashboard/workspace/index', meta: { title: 'page.dashboard.workspace' }, name: 'Workspace', path: '/workspace', pid: dashboardId, sort: 2 });
  await bindMenu(workspaceId, [...ROLES]);

  // Demos 目录（全角色可见；path=/demosaccess 为 mock 原始数据，保持一致）
  const demosId = await insertMenu({ meta: { icon: 'ic:baseline-view-in-ar', keepAlive: true, order: 1000, title: 'demos.title' }, name: 'Demos', path: '/demos', redirect: '/demos/access', sort: 2 });
  await bindMenu(demosId, [...ROLES]);

  const accessDemosId = await insertMenu({ meta: { icon: 'mdi:cloud-key-outline', title: 'demos.access.backendPermissions' }, name: 'AccessDemos', path: '/demosaccess', pid: demosId, redirect: '/demos/access/page-control', sort: 1 });
  await bindMenu(accessDemosId, [...ROLES]);

  const commonChildren = [
    { component: '/demos/access/index', meta: { icon: 'mdi:page-previous-outline', title: 'demos.access.pageAccess' }, name: 'AccessPageControlDemo', path: '/demos/access/page-control', sort: 1 },
    { component: '/demos/access/button-control', meta: { icon: 'mdi:button-cursor', title: 'demos.access.buttonControl' }, name: 'AccessButtonControlDemo', path: '/demos/access/button-control', sort: 2 },
    { component: '/demos/access/menu-visible-403', meta: { authority: ['no-body'], icon: 'mdi:button-cursor', menuVisibleWithForbidden: true, title: 'demos.access.menuVisible403' }, name: 'AccessMenuVisible403Demo', path: '/demos/access/menu-visible-403', sort: 3 },
  ];
  for (const child of commonChildren) {
    const id = await insertMenu({ ...child, pid: accessDemosId });
    await bindMenu(id, [...ROLES]);
  }

  // 角色专属演示页（各角色只见自己的）
  for (const role of ROLES) {
    const v = ROLE_VARIANT[role];
    const id = await insertMenu({ component: v.component, meta: { icon: 'mdi:button-cursor', title: v.title }, name: v.name, path: v.path, pid: accessDemosId, sort: 4 });
    await bindMenu(id, [role]);
  }

  console.log('Seed completed: 3 users, 3 role-code groups, menu tree');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
