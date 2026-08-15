import { int, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

/**
 * 菜单表（树形结构，pid=0 为根节点）
 * meta 存 JSON：title/icon/order/affixTab 等前端渲染所需的任意属性
 * sort 控制同级排序，/menu/all 组装树时按 sort 升序
 */
export const sysMenu = mysqlTable('sys_menu', {
  id: int('id').autoincrement().primaryKey(),
  pid: int('pid').notNull().default(0),
  name: varchar('name', { length: 64 }).notNull(),
  path: varchar('path', { length: 128 }).notNull(),
  component: varchar('component', { length: 128 }),
  redirect: varchar('redirect', { length: 128 }),
  meta: json('meta').$type<Record<string, any>>().notNull(),
  sort: int('sort').notNull().default(0),
});

/** 角色-菜单绑定：某角色可见的菜单（/menu/all 按用户角色过滤） */
export const sysRoleMenu = mysqlTable('sys_role_menu', {
  id: int('id').autoincrement().primaryKey(),
  role: varchar('role', { length: 32 }).notNull(),
  menuId: int('menu_id').notNull(),
});

export type SysMenu = typeof sysMenu.$inferSelect;
