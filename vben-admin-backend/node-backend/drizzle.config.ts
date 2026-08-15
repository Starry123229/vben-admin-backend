import { defineConfig } from 'drizzle-kit';

/** drizzle-kit 配置：db:push 推送表结构 / db:generate 生成 SQL 迁移文件 */
export default defineConfig({
  dialect: 'mysql',
  schema: './db/schema',
  out: './drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'mysql://root:123456@localhost:3306/vben_admin',
  },
});
