<div align="center">

# Vben Admin 后台管理系统

**基于 Vue 3 + Vben Admin 5.7 的前后端分离企业级中后台管理系统**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#许可证)

**简体中文** | [English](./README.en.md)

</div>

---

## 项目简介

- **前端**：基于 Vben Admin 5.7 monorepo，内置 4 套 UI 应用，业务代码一致，任选其一运行；
- **后端**：Java（Spring Boot 4.1）与 Node.js（NestJS 12）双实现，共用同一 MySQL 数据库与同一份 API 契约（[`docs/api-contract.md`](./vben-admin-backend/docs/api-contract.md)），功能完全对等，任选其一运行；
- 所有接口统一以 `/api` 为全局前缀，前端开发服务器已预置代理，**前后端联调零配置**；
- 内置模块：登录认证、用户/角色/部门/菜单、数据字典、参数配置、定时任务、通知与消息中心、附件、工作流、操作/登录/审计日志、在线用户与系统监控、个人中心。

| 端（二选一 / 四选一） | 选项 | 端口 |
| --- | --- | --- |
| 后端 | Java Spring Boot 4.1 / Node NestJS 12 | 均监听 `localhost:8080` |
| 前端 | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## 目录结构

```
vben/
├── vben-admin-backend/              # 后端
│   ├── docs/api-contract.md         # API 契约（双端实现依据）
│   ├── java-backend/                # Java 实现（Spring Boot）
│   ├── node-backend/                # Node 实现（NestJS + Prisma）
│   └── sql/init.sql                 # 建库 + 20 张表 + 演示数据（一键导入）
└── vue-vben-admin-v5.7.0/           # 前端 monorepo（pnpm workspace）
    ├── apps/                        # 4 套 UI 应用：web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # 共享包（UI 组件、hooks、偏好设置等）
    ├── internal/                    # 构建与 Lint 配置
    └── scripts/                     # 脚本工具
```

## 技术栈与环境要求

| 端 | 技术 |
| --- | --- |
| 前端 | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| 前端 UI（4 选 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 后端 | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node 后端 | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| 数据库 | MySQL 8.x（utf8mb4） |

| 工具 | 版本要求 | 用途 |
| --- | --- | --- |
| Node.js | ≥ 22.18（推荐 24 LTS） | 前端 + Node 后端 |
| pnpm | ≥ 10（`npm i -g pnpm`） | 前端 + Node 后端 |
| MySQL | 8.x | 双后端共用 |
| JDK | 25 | 仅 Java 后端 |
| Maven | 3.9+ | 仅 Java 后端 |

工具安装完成后执行自检，版本不低于要求即可：

```bash
node -v && pnpm -v && mysql --version    # 前端 + Node 后端
java -version && mvn -v                  # Java 后端
```

## 快速开始

### 第 1 步：初始化数据库

[`vben-admin-backend/sql/init.sql`](./vben-admin-backend/sql/init.sql) 单文件完成**建库（`vben_admin`）→ 建 20 张表 → 灌入演示数据**，双后端共用。

**1.1 确认 MySQL 服务已运行**

```bash
Get-Service MySQL*            # Windows（管理员 PowerShell），Status 应为 Running
mysqladmin -uroot -p status   # macOS / Linux，能输出 Uptime 即正常
```

**1.2 执行导入**

在**项目根目录**执行（推荐）：

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

其他方式（二选一）：

```sql
-- MySQL 交互环境（mysql -uroot -p 进入后执行；Windows 路径用正斜杠）
SOURCE C:/你的路径/vben-admin-backend/sql/init.sql;
```

或使用 Navicat / DBeaver / DataGrip 等图形化工具，打开 `init.sql` 全文执行（PowerShell 不支持 `<`，请用这两种方式之一）。

**1.3 验证导入结果**

```sql
USE vben_admin;
SHOW TABLES;                          -- 约 20 张表（sys_user、sys_menu、sys_role 等）
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

三条 SQL 符合预期即初始化完成。

> - 脚本内置 `CREATE DATABASE IF NOT EXISTS` 与 `USE vben_admin`，导入即写入 `vben_admin` 库；
> - 建表均带 `IF NOT EXISTS`，但演示数据重复插入会因主键冲突中断，**仅首次导入执行**；
> - 报 `Access denied` 为密码错误；报 `command not found` 说明 mysql 未加入 `PATH`，改用完整路径（如 `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`）。

### 第 2 步：启动后端（Java / Node 二选一）

> 双后端共用 8080 端口，**运行时只能二选一**；数据库共用，切换无需迁移数据。

#### 方案 A：Java 后端（Spring Boot 4.1）

**A-1. 启动**（首次运行需下载依赖，可能耗时数分钟）：

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. 确认启动成功**，终端出现以下日志即为成功（保持窗口开启，`Ctrl + C` 停止）：

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. 验证接口连通**，新开终端执行（返回 JSON 即正常）：

```bash
curl http://localhost:8080/api/auth/config
# 预期：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**数据库连接**在 `src/main/resources/application-dev.yml`，支持环境变量覆盖：

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | 数据库地址 / 端口 |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | 数据库账号 / 密码 |

**其他常用配置**（`src/main/resources/application.yml`）：

| 配置项 | 说明 |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken 有效期（秒，默认 7200） |
| `vben.auth.refresh-token-days` | refreshToken 有效天数（默认 7） |
| `vben.auth.login-methods.*` | 登录方式开关（默认仅开启账号登录） |
| `vben.auth.sms-mock` / `email-mock` | 短信/邮件 Mock（验证码接口回显，生产关闭） |
| `vben.auth.upload-dir` | 上传文件目录（默认 `./uploads`） |
| `app.message.mail-enabled` | 消息中心邮件通知开关 |
| `app.tenant.enabled` | 多租户开关 |

> **常见失败**：
> - 数据库相关日志 `Connection refused` → MySQL 未启动或账号密码不符；
> - `Port 8080 was already in use` → 8080 被占用（可能是 Node 后端在跑），先停掉；
> - 编译报 JDK 版本错误 → 确认 `java -version` 为 25 且 `JAVA_HOME` 指向 JDK 25。

#### 方案 B：Node 后端（NestJS 12 + Fastify 5 + Prisma 7）

**B-1. 安装依赖并准备环境文件**：

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env 未纳入版本管理（被 .gitignore 忽略），首次必须从模板复制
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. 核对数据库连接**：打开 `.env`，确认 `DATABASE_URL` 的账号密码与第 1 步一致（默认 `root/123456`）。

**B-3. 生成 Prisma Client**（首次必须，否则启动报 PrismaClient 初始化错误）：

```bash
pnpm db:generate
# 预期输出：✔ Generated Prisma Client
```

**B-4. 启动后端**：

```bash
pnpm dev              # 开发模式（tsx watch 热重载，改代码自动重启）
# 或 pnpm build && pnpm start   # 编译产物运行
```

**B-5. 确认启动成功**，终端出现以下日志即为成功（保持窗口开启，`Ctrl + C` 停止）：

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. 验证接口连通**，新开终端执行（返回 JSON 即正常）：

```bash
curl http://localhost:8080/api/auth/config
# 预期：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**`.env` 关键配置**（模板见 `.env.example`）：

| 变量 | 默认值（模板） | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | 数据库连接串 |
| `PORT` | `8080` | 服务端口（与前端代理对齐） |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev 占位值 | JWT 签名密钥，**生产必须更换** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Token 有效期 |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | 仅 `ACCOUNT=true` | 登录方式开关，登录页据此显隐入口 |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | 首次手机号 / 第三方登录自动建号（生产保持 `false`） |
| `UPLOAD_DIR` | `./uploads` | 上传目录 |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | 短信/邮件 Mock（验证码回显，生产关闭） |

其他命令：`pnpm build`（编译到 `dist/`）、`pnpm db:studio`（Prisma 可视化数据浏览器）。

> **常见失败**：
> - `Cannot find module '@prisma/client'` → 漏了 `pnpm db:generate`；
> - `Can't reach database server` → MySQL 未启动或 `.env` 连接串不正确；
> - `Port 8080 is already in use` → 8080 被占用（可能是 Java 后端在跑），先停掉；
> - `pnpm install` 报 `[ERR_PNPM_IGNORED_BUILDS]` → 确认 `pnpm-workspace.yaml` 中 `allowBuilds` 各项为 `true`（仓库已预置）后重新安装。

### 第 3 步：启动前端（4 选 1）

| 应用 | UI 框架 | 开发端口 | 启动命令 |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. 安装前端依赖**（首次，一次装齐 4 套应用，需下载数百 MB）：

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. 启动所选应用**（以 Ant Design Vue 版为例）：

```bash
pnpm dev:antd        # 等价于 pnpm --filter @vben/web-antd dev
```

**F-3. 确认启动成功**（首次启动需预热依赖，约 20~40 秒）：

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. 访问并登录**：浏览器打开 `http://localhost:5666`，自动跳转登录页，完成滑块验证后使用演示账号登录（见第 4 步）。

**F-5. 切换其他 UI**（可选）：停止当前前端，替换启动命令即可（端口见上表）：

```bash
pnpm dev:ele           # Element Plus 版 → http://localhost:5777
pnpm dev:naive         # Naive UI 版 → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next 版 → http://localhost:6001
```

> - **前后端对接已自动完成**：每个应用 `vite.config.ts` 均预置代理 `/api/**` → `http://localhost:8080/api/**`，后端跑在默认 8080 端口时前端零配置；后端改端口时同步修改 `apps/<应用>/vite.config.ts` 的 `proxy.target`；
> - **常见失败**：`pnpm install` 卡住 → 换镜像 `pnpm config set registry https://registry.npmmirror.com` 后重试；页面接口报 500/404 → 后端未启动或端口不一致；端口被占用 → 修改对应 `apps/<应用>/.env.development` 的 `VITE_PORT` 后重启。

### 第 4 步：登录系统

演示账号（密码均为 `123456`）：

| 账号 | 角色 | 登录后首页 | 可见范围 |
| --- | --- | --- | --- |
| **vben** | super 超级管理员 | /analytics 分析页 | 全部菜单与按钮权限 |
| **admin** | admin 管理员 | /workspace 工作台 | 系统管理 / 系统监控 / 系统工具 |
| **jack** | user 普通用户 | /analytics 分析页 | 仅用户管理（只读）与角色管理，越权访问返回 403/404 |

登录成功并跳转到分析页 / 工作台即**部署完成**。

> 手机验证码 / 扫码 / 注册 / 第三方 OAuth 入口由后端开关控制（见第 2 步配置表），开启后登录页自动显示；Mock 模式下验证码直接在接口响应中回显。

## 生产部署

### 前端构建

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # 等价 pnpm --filter @vben/web-antd build；产物：apps/web-antd/dist
```

其他 UI：`pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`。

**Nginx 参考配置**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # 指向 dist 目录
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA 路由回退
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # 后端自带 /api 前缀，无需重写
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # 附件上传
    }
}
```

### 后端构建

```bash
# Java（先停止运行中的进程，否则 jar 被占用导致打包失败）
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### 生产安全清单

- [ ] 修改数据库默认密码 `123456`，演示账号下线或改密
- [ ] 更换 Node 端 `.env` 中的 `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- [ ] 关闭 SMS/EMAIL Mock（Java：`vben.auth.sms-mock=false`；Node：`.env` 同名项置 `false`）并接入真实短信/邮件服务
- [ ] 关闭 knife4j / Swagger 文档（Java：`springdoc.api-docs.enabled=false`）
- [ ] 收敛登录方式（关闭注册与手机号/第三方自动建号）
- [ ] HTTPS 环境启用安全 Cookie（Java：`vben.auth.cookie-secure=true`；Node：`COOKIE_SECURE=true`）

## 系统说明

**权限模型**：RBAC（用户 → 角色 → 菜单/按钮），前后端共用同一套权限码。

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 前端路由 / 侧边菜单
                                                              └─ type=button → auth_code（按钮级权限码）
```

- **菜单权限**：后端按用户角色动态返回路由树（`GET /menu/all`），无权限的路由前端不注册（直接访问返回 404）；
- **按钮权限**：`auth_code`（如 `AC_100010` 新增用户）在前端通过 `v-access` 指令 / `hasAccessByCodes` 控制显隐，后端通过 `@SaCheckPermission`（Java）/ `@Permissions` + `PermissionGuard`（Node）校验接口；
- **超级管理员**：`code=super` 的角色拥有全部权限。

**认证机制**：登录后签发双 Token —— accessToken（2 小时，localStorage，`Authorization: Bearer <token>` 携带）+ refreshToken（7 天，HttpOnly Cookie，防 XSS）；accessToken 过期时前端自动调用 `POST /auth/refresh` 静默续期；退出登录 / 强制下线作废双 Token。

## API 文档

| 后端 | 地址 |
| --- | --- |
| Java（knife4j） | <http://localhost:8080/api/doc.html> |
| Node（Swagger） | <http://localhost:8080/api/docs> |

在线调试：先调用 `POST /auth/login` 获取 accessToken，再在文档页 Authorize 中填入 `Bearer <accessToken>`。完整接口契约见 [`vben-admin-backend/docs/api-contract.md`](./vben-admin-backend/docs/api-contract.md)。

## 常见问题 FAQ

**Q1：前端请求全部失败 / 登录无响应？**
按序排查：① 后端是否运行在 8080（`curl http://localhost:8080/api/auth/config` 应返回 JSON）；② 数据库是否已导入 `init.sql`；③ 数据库账号密码是否正确（看后端启动日志）；④ 是否有旧进程残留。

**Q2：8080 端口被占用 / 如何切换双后端？**
Java 与 Node 后端共用 8080，不能同时启动；切换只需停一个、起另一个，前端刷新重新登录（数据库共用，无需迁移）。需要并行对比时：修改 Node 端 `.env` 的 `PORT`（如 8081），并同步修改前端 `vite.config.ts` 的 `proxy.target`。

**Q3：登录页看不到手机登录 / 注册 / 第三方登录入口？**
登录方式由后端开关控制并下发（`GET /auth/config`）：Java 端在 `application.yml` 的 `vben.auth.login-methods.*` 中开启；Node 端在 `.env` 的 `LOGIN_METHODS_*` 中控制。

**Q4：验证码收不到？**
开发环境默认开启短信/邮件 Mock，验证码直接在接口响应中回显。生产请接入真实服务并关闭 Mock。

**Q5：附件上传失败提示文件过大？**
后端限制单个文件 ≤ 5MB（Java 端 multipart 上限 10MB、业务校验 5MB）。Nginx 部署时需设置 `client_max_body_size 10m;`。

**Q6：定时任务「执行一次」提示找不到 Bean / 方法？**
任务调用目标格式为 `beanName.methodName`（如 `sampleJob.run`），对应实现必须存在于后端代码中（Java：`@Component("xxx")`；Node：已注册的任务方法）。

## 许可证

[MIT](./LICENSE)
