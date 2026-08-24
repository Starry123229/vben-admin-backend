const mysql = require("c:/Users/18164/Desktop/demo/.sqlsync/node_modules/mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "123456",
  });
  const [desc] = await conn.query("SHOW COLUMNS FROM vben_admin.sys_user");
  console.log("sys_user 列:", desc.map((c) => c.Field).join(", "));
  const [rows] = await conn.query(
    "SELECT id, username, phone, email FROM vben_admin.sys_user WHERE username = ?",
    ["vben"],
  );
  console.log("按 username 查询结果:", JSON.stringify(rows));
  await conn.end();
}
main().catch((e) => {
  console.error("验证失败:", e.message);
  process.exit(1);
});