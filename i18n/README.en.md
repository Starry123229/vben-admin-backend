<div align="center">

# Vben Admin System

<p>Open-source admin framework (Vue 3 Admin Template / Dashboard): a full-stack Vben Admin 5.7 solution with Vue 3 + Vite front-end, Java Spring Boot 4 / Node.js NestJS 12 dual backends, RBAC, JWT dual-token, MySQL — ready to run, MIT licensed</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | **English** | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## Features

- 💪 4 front-end UI apps (Ant Design Vue / Element Plus / Naive UI / Ant Design Vue Next) with identical business code — pick one
- 🚀 Two fully equivalent back-ends — Java (Spring Boot 4.1) and Node.js (NestJS 12) — pick either one
- 💅 RBAC permission model + dual-token auth (accessToken + refreshToken)
- 🌍 Zero-config local dev — front-end dev server ships with a pre-configured `/api` proxy
- 📦️ Built-in modules: users / roles / departments / menus, data dictionary, config, scheduled jobs, notices & message center, attachments, workflow, operation / login / audit logs, online users & system monitor
- 🥳 Open-source version is free for commercial use

## Project Structure

```
vben/
├── vben-admin-backend/              # Back-end
│   ├── docs/api-contract.md         # API contract (single source of truth)
│   ├── java-backend/                # Java implementation (Spring Boot)
│   ├── node-backend/                # Node implementation (NestJS + Prisma)
│   └── sql/init.sql                 # DB + 20 tables + demo data (single-file import)
└── vue-vben-admin-v5.7.0/           # Front-end monorepo (pnpm workspace)
    ├── apps/                        # 4 UI apps
    ├── packages/                    # Shared packages
    └── internal/                    # Build & lint configs
```

## Tech Stack

| Side | Technologies |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| Front-end UI (choose 1 of 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java back-end | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Node back-end | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| Database | MySQL 9.x (utf8mb4) |

## Getting Started

### 1. Initialize the Database

```bash
# Make sure MySQL is running, then import
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` creates the database (`vben_admin`), all 20 tables, and demo data in one file — shared by both back-ends.

### 2. Start the Backend (Java / Node, choose one)

```bash
# Option A: Java back-end
cd vben-admin-backend/java-backend
mvn spring-boot:run

# Option B: Node back-end
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> Both back-ends share port 8080 — only one can run at a time. Default DB credentials: `root/123456`. See config files to change.

### 3. Start the Frontend (choose 1 of 4)

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. Sign In

Demo accounts (password is `123456` for all):

| Account | Role | Scope |
| --- | --- | --- |
| **vben** | super administrator | all menus & button permissions |
| **admin** | administrator | system management / monitor / tools |
| **jack** | user | read-only user management + role management |

## Production Deployment

### Front-end build

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # output: apps/web-antd/dist
```

### Back-end build

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Sample Nginx configuration

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

## How It Works

**Permission model**: RBAC (user → role → menu/button) with one shared set of permission codes on both sides.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → front-end routes / side menu
                                                              └─ type=button → auth_code (button-level codes)
```

**Authentication flow**:

```
Login → issue dual tokens
  ├─ accessToken (2h, localStorage, sent as Authorization: Bearer)
  └─ refreshToken (7d, HttpOnly Cookie, XSS-resistant)
      └─ accessToken expires → front-end silently calls POST /auth/refresh
      └─ logout / force-logout → both tokens revoked
```

**Menu & button permissions**:

- **Menu permissions**: the back-end returns a per-user route tree (`GET /menu/all`); unauthorized routes are never registered on the front-end;
- **Button permissions**: `auth_code` (e.g. `AC_100010`) toggles button visibility via `v-access` directive, enforced by `@SaCheckPermission` (Java) / `@Permissions` (Node);
- **Super administrator**: a role with `code=super` owns all permissions.

## API Documentation

| Back-end | URL |
| --- | --- |
| Java (knife4j) | http://localhost:8080/api/doc.html |
| Node (Swagger) | http://localhost:8080/api/docs |

Full API contract: [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## License

[MIT](../LICENSE)
