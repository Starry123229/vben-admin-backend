import { int, json, mysqlTable, timestamp, tinyint, varchar } from 'drizzle-orm/mysql-core';

/**
 * 用户表
 * roles 以 JSON 数组存储（与契约 UserInfo.roles: string[] 对齐，值为 sys_role.code）
 * password 存 bcrypt 哈希，永不存明文
 */
export const sysUser = mysqlTable('sys_user', {
  id: int('id').autoincrement().primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  password: varchar('password', { length: 100 }).notNull(),
  realName: varchar('real_name', { length: 64 }).notNull(),
  roles: json('roles').$type<string[]>().notNull(),
  homePath: varchar('home_path', { length: 128 }),
  /** 状态：1 启用 / 0 禁用 */
  status: tinyint('status').notNull().default(1),
  deptId: int('dept_id'),
  remark: varchar('remark', { length: 255 }),
  createTime: timestamp('create_time').notNull().defaultNow(),
});

export type SysUser = typeof sysUser.$inferSelect;
