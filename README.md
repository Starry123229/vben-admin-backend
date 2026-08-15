# vben-admin-backend

[vue-vben-admin](https://vben.pro) v5.7.0 配套后端服务，提供 **Java / Node.js 双实现**，共用同一套数据库 Schema 与 API 契约。

## 目录结构

```
├── vben-admin-backend/          # 后端项目
│   ├── docs/api-contract.md     # 前后端 API 契约（双端实现依据）
│   ├── java-backend/            # Java 实现（Spring Boot 4.1）
│   └── sql/                     # 共享数据库脚本（schema + 演示数据）
└── vue-vben-admin-v5.7.0/       # 前端（官方 v5.7.0，独立仓库）
```

## 技术栈（Java 端）

| 类别 | 选型 |
| --- | --- |
| 框架 | Spring Boot 4.1（JDK 25） |
| 认证 | Sa-Token 1.45（双 token：accessToken + HttpOnly Cookie refreshToken） |
| ORM | MyBatis-Plus 3.5.17 |
| 数据库 | MySQL 8.4 |
| 文档 | knife4j-next 5.0.18（springdoc-openapi 3） |

## 快速开始

1. 初始化数据库（MySQL 8.x，建库建表 + 演示数据一步完成）：

   ```sql
   SOURCE vben-admin-backend/sql/init.sql;
   ```

2. 启动 Java 后端（默认 `localhost:8080`，前缀 `/api`）：

   ```bash
   cd vben-admin-backend/java-backend
   mvn spring-boot:run
   ```

3. 前端对接：修改 `vue-vben-admin-v5.7.0/playground/.env.development` 中代理地址指向 `http://localhost:8080`。

## API 文档

启动后访问 [http://localhost:8080/api/doc.html](http://localhost:8080/api/doc.html)，右上角 Authorize 填入登录返回的 accessToken 即可在线调试。

## 演示账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| vben | 123456 | super（全部权限） |
| admin | 123456 | admin |
| jack | 123456 | user（部分权限） |
