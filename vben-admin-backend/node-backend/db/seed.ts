/**
 * 种子数据脚本：pnpm seed
 * 数据与官方 backend-mock 完全对齐：
 * - 3 用户 / 3 角色 / 3 组权限码 / 角色化导航菜单树（/menu/all 数据源）
 * - 部门树 + 菜单管理数据集（/system/dept、/system/menu/list 数据源）
 * 幂等：每次执行先清空相关表再写入
 */
import { hashPassword } from '~/utils/password';

import { db } from './client';
import {
  sysDept,
  sysMenu,
  sysRole,
  sysRoleCode,
  sysRoleMenu,
  sysUser,
} from './schema';

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

/** 插入菜单并返回自增 id */
async function insertMenu(values: typeof sysMenu.$inferInsert) {
  const [row] = await db.insert(sysMenu).values(values).$returningId();
  return row.id;
}

/** 将导航菜单绑定到角色（管理菜单不绑定，仅出现在 /system/menu/list） */
function bindMenu(menuId: number, roles: Role[]) {
  return db.insert(sysRoleMenu).values(roles.map((role) => ({ menuId, role })));
}

async function seed() {
  // 清空旧数据
  await db.delete(sysRoleMenu);
  await db.delete(sysMenu);
  await db.delete(sysRoleCode);
  await db.delete(sysRole);
  await db.delete(sysDept);
  await db.delete(sysUser);

  // ---- 部门树 ----
  const [hq] = await db.insert(sysDept).values({ name: '总部', pid: 0, remark: '公司总部' }).$returningId();
  const [sh] = await db.insert(sysDept).values({ name: '上海分公司', pid: hq.id, remark: '华东区' }).$returningId();
  await db.insert(sysDept).values({ name: '研发部', pid: sh.id, remark: '前端组' });
  await db.insert(sysDept).values({ name: '市场部', pid: sh.id, remark: '华东市场' });

  // ---- 角色 ----
  await db.insert(sysRole).values([
    { code: 'super', name: '超级管理员', remark: '拥有全部权限' },
    { code: 'admin', name: '管理员', remark: '管理日常事务' },
    { code: 'user', name: '普通用户', remark: '只读权限' },
  ]);

  // ---- 用户（密码统一 123456，bcrypt 哈希） ----
  const password = await hashPassword('123456');
  await db.insert(sysUser).values([
    { deptId: sh.id, homePath: null, password, realName: 'Vben Admin', remark: '超级管理员账号', roles: ['super'], username: 'vben' },
    { deptId: hq.id, homePath: '/workspace', password, realName: 'Admin', remark: '管理员账号', roles: ['admin'], username: 'admin' },
    { deptId: sh.id, homePath: '/analytics', password, realName: 'Jack', remark: '普通用户账号', roles: ['user'], username: 'jack' },
  ]);

  // ---- 权限码 ----
  for (const role of ROLES) {
    await db.insert(sysRoleCode).values(
      ROLE_CODES[role].map((code) => ({ code, role })),
    );
  }

  // ---- 导航菜单树（/menu/all 数据源，结构与 mock 的 MOCK_MENUS 一致） ----

  // Dashboard 目录（全角色可见）
  const dashboardId = await insertMenu({ meta: { order: -1, title: 'page.dashboard.title' }, name: 'Dashboard', path: '/dashboard', redirect: '/analytics', sort: 1, type: 'catalog' });
  await bindMenu(dashboardId, [...ROLES]);

  const analyticsId = await insertMenu({ component: '/dashboard/analytics/index', meta: { affixTab: true, title: 'page.dashboard.analytics' }, name: 'Analytics', path: '/analytics', pid: dashboardId, sort: 1, type: 'menu' });
  await bindMenu(analyticsId, [...ROLES]);

  const workspaceNavId = await insertMenu({ component: '/dashboard/workspace/index', meta: { title: 'page.dashboard.workspace' }, name: 'Workspace', path: '/workspace', pid: dashboardId, sort: 2, type: 'menu' });
  await bindMenu(workspaceNavId, [...ROLES]);

  // Demos 目录（全角色可见；path=/demosaccess 为 mock 原始数据，保持一致）
  const demosId = await insertMenu({ meta: { icon: 'ic:baseline-view-in-ar', keepAlive: true, order: 1000, title: 'demos.title' }, name: 'Demos', path: '/demos', redirect: '/demos/access', sort: 2, type: 'catalog' });
  await bindMenu(demosId, [...ROLES]);

  const accessDemosId = await insertMenu({ meta: { icon: 'mdi:cloud-key-outline', title: 'demos.access.backendPermissions' }, name: 'AccessDemos', path: '/demosaccess', pid: demosId, redirect: '/demos/access/page-control', sort: 1, type: 'catalog' });
  await bindMenu(accessDemosId, [...ROLES]);

  const commonChildren = [
    { component: '/demos/access/index', meta: { icon: 'mdi:page-previous-outline', title: 'demos.access.pageAccess' }, name: 'AccessPageControlDemo', path: '/demos/access/page-control', sort: 1, type: 'menu' },
    { component: '/demos/access/button-control', meta: { icon: 'mdi:button-cursor', title: 'demos.access.buttonControl' }, name: 'AccessButtonControlDemo', path: '/demos/access/button-control', sort: 2, type: 'menu' },
    { component: '/demos/access/menu-visible-403', meta: { authority: ['no-body'], icon: 'mdi:button-cursor', menuVisibleWithForbidden: true, title: 'demos.access.menuVisible403' }, name: 'AccessMenuVisible403Demo', path: '/demos/access/menu-visible-403', sort: 3, type: 'menu' },
  ] as const;
  for (const child of commonChildren) {
    const id = await insertMenu({ ...child, pid: accessDemosId });
    await bindMenu(id, [...ROLES]);
  }

  // 角色专属演示页（各角色只见自己的）
  for (const role of ROLES) {
    const v = ROLE_VARIANT[role];
    const id = await insertMenu({ component: v.component, meta: { icon: 'mdi:button-cursor', title: v.title }, name: v.name, path: v.path, pid: accessDemosId, sort: 4, type: 'menu' });
    await bindMenu(id, [role]);
  }

  // ---- 菜单管理数据集（/system/menu/list 数据源，不绑定角色、不进导航） ----
  // 结构与 mock 的 MOCK_MENU_LIST 一致（Workspace / System+按钮 / Project / About）

  await insertMenu({ component: '/dashboard/workspace/index', meta: { affixTab: true, icon: 'carbon:workspace', order: 0, title: 'page.dashboard.workspace' }, name: 'Workspace', path: '/workspace', sort: 1, type: 'menu' });

  const sysCatalogId = await insertMenu({ meta: { badge: 'new', badgeType: 'normal', badgeVariants: 'primary', icon: 'carbon:settings', order: 9997, title: 'system.title' }, name: 'System', path: '/system', sort: 2, type: 'catalog' });

  const sysMenuId = await insertMenu({ authCode: 'System:Menu:List', component: '/system/menu/list', meta: { icon: 'carbon:menu', title: 'system.menu.title' }, name: 'SystemMenu', path: '/system/menu', pid: sysCatalogId, sort: 1, type: 'menu' });
  const menuButtons = [
    { authCode: 'System:Menu:Create', name: 'SystemMenuCreate', title: 'common.create' },
    { authCode: 'System:Menu:Edit', name: 'SystemMenuEdit', title: 'common.edit' },
    { authCode: 'System:Menu:Delete', name: 'SystemMenuDelete', title: 'common.delete' },
  ];
  for (const btn of menuButtons) {
    await insertMenu({ authCode: btn.authCode, meta: { title: btn.title }, name: btn.name, path: '', pid: sysMenuId, type: 'button' });
  }

  const sysDeptId = await insertMenu({ authCode: 'System:Dept:List', component: '/system/dept/list', meta: { icon: 'carbon:container-services', title: 'system.dept.title' }, name: 'SystemDept', path: '/system/dept', pid: sysCatalogId, sort: 2, type: 'menu' });
  const deptButtons = [
    { authCode: 'System:Dept:Create', name: 'SystemDeptCreate', title: 'common.create' },
    { authCode: 'System:Dept:Edit', name: 'SystemDeptEdit', title: 'common.edit' },
    { authCode: 'System:Dept:Delete', name: 'SystemDeptDelete', title: 'common.delete' },
  ];
  for (const btn of deptButtons) {
    await insertMenu({ authCode: btn.authCode, meta: { title: btn.title }, name: btn.name, path: '', pid: sysDeptId, type: 'button' });
  }

  const projectId = await insertMenu({ meta: { badgeType: 'dot', icon: 'carbon:data-center', order: 9998, title: 'demos.vben.title' }, name: 'Project', path: '/vben-admin', sort: 3, type: 'catalog' });
  await insertMenu({ component: 'IFrameView', meta: { icon: 'carbon:book', iframeSrc: 'https://doc.vben.pro', title: 'demos.vben.document' }, name: 'VbenDocument', path: '/vben-admin/document', pid: projectId, type: 'embedded' });
  await insertMenu({ component: 'IFrameView', meta: { icon: 'carbon:logo-github', link: 'https://github.com/vbenjs/vue-vben-admin', title: 'Github' }, name: 'VbenGithub', path: '/vben-admin/github', pid: projectId, type: 'link' });
  await insertMenu({ component: 'IFrameView', meta: { badgeType: 'dot', icon: 'carbon:hexagon-vertical-solid', link: 'https://ant.vben.pro', title: 'demos.vben.antdv' }, name: 'VbenAntdv', path: '/vben-admin/antdv', pid: projectId, status: 0, type: 'link' });

  await insertMenu({ component: '_core/about/index', meta: { icon: 'lucide:copyright', order: 9999, title: 'demos.vben.about' }, name: 'About', path: '/about', sort: 4, type: 'menu' });

  console.log('Seed completed: users/roles/depts/codes/nav-menus/mgmt-menus');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
