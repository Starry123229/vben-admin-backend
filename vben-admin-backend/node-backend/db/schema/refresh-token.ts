import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

/**
 * 刷新令牌表
 * 只存 SHA-256 哈希（64 位 hex），令牌本体仅存在于用户 Cookie——拖库也无法重放
 * expires_at 与 JWT 30 天有效期对齐，刷新时轮换（删旧插新）
 */
export const sysRefreshToken = mysqlTable('sys_refresh_token', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
