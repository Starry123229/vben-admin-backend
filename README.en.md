<div align="center">

# Vben Admin System

**Enterprise admin system built with Vue 3 + Vben Admin 5.7**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](#option-a-java-backendspring-boot-41)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](#option-b-node-backendnestjs--fastify--prisma)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](#step-1-initialize-the-database)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[简体中文](./README.md) | **English**

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Feature Modules](#feature-modules)
- [Permission Model](#permission-model)
- [Authentication](#authentication)
- [Production Build & Deployment](#production-build--deployment)
- [API Documentation](#api-documentation)
- [FAQ](#faq)
- [Demo Accounts](#demo-accounts)
- [License](#license)

---

## Introduction

An enterprise admin system with a **decoupled front-end / back-end** architecture:

- **Front-end** is based on the Vben Admin 5.7 monorepo and ships with **4 UI framework apps** (Ant Design Vue / Ant Design Vue Next / Element Plus / Naive UI). The business code is identical across all of them — just pick one;
- **Back-end** provides **two fully equivalent implementations** (Java and Node.js) sharing the same MySQL database and the same API contract (`docs/api-contract.md`). Pick either one;
- All backend endpoints share the `/api` global prefix, and the frontend dev server ships with a pre-configured proxy — **zero configuration for local development**.

```
┌────────────────────────────┐         ┌──────────────────────────┐
│  Front-end (choose 1 of 4) │  /api   │  Back-end (choose 1 of 2)│
│  web-antd      :5666       │ ──────► │  Java  (Spring Boot 4.1) │
│  web-antdv-next:6001       │  proxy  │  Node  (NestJS+Fastify)  │
│  web-ele       :5777       │         │  both on localhost:8080  │
│  web-naive     :5888       │         └───────────┬──────────────┘
└────────────────────────────┘                     │
                                                   ▼
                                        MySQL 8.x (vben_admin)
```

## Features

- **Authentication & session**: account login, dual-token scheme (accessToken + HttpOnly Cookie refreshToken), silent refresh, logout, per-user login-failure lockout (configurable threshold)
- **User management**: pagination/search/filter, create/edit/delete, reset password, enable/disable, password strength validation, self-delete protection, Excel export
- **Role management**: CRUD, status toggle, **menu permission assignment** (checkable tree), button-level permission codes
- **Department management**: tree-shaped org structure, CRUD, filter users by department
- **Menu management**: directory/menu/button three-level structure, route integrity validation, permission code maintenance
- **Data dictionary**: two-level dictionary types & data, source for business dropdowns
- **Config management**: system key-value parameters (default password, lockout thresholds, etc.)
- **Scheduled jobs**: dynamic Cron scheduling engine, pause/resume/run-once/CRUD
- **Notice management**: send in-site notices to specific users or broadcast by role
- **Message center**: in-site messaging, unread counters, mark one/all as read
- **Attachment center**: file upload, type & size validation, delete
- **Workflow**: custom JSON approval chains, multi-step approval, approve/reject/withdraw, approval records
- **System monitor**: online users (force logout), cache monitor, scheduled JVM status checks
- **Logs**: operation log, login log (with IP location), audit log (data-change snapshots), with clear & export
- **Profile**: maintain profile, upload avatar, change password

## Project Structure

```
vben/
├── README.md                        # 简体中文文档
├── README.en.md                     # This file (English)
├── vben-admin-backend/              # Back-end projects
│   ├── docs/
│   │   └── api-contract.md          # API contract (single source of truth for both back-ends)
│   ├── java-backend/                # Java implementation
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/vben/backend/
│   │       │   ├── common/          # Unified response, exceptions, utils
│   │       │   ├── config/          # Sa-Token, Swagger, security configs
│   │       │   └── module/
│   │       │       ├── auth/        # Login, dual-token, forgot password
│   │       │       └── system/      # user/role/dept/menu/logs/jobs...
│   │       └── resources/
│   │           ├── application.yml      # Main config (port/auth/storage/tenant)
│   │           └── application-dev.yml  # Dev profile (database, etc.)
│   ├── node-backend/                # Node implementation
│   │   ├── .env                     # Environment config (DB/port/JWT...)
│   │   ├── .env.example             # Config template
│   │   ├── prisma/schema.prisma     # Data model
│   │   └── src/
│   │       ├── common/              # Unified response, exception filter, guards
│   │       ├── modules/
│   │       │   ├── auth/            # Login, JWT, phone/QR/OAuth
│   │       │   ├── menu/            # Front-end route tree (dynamic per role)
│   │       │   ├── system/          # user/role/menu/dict/jobs/logs...
│   │       │   └── ...
│   │       └── main.ts
│   └── sql/
│       └── init.sql                 # Creates DB + all tables + demo data (single-file import)
└── vue-vben-admin-v5.7.0/           # Front-end monorepo (pnpm workspace)
    ├── apps/                        # 4 UI framework apps (identical business code)
    │   ├── web-antd/                # Ant Design Vue 4 (port 5666)
    │   ├── web-antdv-next/          # Ant Design Vue Next (port 6001)
    │   ├── web-ele/                 # Element Plus (port 5777)
    │   └── web-naive/               # Naive UI (port 5888)
    ├── packages/                    # Shared packages (UI, hooks, preferences...)
    ├── internal/                    # Build & lint configs
    └── scripts/                     # Script utilities
```

## Tech Stack

| Side | Technologies |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · Vue Router · pnpm monorepo |
| Front-end UI (choose 1 of 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java back-end | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node back-end | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| Database | MySQL 8.x (utf8mb4) |

## Prerequisites

| Tool | Version | Required for |
| --- | --- | --- |
| Node.js | ≥ 20 | Front-end & Node back-end |
| pnpm | ≥ 9 | Front-end & Node back-end (`npm i -g pnpm`) |
| MySQL | 8.x (8.4+ recommended) | Both back-ends |
| JDK | 25 | Java back-end only |
| Maven | 3.9+ | Java back-end only |

## Getting Started

### Step 0: Understand the Selection Rules

Make two choices before starting:

| Decision | Options | Notes |
| --- | --- | --- |
| Back-end | **Java** or **Node** | Fully equivalent, shared database; only one can run at a time (both use port 8080). Switching requires no data migration |
| Front-end UI | **web-antd** / **web-antdv-next** / **web-ele** / **web-naive** | Identical business code, only the component library differs; install all, switch anytime |

### Step 1: Initialize the Database

A single `init.sql` creates the database (`vben_admin`), all 20 tables, and demo data — shared by both back-ends.

**Option 1: MySQL CLI (recommended)**

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

Or from the mysql interactive shell:

```sql
SOURCE /path/to/vben-admin-backend/sql/init.sql;
```

**Option 2: GUI tools (Navicat / DBeaver / DataGrip)**

Open `vben-admin-backend/sql/init.sql` in a query window and execute it entirely.

**Verify**:

```sql
USE vben_admin;
SHOW TABLES;   -- should list ~20 tables (sys_user, sys_menu, sys_role, ...)
SELECT COUNT(*) FROM sys_menu;   -- returns 20
```

> - The script contains `CREATE DATABASE IF NOT EXISTS` and `USE vben_admin`, so the import always targets the `vben_admin` database;
> - Schema creation is safe to re-run (`IF NOT EXISTS`), but demo-data INSERTs abort on primary-key conflicts — **run the full import only once**.

### Step 2: Start the Backend (Java / Node, choose one)

#### Option A: Java back-end (Spring Boot 4.1)

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

Wait for `Started BackendApplication` in the log. Endpoints are prefixed with `/api`.

<details>
<summary><b>Common configuration (click to expand)</b></summary>

The database connection lives in `src/main/resources/application-dev.yml` and can be overridden via environment variables:

| Env var | Default | Description |
| --- | --- | --- |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `3306` | Database port |
| `DB_USERNAME` | `root` | Database user |
| `DB_PASSWORD` | `123456` | Database password |

Other key settings in `application.yml`:

| Key | Description |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken lifetime (seconds, default 7200) |
| `vben.auth.refresh-token-days` | refreshToken lifetime in days (default 7) |
| `vben.auth.login-methods.*` | Login method switches (account/phone/qrcode/register/oauth) |
| `vben.auth.sms-mock` / `email-mock` | SMS/email mock (verification codes echoed; disable in production) |
| `vben.auth.upload-dir` | Upload directory (default `./uploads`) |
| `app.message.mail-enabled` | Email notification switch for the message center |
| `app.tenant.enabled` | Multi-tenancy switch |

</details>

<details>
<summary><b>Package for production (click to expand)</b></summary>

```bash
# Stop any running back-end first, otherwise repackage fails because the jar is locked
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar
```

</details>

#### Option B: Node back-end (NestJS 12 + Fastify 5 + Prisma 7)

```bash
cd vben-admin-backend/node-backend
pnpm install          # ① install dependencies
pnpm db:generate      # ② generate the Prisma Client (required on first run)
pnpm start            # ③ start (runs dist/main.js)
```

Wait for `服务启动: http://localhost:8080` and `数据库连接成功` in the log.

<details>
<summary><b>Configuration & commands (click to expand)</b></summary>

All configuration lives in `node-backend/.env` (template: `.env.example`):

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | Database URL |
| `PORT` | `8080` | Server port (must match the front-end proxy) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev placeholders | JWT signing secrets, **must be changed in production** |
| `ACCESS_TOKEN_EXPIRES` | `2h` | accessToken lifetime |
| `REFRESH_TOKEN_DAYS` | `7` | refreshToken lifetime in days |
| `LOGIN_METHODS_*` | see file | Login method switches; the login page adapts accordingly |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `true` | Auto-create account on first phone/OAuth login (set `false` in production) |
| `UPLOAD_DIR` | `./uploads` | Upload directory |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | SMS/email mock (codes echoed in responses) |

Other commands:

```bash
pnpm dev              # dev mode (tsx watch hot reload)
pnpm build            # compile to dist/
pnpm db:push          # sync schema from prisma/schema.prisma (normally not needed)
pnpm db:studio        # Prisma visual data browser
```

> **Note**: pnpm 10+ blocks dependency build scripts by default. If `pnpm install` reports
> `[ERR_PNPM_IGNORED_BUILDS]`, make sure every entry in `allowBuilds` inside
> `node-backend/pnpm-workspace.yaml` is `true` (pre-configured in the repo), re-run
> `pnpm install`, then run `pnpm db:generate` again.

</details>

> **Which back-end should I choose?**
> - Feature-parity is 100% and the database is shared — switching is free (stop one → start the other → refresh & log in again);
> - JVM-oriented teams or those needing flexible SQL via MyBatis → **Java**;
> - Full-stack TS teams wanting instant startup and lightweight deployment → **Node**.

### Step 3: Start the Frontend (choose 1 of 4 UI apps)

| App | UI framework | Dev port | pnpm filter |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `@vben/web-antd` |
| `web-antdv-next` | Ant Design Vue (next) | 6001 | `@vben/web-antdv-next` |
| `web-ele` | Element Plus | 5777 | `@vben/web-ele` |
| `web-naive` | Naive UI | 5888 | `@vben/web-naive` |

```bash
cd vue-vben-admin-v5.7.0
pnpm install                          # first install covers all 4 apps

# Ant Design Vue version, for example
pnpm --filter @vben/web-antd dev
```

Open `http://localhost:5666` when ready. To use another UI, just swap the filter:

```bash
pnpm --filter @vben/web-ele dev       # Element Plus → http://localhost:5777
pnpm --filter @vben/web-naive dev     # Naive UI → http://localhost:5888
pnpm --filter @vben/web-antdv-next dev
```

> **How do front-end and back-end connect?** Automatically. Every app's `vite.config.ts`
> ships with a proxy: `/api/**` → `http://localhost:8080/api/**`. If your back-end runs on
> the default port 8080, the front-end needs zero configuration. To use another port,
> update `proxy.target` in `apps/<your-app>/vite.config.ts`.

### Step 4: Sign In

Use any demo account (password is `123456` for all):

| Account | Role | Landing page | Scope |
| --- | --- | --- | --- |
| **vben** | super administrator | /analytics | All menus & all button permissions |
| **admin** | admin | /workspace | System mgmt / monitor / tools; full user CRUD & role editing |
| **jack** | user | /analytics | Read-only user management + role management; unauthorized access returns 403/404 |

> **Dev-time login methods**: account login is enabled by default. Phone code / QR /
> register / OAuth entries are controlled by back-end switches (Java `application.yml`
> enables only account login by default; Node `.env` enables all). Enabled entries appear
> on the login page automatically, and verification codes are echoed in mock mode.

## Feature Modules

| Module | Route | Minimum role | Description |
| --- | --- | --- | --- |
| Analytics | `/analytics` | all | user/role/dept/menu stats, traffic trends, distribution charts |
| Workspace | `/workspace` | all | quick entries, todos, recent notices |
| User mgmt | `/system/user` | super / admin / user(readonly) | pagination, search, CRUD, reset pwd, enable/disable, export |
| Role mgmt | `/system/role` | super / admin / user | CRUD, menu permission tree |
| Dept mgmt | `/system/dept` | super / admin | tree-shaped org CRUD |
| Menu mgmt | `/system/menu` | super / admin | directory/menu/button levels, permission codes |
| Online users | `/system/monitor-cat/online` | super / admin | session list, force logout |
| Operation log | `/system/monitor-cat/operation-log` | super / admin | audit of back-end operations, export, clear |
| Login log | `/system/monitor-cat/login-log` | super / admin | login records (with IP location) |
| Audit log | `/system/monitor-cat/audit-log` | super | before/after data snapshots |
| System monitor | `/system/monitor-cat/monitor` | super / admin | cache & runtime status |
| Data dictionary | `/system/tools/dict` | super / admin | dictionary types + data |
| Config | `/system/tools/config` | super / admin | system key-value parameters |
| Scheduled jobs | `/system/tools/job` | super / admin | Cron scheduling, pause/resume/run-once |
| Notice mgmt | `/system/tools/notice` | super / admin | send to users / broadcast by role |
| Message center | `/system/tools/message` | super / admin | in-site messaging, read management |
| Attachment center | `/system/tools/attachment` | super / admin | upload, preview, delete |
| Workflow | `/system/tools/workflow` | super / admin | definitions, start, approve (approve/reject/withdraw) |
| Profile | `/profile` | all | profile, avatar, change password |

## Permission Model

The system uses **RBAC (user → role → menu/button)**; front-end and back-end share the same permission codes:

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → front-end routes / side menu
                                                              └─ type=button → auth_code (button-level codes)
```

- **Menu permissions**: the back-end returns a per-user route tree (`GET /menu/all`). Unauthorized routes are never registered on the front-end (direct access returns 404);
- **Button permissions**: `sys_menu(type=button).auth_code` (e.g. `AC_100010` = create user). The front-end toggles button visibility via the `v-access` directive / `hasAccessByCodes`, while the back-end enforces the same codes via `@SaCheckPermission` (Java) or `@Permissions` + `PermissionGuard` (Node) — **one set of codes, enforced on both sides**;
- **Super administrator**: a role with `code=super` owns all permissions without per-item assignment.

## Authentication

After login, **dual tokens** are issued:

1. **accessToken**: 2-hour lifetime, stored in localStorage, sent as `Authorization: Bearer <token>`;
2. **refreshToken**: 7-day lifetime, stored in an **HttpOnly Cookie** (unreadable by JS, XSS-resistant);
3. When the accessToken expires, the front-end silently calls `POST /auth/refresh` with the cookie — invisible to the user;
4. Logout / admin force-logout revokes both tokens.

## Production Build & Deployment

### Front-end

```bash
cd vue-vben-admin-v5.7.0
pnpm --filter @vben/web-antd build     # output: apps/web-antd/dist
```

Sample Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # point to the dist directory
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # the back-end already carries the /api prefix
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # attachments
    }
}
```

### Back-end

```bash
# Java (stop the running process first, otherwise the jar is locked)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

**Production security checklist**:

- [ ] Change both JWT secrets in the Node `.env` and the database password
- [ ] Change the default database password `123456`; retire or re-password demo accounts
- [ ] Disable SMS/EMAIL mock (Java: `vben.auth.sms-mock=false`; Node: same keys in `.env`) and wire real providers
- [ ] Disable knife4j/Swagger docs (Java: `springdoc.api-docs.enabled=false`)
- [ ] Tighten login methods (disable register & third-party auto-registration)
- [ ] Enable secure cookies behind HTTPS (Java: `vben.auth.cookie-secure=true`; Node: `COOKIE_SECURE=true`)

## API Documentation

| Back-end | URL |
| --- | --- |
| Java (knife4j) | <http://localhost:8080/api/doc.html> |
| Node (Swagger) | <http://localhost:8080/api/docs> |

For live debugging: call `POST /auth/login` to get an accessToken, then paste `Bearer <accessToken>` into the Authorize dialog.

The full API contract lives at [`vben-admin-backend/docs/api-contract.md`](./vben-admin-backend/docs/api-contract.md).

## FAQ

**Q1: All requests fail / login doesn't respond?**
Check in order: ① is the back-end running on 8080 (`curl http://localhost:8080/api/auth/config` should return JSON); ② has `init.sql` been executed; ③ are the database credentials correct (check the back-end startup log); ④ have both front-end and back-end been restarted (stale processes may hold old ports).

**Q2: Node `pnpm install` reports `[ERR_PNPM_IGNORED_BUILDS]`?**
pnpm 10+ blocks dependency build scripts by default. Confirm every `allowBuilds` entry in `node-backend/pnpm-workspace.yaml` is `true`, re-run `pnpm install`, then run `pnpm db:generate`.

**Q3: Port 8080 is already in use?**
Java and Node back-ends share 8080 — they cannot run simultaneously. To compare them side by side: change `PORT` in the Node `.env` (e.g. 8081) and update `proxy.target` in the front-end `vite.config.ts`.

**Q4: How do I switch between the Java and Node back-ends?**
Stop the current back-end → start the other one → refresh the front-end and log in again. The database is shared, so no migration is needed; both back-ends are behaviorally aligned (including error codes and messages).

**Q5: I don't see phone login / register / OAuth entries on the login page?**
Login methods are controlled by back-end switches and delivered via `GET /auth/config`. The Java side enables only account login by default (`vben.auth.login-methods.*` in `application.yml`); the Node side uses `LOGIN_METHODS_*` in `.env`.

**Q6: I never receive verification codes?**
Dev environments enable SMS/email mock by default — codes are echoed directly in API responses (or returned as `mockCode`). Wire real providers and disable mocks for production.

**Q7: Attachment upload fails with a size error?**
The back-end limits a single file to ≤ 5MB (Java multipart cap is 10MB with a 5MB business check). When deploying behind Nginx also set `client_max_body_size 10m;`.

**Q8: "Run once" on a scheduled job reports a missing bean/method?**
The invoke target format is `beanName.methodName` (e.g. `sampleJob.run`) and the referenced bean must exist in the back-end code (Java: `@Component("xxx")`; Node: a registered job method). Verify the target exists before creating the job.

## Demo Accounts

| Account | Password | Role |
| --- | --- | --- |
| vben | 123456 | super (all permissions) |
| admin | 123456 | admin |
| jack | 123456 | user (partial permissions) |

## License

[MIT](./LICENSE)

