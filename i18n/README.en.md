<div align="center">

# Vben Admin System

**Enterprise admin system built with Vue 3 + Vben Admin 5.7 (decoupled front-end / back-end)**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | **English** | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## Introduction

- **Front-end**: based on the Vben Admin 5.7 monorepo with **4 UI framework apps**; the business code is identical — pick one;
- **Back-end**: two fully equivalent implementations — Java (Spring Boot 4.1) and Node.js (NestJS 12) — sharing the same MySQL database and the same API contract ([`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)). Pick either one;
- All endpoints share the `/api` global prefix, and the frontend dev server ships with a pre-configured proxy — **zero configuration for local development**;
- Built-in modules: authentication, users / roles / departments / menus, data dictionary, config management, scheduled jobs, notices & message center, attachments, workflow, operation/login/audit logs, online users & system monitor, profile.

| Side (choose one) | Options | Port |
| --- | --- | --- |
| Back-end | Java Spring Boot 4.1 / Node NestJS 12 | both on `localhost:8080` |
| Front-end | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## Project Structure

```
vben/
├── vben-admin-backend/              # Back-end
│   ├── docs/api-contract.md         # API contract (single source of truth)
│   ├── java-backend/                # Java implementation (Spring Boot)
│   ├── node-backend/                # Node implementation (NestJS + Prisma)
│   └── sql/init.sql                 # DB + 20 tables + demo data (single-file import)
└── vue-vben-admin-v5.7.0/           # Front-end monorepo (pnpm workspace)
    ├── apps/                        # 4 UI apps: web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # Shared packages (UI, hooks, preferences...)
    ├── internal/                    # Build & lint configs
    └── scripts/                     # Script utilities
```

## Tech Stack & Prerequisites

| Side | Technologies |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| Front-end UI (choose 1 of 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java back-end | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node back-end | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| Database | MySQL 9.x (utf8mb4) |

| Tool | Version | Required for |
| --- | --- | --- |
| Node.js | ≥ 22.18 (24 LTS recommended) | Front-end + Node back-end |
| pnpm | ≥ 10 (`npm i -g pnpm`) | Front-end + Node back-end |
| MySQL | 9.x | Both back-ends |
| JDK | 25 | Java back-end only |
| Maven | 3.9+ | Java back-end only |

Once installed, run the self-check and make sure versions meet the requirements:

```bash
node -v && pnpm -v && mysql --version    # front-end + Node back-end
java -version && mvn -v                  # Java back-end
```

## Getting Started

### Step 1: Initialize the Database

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) creates the database (`vben_admin`), all 20 tables, and demo data in one file — shared by both back-ends.

**1.1 Make sure MySQL is running**

```bash
Get-Service MySQL*            # Windows (admin PowerShell) — Status should be Running
mysqladmin -uroot -p status   # macOS / Linux — printing Uptime means OK
```

**1.2 Run the import**

From the **repository root** (recommended):

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

Alternatives:

```sql
-- MySQL interactive shell (run after `mysql -uroot -p`; use forward slashes on Windows)
SOURCE C:/your/path/vben-admin-backend/sql/init.sql;
```

Or open `init.sql` in a GUI tool (Navicat / DBeaver / DataGrip) and execute it entirely.
(PowerShell does not support `<` — use one of these two options instead.)

**1.3 Verify the import**

```sql
USE vben_admin;
SHOW TABLES;                          -- ~20 tables (sys_user, sys_menu, sys_role, ...)
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

If all three match, the database is ready.

> - The script contains `CREATE DATABASE IF NOT EXISTS` and `USE vben_admin`, so the import always targets `vben_admin`;
> - Table creation is idempotent, but re-inserting demo data aborts on primary-key conflicts — **run the full import only once**;
> - `Access denied` means a wrong password; `command not found` means mysql is not on `PATH` — use the full path (e.g. `"C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"`).

### Step 2: Start the Backend (Java / Node, choose one)

> Both back-ends share port 8080 — **only one can run at a time**. The database is shared, so switching requires no migration.

#### Option A: Java back-end (Spring Boot 4.1)

**A-1. Start** (the first run downloads dependencies and may take minutes):

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. Confirm startup** — success looks like this (keep the terminal open; `Ctrl + C` to stop):

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. Verify connectivity** — in a new terminal (JSON output means OK):

```bash
curl http://localhost:8080/api/auth/config
# expected: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Database connection** lives in `src/main/resources/application-dev.yml` and can be overridden via environment variables:

| Env var | Default | Description |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Database host / port |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | Database user / password |

**Other key settings** (`src/main/resources/application.yml`):

| Key | Description |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken lifetime (seconds, default 7200) |
| `vben.auth.refresh-token-days` | refreshToken lifetime in days (default 7) |
| `vben.auth.login-methods.*` | Login method switches (account login only by default) |
| `vben.auth.sms-mock` / `email-mock` | SMS/email mock (codes echoed in responses; disable in production) |
| `vben.auth.upload-dir` | Upload directory (default `./uploads`) |
| `app.message.mail-enabled` | Email notification switch for the message center |
| `app.tenant.enabled` | Multi-tenancy switch |

> **Common failures**:
> - `Connection refused` near database logs → MySQL is down or credentials don't match;
> - `Port 8080 was already in use` → something else (maybe the Node back-end) holds 8080 — stop it first;
> - Compile errors about the JDK version → make sure `java -version` is 25 and `JAVA_HOME` points to JDK 25.

#### Option B: Node back-end (NestJS 12 + Fastify 5 + Prisma 7)

**B-1. Install dependencies & prepare the env file**:

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env is not version-controlled (gitignored) — create it from the template on first run
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. Check the database connection**: open `.env` and make sure `DATABASE_URL` matches the credentials used in Step 1 (default `root/123456`).

**B-3. Generate the Prisma Client** (required on first run, otherwise startup fails with a PrismaClient init error):

```bash
pnpm db:generate
# expected output: ✔ Generated Prisma Client
```

**B-4. Start the back-end**:

```bash
pnpm dev              # dev mode (tsx watch hot reload)
# or pnpm build && pnpm start   # run the compiled output
```

**B-5. Confirm startup** — success looks like this (keep the terminal open; `Ctrl + C` to stop):

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. Verify connectivity** — in a new terminal (JSON output means OK):

```bash
curl http://localhost:8080/api/auth/config
# expected: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Key `.env` settings** (template: `.env.example`):

| Variable | Default (template) | Description |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | Database URL |
| `PORT` | `8080` | Server port (must match the front-end proxy) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev placeholders | JWT signing secrets, **must be changed in production** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Token lifetimes |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | only `ACCOUNT=true` | Login method switches; the login page adapts accordingly |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | Auto-create account on first phone/OAuth login (keep `false` in production) |
| `UPLOAD_DIR` | `./uploads` | Upload directory |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | SMS/email mock (codes echoed; disable in production) |

Other commands: `pnpm build` (compile to `dist/`), `pnpm db:studio` (Prisma visual data browser).

> **Common failures**:
> - `Cannot find module '@prisma/client'` → you skipped `pnpm db:generate`;
> - `Can't reach database server` → MySQL is down or `.env` is wrong;
> - `Port 8080 is already in use` → something else (maybe the Java back-end) holds 8080 — stop it first;
> - `[ERR_PNPM_IGNORED_BUILDS]` on `pnpm install` → make sure every `allowBuilds` entry in `pnpm-workspace.yaml` is `true` (pre-configured in the repo), then re-install.

### Step 3: Start the Frontend (choose 1 of 4 UI apps)

| App | UI framework | Dev port | Start command |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. Install front-end dependencies** (first time; installs all 4 apps at once, hundreds of MB to download):

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. Start the chosen app** (Ant Design Vue version, for example):

```bash
pnpm dev:antd        # equivalent to pnpm --filter @vben/web-antd dev
```

**F-3. Confirm startup** (the first start warms up dependencies; ~20–40 seconds):

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. Open the browser and sign in**: visit `http://localhost:5666`; you are redirected to the login page — complete the slider captcha and use a demo account (see Step 4).

**F-5. Switch to another UI (optional)**: stop the current one and swap the start command (ports in the table above):

```bash
pnpm dev:ele           # Element Plus → http://localhost:5777
pnpm dev:naive         # Naive UI → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next → http://localhost:6001
```

> - **Front-end ↔ back-end wiring is automatic**: every app's `vite.config.ts` ships with a proxy `/api/**` → `http://localhost:8080/api/**`. With the back-end on the default port 8080, no frontend configuration is needed; for another port, update `proxy.target` in `apps/<your-app>/vite.config.ts`;
> - **Common failures**: `pnpm install` hangs → use a mirror (`pnpm config set registry https://registry.npmmirror.com`) and retry; API calls return 500/404 → the back-end is down or the port differs; port taken → change `VITE_PORT` in `apps/<your-app>/.env.development` and restart.

### Step 4: Sign In

Demo accounts (password is `123456` for all):

| Account | Role | Landing page | Scope |
| --- | --- | --- | --- |
| **vben** | super administrator | /analytics | all menus & button permissions |
| **admin** | admin | /workspace | system management / monitor / tools |
| **jack** | user | /analytics | read-only user management + role management; unauthorized access returns 403/404 |

Landing on the analytics/workspace page means the **deployment is complete**.

> Phone login / QR / register / OAuth entries are controlled by back-end switches (see Step 2 tables) and appear on the login page automatically when enabled. In mock mode, verification codes are echoed directly in API responses.

## Production Deployment

### Front-end build

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # equivalent to pnpm --filter @vben/web-antd build; output: apps/web-antd/dist
```

Other UIs: `pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`.

**Sample Nginx configuration**:

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

### Back-end build

```bash
# Java (stop the running process first, otherwise the jar is locked)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Production security checklist

- [ ] Change the default database password `123456`; retire or re-password demo accounts
- [ ] Change `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` in the Node `.env`
- [ ] Disable SMS/EMAIL mock (Java: `vben.auth.sms-mock=false`; Node: same keys in `.env`) and wire real providers
- [ ] Disable knife4j / Swagger docs (Java: `springdoc.api-docs.enabled=false`)
- [ ] Tighten login methods (disable register & phone/OAuth auto-registration)
- [ ] Enable secure cookies behind HTTPS (Java: `vben.auth.cookie-secure=true`; Node: `COOKIE_SECURE=true`)

## How It Works

**Permission model**: RBAC (user → role → menu/button) with one shared set of permission codes on both sides.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → front-end routes / side menu
                                                              └─ type=button → auth_code (button-level codes)
```

- **Menu permissions**: the back-end returns a per-user route tree (`GET /menu/all`); unauthorized routes are never registered on the front-end (direct access returns 404);
- **Button permissions**: `auth_code` (e.g. `AC_100010` = create user) toggles button visibility via the `v-access` directive / `hasAccessByCodes` on the front-end, and is enforced by `@SaCheckPermission` (Java) / `@Permissions` + `PermissionGuard` (Node) on the back-end;
- **Super administrator**: a role with `code=super` owns all permissions.

**Authentication**: login issues dual tokens — accessToken (2h, localStorage, sent as `Authorization: Bearer <token>`) + refreshToken (7 days, HttpOnly Cookie, XSS-resistant). When the accessToken expires, the front-end silently calls `POST /auth/refresh`; logout / force-logout revokes both tokens.

## API Documentation

| Back-end | URL |
| --- | --- |
| Java (knife4j) | <http://localhost:8080/api/doc.html> |
| Node (Swagger) | <http://localhost:8080/api/docs> |

For live debugging: call `POST /auth/login` to get an accessToken, then paste `Bearer <accessToken>` into the Authorize dialog. The full API contract lives at [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## FAQ

**Q1: All requests fail / login doesn't respond?**
Check in order: ① is the back-end running on 8080 (`curl http://localhost:8080/api/auth/config` should return JSON); ② has `init.sql` been imported; ③ are the database credentials correct (check the back-end startup log); ④ any stale processes left behind?

**Q2: Port 8080 is already in use / how do I switch back-ends?**
Java and Node share 8080 — they cannot run simultaneously. To switch, stop one and start the other, then refresh the front-end and log in again (shared database, no migration needed). To compare them side by side: change `PORT` in the Node `.env` (e.g. 8081) and update `proxy.target` in the front-end `vite.config.ts`.

**Q3: I don't see phone login / register / OAuth entries on the login page?**
Login methods are controlled by back-end switches and delivered via `GET /auth/config`: enable them in `vben.auth.login-methods.*` (Java `application.yml`) or `LOGIN_METHODS_*` (Node `.env`).

**Q4: I never receive verification codes?**
Dev environments enable SMS/email mock by default — codes are echoed directly in API responses. Wire real providers and disable mocks for production.

**Q5: Attachment upload fails with a size error?**
The back-end limits a single file to ≤ 5MB (Java multipart cap is 10MB with a 5MB business check). Behind Nginx, also set `client_max_body_size 10m;`.

**Q6: "Run once" on a scheduled job reports a missing bean/method?**
The invoke target format is `beanName.methodName` (e.g. `sampleJob.run`) and the referenced bean must exist in the back-end code (Java: `@Component("xxx")`; Node: a registered job method).

## License

[MIT](../LICENSE)
