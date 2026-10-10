<div align="center">

# Vben Admin 后台管理系统

<p>开源后台管理框架（Vue 3 Admin Template / Dashboard）：基于 Vben Admin 5.7 的全栈方案，Vue 3 + Vite 前端，Java Spring Boot 4 / Node.js NestJS 12 双后端，RBAC 权限、JWT 双 Token、MySQL，开箱即用，MIT 免费商用</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#许可证)
[![GitHub Stars](https://img.shields.io/github/stars/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Starry123229/vben-admin-backend)](https://github.com/Starry123229/vben-admin-backend/issues)

**简体中文** | [繁體中文](./i18n/README.zh-TW.md) | [English](./i18n/README.en.md) | [日本語](./i18n/README.ja.md) | [한국어](./i18n/README.ko.md) | [Français](./i18n/README.fr.md) | [Deutsch](./i18n/README.de.md) | [Español](./i18n/README.es.md) | [Русский](./i18n/README.ru.md)

</div>

---

## 目录结构

```
vben/
├── vben-admin-backend/              # 后端
│   ├── docs/api-contract.md         # API 契约（双端实现依据）
│   ├── java-backend/                # Java 实现（Spring Boot）
│   ├── node-backend/                # Node 实现（NestJS + Prisma）
│   └── sql/init.sql                 # 建库 + 20 张表 + 演示数据（一键导入）
└── vue-vben-admin-v5.7.0/           # 前端 monorepo（pnpm workspace）
    ├── apps/                        # 4 套 UI 应用
    ├── packages/                    # 共享包
    └── internal/                    # 构建与 Lint 配置
```

## 技术栈

| 端 | 技术 |
| --- | --- |
| 前端 | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| 前端 UI（4 选 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 后端 | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Node 后端 | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| 数据库 | MySQL 9.x（utf8mb4） |

## 快速开始

### 1. 初始化数据库

```bash
# 确认 MySQL 已运行，执行一键导入
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` 单文件完成建库（`vben_admin`）→ 建 20 张表 → 灌入演示数据，双后端共用。

### 2. 启动后端（Java / Node 二选一）

```bash
# 方案 A：Java 后端
cd vben-admin-backend/java-backend
mvn spring-boot:run

# 方案 B：Node 后端
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> 双后端共用 8080 端口，同时只能运行一个。数据库默认 `root/123456`，如需修改见各端配置文件。

### 3. 启动前端（4 选 1）

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. 登录系统

演示账号（密码均为 `123456`）：

| 账号 | 角色 | 可见范围 |
| --- | --- | --- |
| **vben** | 超级管理员 | 全部菜单与按钮权限 |
| **admin** | 管理员 | 系统管理 / 监控 / 工具 |
| **jack** | 普通用户 | 用户管理（只读）与角色管理 |

## 生产部署

### 前端构建

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # 产物：apps/web-antd/dist
```

### 后端构建

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Nginx 参考配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;
    }
}
```

## 系统流程

**权限模型**：RBAC（用户 → 角色 → 菜单/按钮），前后端共用同一套权限码。

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 前端路由 / 侧边菜单
                                                              └─ type=button → auth_code（按钮级权限码）
```

**认证流程**：

```
登录 → 签发双 Token
  ├─ accessToken （2h，localStorage，请求头 Authorization: Bearer）
  └─ refreshToken（7d，HttpOnly Cookie，防 XSS）
      └─ accessToken 过期 → 前端自动调用 POST /auth/refresh 静默续期
      └─ 登出 / 强制下线 → 双 Token 作废
```

**菜单与按钮权限**：

- **菜单权限**：后端按角色动态返回路由树（`GET /menu/all`），无权限路由前端不注册；
- **按钮权限**：`auth_code`（如 `AC_100010`）在前端通过 `v-access` 指令控制显隐，后端通过 `@SaCheckPermission`（Java）/ `@Permissions`（Node）校验接口；
- **超级管理员**：`code=super` 的角色拥有全部权限。

## API 文档

| 后端 | 地址 |
| --- | --- |
| Java（knife4j） | http://localhost:8080/api/doc.html |
| Node（Swagger） | http://localhost:8080/api/docs |

完整接口契约见 [`vben-admin-backend/docs/api-contract.md`](./vben-admin-backend/docs/api-contract.md)。

## ❓ 常见问题

**1. Java 后端和 Node 后端怎么切换？**
两套后端实现同一份 API 契约、共用同一个数据库和 8080 端口，停掉一个、启动另一个即可，前端无需任何改动。

**2. 默认的登录账号密码是什么？**
见上方「快速开始 → 登录系统」，演示账号密码均为 `123456`。

**3. 忘记密码 / 想重置演示数据？**
重新执行 `mysql -uroot -p < vben-admin-backend/sql/init.sql` 即可恢复全部演示数据（注意会清空现有数据）。

**4. 支持 PostgreSQL / Oracle 吗？**
当前 SQL 脚本为 MySQL 方言（utf8mb4）。Java 端基于 MyBatis-Plus、Node 端基于 Prisma，均具备切换数据库的基础能力，欢迎提 PR。

**5. 端口被占用怎么改？**
后端默认 `8080`，前端 4 套应用分别为 `5666 / 5777 / 5888 / 6001`，在各端配置文件中修改即可。

**6. 可以商用吗？**
可以，MIT 协议允许免费商用，请保留版权声明。

## 💬 交流与反馈

- 🐛 Bug 反馈 / 功能建议：[Issues](https://github.com/Starry123229/vben-admin-backend/issues)
- 💡 使用交流 / 经验分享：[Discussions](https://github.com/Starry123229/vben-admin-backend/discussions)

## 许可证

[MIT](./LICENSE)
