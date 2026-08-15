import { int, mysqlTable, timestamp, tinyint, varchar } from 'drizzle-orm/mysql-core';

/** 部门表（树形结构，pid=0 为根节点，/system/dept CRUD 的数据源） */
export const sysDept = mysqlTable('sys_dept', {
  id: int('id').autoincrement().primaryKey(),
  pid: int('pid').notNull().default(0),
  name: varchar('name', { length: 64 }).notNull(),
  status: tinyint('status').notNull().default(1),
  remark: varchar('remark', { length: 255 }),
  createTime: timestamp('create_time').notNull().defaultNow(),
});
