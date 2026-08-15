import { int, json, mysqlTable, timestamp, tinyint, varchar } from 'drizzle-orm/mysql-core';

/**
 * 菜单表（树形结构，pid=0 为根节点）
 * 一表两用：
 * - 导航菜单（/menu/all）：通过 sys_role_menu 绑定角色，按角色过滤
 * - 菜单管理（/system/menu/list）：全量返回，含按钮级权限节点
 * type 取值：catalog 目录 / menu 菜单 / button 按钮 / embedded 内嵌 / link 外链
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
  /** 节点类型（catalog/menu/button/embedded/link） */
  type: varchar('type', { length: 16 }).notNull().default('menu'),
  /** 按钮级权限码（如 System:Menu:Create），仅 button/menu 类节点使用 */
  authCode: varchar('auth_code', { length: 64 }),
  /** 状态：1 启用 / 0 禁用 */
  status: tinyint('status').notNull().default(1),
  createTime: timestamp('create_time').notNull().defaultNow(),
});

/** 角色-菜单绑定：某角色可见的导航菜单（/menu/all 按用户角色过滤） */
export const sysRoleMenu = mysqlTable('sys_role_menu', {
  id: int('id').autoincrement().primaryKey(),
  role: varchar('role', { length: 32 }).notNull(),
  menuId: int('menu_id').notNull(),
});

export type SysMenu = typeof sysMenu.$inferSelect;
