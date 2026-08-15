import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

/** 角色-权限码绑定（/auth/codes 按用户角色返回权限码列表） */
export const sysRoleCode = mysqlTable('sys_role_code', {
  id: int('id').autoincrement().primaryKey(),
  role: varchar('role', { length: 32 }).notNull(),
  code: varchar('code', { length: 64 }).notNull(),
});
