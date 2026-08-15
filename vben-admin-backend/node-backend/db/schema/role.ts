import { int, mysqlTable, timestamp, tinyint, varchar } from 'drizzle-orm/mysql-core';

/** 角色表（code 与 sys_user.roles、sys_role_menu.role 关联） */
export const sysRole = mysqlTable('sys_role', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  status: tinyint('status').notNull().default(1),
  remark: varchar('remark', { length: 255 }),
  createTime: timestamp('create_time').notNull().defaultNow(),
});
