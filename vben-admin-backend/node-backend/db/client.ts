import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import * as schema from './schema';

/**
 * 数据库客户端（进程级单例）
 * 连接池由 mysql2 管理，Nitro 热更新时挂在 globalThis 上复用，避免连接泄漏
 */
const DATABASE_URL =
  process.env.DATABASE_URL ??
  'mysql://root:123456@localhost:3306/vben_admin';

const globalForDb = globalThis as unknown as {
  __db?: MySql2Database<typeof schema>;
};

export const db =
  globalForDb.__db ??
  drizzle(mysql.createPool(DATABASE_URL), { schema, mode: 'default' });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__db = db;
}
