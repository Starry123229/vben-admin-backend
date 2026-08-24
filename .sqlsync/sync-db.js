/**
 * 将本地 MySQL 的 vben_admin 库与 sql/init.sql 同步。
 * 流程：备份现有数据(JSON) -> DROP DATABASE -> 执行 init.sql -> 校验行数。
 * 用法：node sync-db.js
 */
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
};
const DB_NAME = 'vben_admin';
const INIT_SQL = path.resolve(__dirname, '../vben-admin-backend/sql/init.sql');

async function main() {
  const conn = await mysql.createConnection({
    ...CONFIG,
    multipleStatements: true,
    charset: 'utf8mb4_general_ci',
  });

  // 0) 检查库是否存在
  const [dbs] = await conn.query(
    `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
    [DB_NAME],
  );
  const exists = dbs.length > 0;
  console.log(`[1/4] 数据库 ${DB_NAME} ${exists ? '已存在，将备份后重建' : '不存在，直接初始化'}`);

  // 1) 备份现有数据（如有）
  if (exists) {
    await conn.query(`USE \`${DB_NAME}\``);
    const [tablesRes] = await conn.query('SHOW TABLES');
    const tables = tablesRes.map((r) => Object.values(r)[0]);
    const backup = {};
    for (const t of tables) {
      const [rows] = await conn.query(`SELECT * FROM \`${t}\``);
      backup[t] = rows;
      console.log(`      备份 ${t}: ${rows.length} 行`);
    }
    const backupFile = path.resolve(
      __dirname,
      `../vben-admin-backend/sql/.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`      备份已写入: ${backupFile}`);
    await conn.query(`DROP DATABASE \`${DB_NAME}\``);
  }

  // 2) 执行 init.sql 全量重建
  const sql = fs.readFileSync(INIT_SQL, 'utf8');
  console.log('[2/4] 执行 init.sql ...');
  await conn.query(sql);

  // 3) 校验
  console.log('[3/4] 校验重建结果:');
  await conn.query(`USE \`${DB_NAME}\``);
  const expect = {
    sys_user: 3,
    sys_role: 3,
    sys_user_role: 3,
    sys_menu: 10,
    sys_role_menu: 24,
    sys_notice: 6,
  };
  let ok = true;
  for (const [table, want] of Object.entries(expect)) {
    const [[{ cnt }]] = await conn.query(`SELECT COUNT(*) AS cnt FROM \`${table}\``);
    const pass = cnt === want;
    ok = ok && pass;
    console.log(`      ${table.padEnd(16)} ${cnt} 行 (期望 ${want}) ${pass ? '✓' : '✗'}`);
  }

  // 打印菜单清单便于人工核对
  const [menus] = await conn.query(
    'SELECT id, pid, name, path, component FROM `sys_menu` ORDER BY id',
  );
  console.log('[4/4] 菜单清单:');
  for (const m of menus) {
    console.log(
      `      #${String(m.id).padStart(3)} pid=${String(m.pid).padStart(3)} ${m.name.padEnd(12)} ${String(m.path ?? '').padEnd(12)} -> ${m.component ?? '-'}`,
    );
  }

  console.log(ok ? '\n✔ 同步完成且校验通过' : '\n✘ 校验未通过，请检查');
  await conn.end();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('同步失败:', err.message);
  process.exit(1);
});