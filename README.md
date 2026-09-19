<div align="center">

# Vben Admin 后台管理系统

**基于 Vue 3 + Vben Admin 5.7 的企业级中后台管理系统**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](#方案-a：java-后端spring-boot-41)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](#方案-b：node-后端nestjs--fastify--prisma)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](#第一步初始化数据库)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#许可证)

**简体中文** | [English](./README.en.md)

</div>

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [目录结构](#目录结构)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
  - [第 0 步：了解选型规则](#第-0-步了解选型规则)
  - [第 1 步：初始化数据库](#第一步初始化数据库)
  - [第 2 步：启动后端（Java / Node 二选一）](#第二步启动后端java--node-二选一)
  - [第 3 步：启动前端（4 套 UI 二选一）](#第三步启动前端4-套-ui-二选一)
  - [第 4 步：登录系统](#第四步登录系统)
- [功能模块一览](#功能模块一览)
- [权限模型](#权限模型)
- [认证机制](#认证机制)
- [生产构建与部署](#生产构建与部署)
- [API 文档](#api-文档)
- [常见问题 FAQ](#常见问题-faq)
- [演示账号](#演示账号)
- [许可证](#许可证)

---

## 项目简介

本项目是一套**前后端分离**的企业级中后台管理系统：

- **前端**基于 Vben Admin 5.7 monorepo，内置 **4 套 UI 框架应用**（Ant Design Vue / Ant Design Vue Next / Element Plus / Naive UI），业务代码完全一致，任选其一运行；
- **后端**提供 **Java 与 Node.js 双实现**，共用同一套 MySQL 数据库、同一份 API 契约（`docs/api-contract.md`），功能完全对等，**任选其一运行**；
- 所有后端接口统一以 `/api` 为全局前缀，前端开发服务器已预置代理，**前后端联调零配置**。

```
┌────────────────────────────┐         ┌──────────────────────────┐
│  前端（4 选 1）             │  /api   │  后端（2 选 1）           │
│  web-antd      :5666       │ ──────► │  Java  (Spring Boot 4.1) │
│  web-antdv-next:6001       │  代理    │  Node  (NestJS+Fastify)  │
│  web-ele       :5777       │         │  均监听 localhost:8080    │
│  web-naive     :5888       │         └───────────┬──────────────┘
└────────────────────────────┘                     │
                                                   ▼
                                        MySQL 8.x（vben_admin 库）
```

## 功能特性

- **认证与会话**：账号密码登录、双 Token 机制（accessToken + HttpOnly Cookie refreshToken）、无感刷新、退出登录、按用户失败锁定（可配置阈值）
- **用户管理**：分页/搜索/筛选、新增/编辑/删除、重置密码、启用禁用、密码强度校验、自我删除保护、Excel 导出
- **角色管理**：角色 CRUD、状态切换、**菜单权限分配**（勾选树）、按钮级权限码
- **部门管理**：树形组织架构、CRUD、按部门筛选用户
- **菜单管理**：目录/菜单/按钮三级结构、路由完整性校验、权限码维护
- **数据字典**：字典类型与字典数据两级管理，业务下拉数据源
- **参数配置**：系统级键值参数（如默认密码、登录失败锁定阈值）
- **定时任务**：动态 Cron 调度引擎、暂停/恢复/执行一次/CRUD，任务即 Spring Bean / NestJS 方法
- **通知管理**：向指定用户发送或按角色广播站内通知
- **消息中心**：站内信收发、未读统计、单条/全部已读
- **附件中心**：文件上传（MD5 去重信息）、类型与大小校验、删除
- **工作流**：自定义 JSON 审批链、多步审批、通过/驳回/撤回、审批记录
- **系统监控**：在线用户（强制下线）、缓存监控、JVM 状态定时检查
- **日志体系**：操作日志、登录日志（含 IP 归属地）、审计日志（数据变更快照），支持清空与导出
- **个人中心**：资料维护、头像上传、修改密码

## 目录结构

```
vben/
├── README.md                        # 本文件（简体中文）
├── README.en.md                     # English documentation
├── vben-admin-backend/              # 后端项目
│   ├── docs/
│   │   └── api-contract.md          # 前后端 API 契约（双端实现依据）
│   ├── java-backend/                # Java 实现
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/vben/backend/
│   │       │   ├── common/          # 统一返回体、异常、工具
│   │       │   ├── config/          # Sa-Token、Swagger、安全等配置
│   │       │   └── module/
│   │       │       ├── auth/        # 登录认证、双 Token、忘记密码
│   │       │       └── system/      # 用户/角色/部门/菜单/日志/任务等
│   │       └── resources/
│   │           ├── application.yml      # 主配置（端口/认证/存储/多租户开关）
│   │           └── application-dev.yml  # 开发环境（数据库连接等）
│   ├── node-backend/                # Node 实现
│   │   ├── .env                     # 环境配置（数据库/端口/JWT 等）
│   │   ├── .env.example             # 配置模板
│   │   ├── prisma/schema.prisma     # 数据模型
│   │   └── src/
│   │       ├── common/              # 统一返回体、异常过滤器、Guards
│   │       ├── modules/
│   │       │   ├── auth/            # 登录认证、JWT、手机号/扫码/OAuth
│   │       │   ├── menu/            # 前端路由树（按角色动态生成）
│   │       │   ├── system/          # 用户/角色/菜单/字典/任务/日志等
│   │       │   └── ...
│   │       └── main.ts
│   └── sql/
│       └── init.sql                 # 建库建表 + 全部表结构 + 演示数据（单文件一键导入）
└── vue-vben-admin-v5.7.0/           # 前端 monorepo（pnpm workspace）
    ├── apps/                        # 4 套 UI 框架应用（业务代码一致）
    │   ├── web-antd/                # Ant Design Vue 4 版（端口 5666）
    │   ├── web-antdv-next/          # Ant Design Vue Next 版（端口 6001）
    │   ├── web-ele/                 # Element Plus 版（端口 5777）
    │   └── web-naive/               # Naive UI 版（端口 5888）
    ├── packages/                    # 共享包（UI 组件、hooks、偏好设置等）
    ├── internal/                    # 构建配置与 Lint 配置
    └── scripts/                     # 脚本工具
```

## 技术栈

| 端 | 技术 |
| --- | --- |
| 前端 | Vue 3.5 · Vite 8 · TypeScript · Pinia · Vue Router · pnpm monorepo |
| 前端 UI（4 选 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 后端 | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node 后端 | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| 数据库 | MySQL 8.x（utf8mb4） |

## 环境要求

| 工具 | 版本要求 | 必需性 |
| --- | --- | --- |
| Node.js | ≥ 20 | 前端与 Node 后端必需 |
| pnpm | ≥ 9 | 前端与 Node 后端必需（`npm i -g pnpm`） |
| MySQL | 8.x（8.4+ 推荐） | 双后端共用 |
| JDK | 25 | 仅 Java 后端需要 |
| Maven | 3.9+ | 仅 Java 后端需要 |

### 环境安装与自检（新手必读）

如果本机还没有上述工具，按以下顺序安装；已安装的可跳过，但建议执行自检命令确认版本。

**1. 安装 Node.js 与 pnpm（前端 + Node 后端必需）**

- Windows / macOS：前往 <https://nodejs.org> 下载 LTS 版本安装包，一路下一步；
- 安装完成后**打开新的终端窗口**执行安装 pnpm：

```bash
npm i -g pnpm
```

**2. 安装 MySQL（数据库必需）**

- Windows：前往 <https://dev.mysql.com/downloads/installer/> 下载安装器，安装时记住设置的 root 密码（本文档示例为 `123456`）；
- macOS：`brew install mysql && brew services start mysql`；
- Linux（Debian/Ubuntu）：`sudo apt install mysql-server && sudo systemctl start mysql`。

**3. 安装 JDK 25 与 Maven（仅 Java 后端需要）**

- JDK：前往 <https://jdk.java.net/25/> 下载，解压后配置 `JAVA_HOME` 环境变量；
- Maven：前往 <https://maven.apache.org/download.cgi> 下载，解压后将其 `bin` 目录加入 `PATH`。

**4. 环境自检**

全部安装完成后，在终端逐一执行以下命令，确认版本号输出且**不低于要求**：

```bash
node -v      # 应输出 v20.x 或更高
pnpm -v      # 应输出 9.x 或更高
mysql --version   # 应输出 mysql Ver 8.x
java -version     # 仅 Java 后端需要，应输出 25.x
mvn -v            # 仅 Java 后端需要，应输出 3.9.x 或更高
```

> ❓ 某条命令提示「不是内部或外部命令」/「command not found」：说明对应工具未安装成功或未加入 `PATH`，请重新检查安装步骤与环境变量配置。

**5. 获取代码**

```bash
git clone <仓库地址> vben
cd vben
```

## 快速开始

### 第 0 步：了解选型规则

开始前请做两个选择，后续步骤按所选组合执行：

| 决策 | 选项 | 说明 |
| --- | --- | --- |
| 后端 | **Java** 或 **Node** | 功能完全对等，共用数据库；运行时只能二选一（同占 8080 端口），切换无需迁移数据 |
| 前端 UI | **web-antd** / **web-antdv-next** / **web-ele** / **web-naive** | 业务代码一致，仅组件库不同；可同时安装、随时切换 |

### 第一步：初始化数据库

`init.sql` 一个文件完成**建库（vben_admin）→ 建 20 张表 → 灌入演示数据**，Java / Node 后端共用。

#### 1.1 确认 MySQL 服务已运行

```bash
# Windows（管理员 PowerShell）
Get-Service MySQL*          # Status 应为 Running；未运行则 Start-Service MySQL80

# macOS / Linux
mysqladmin -uroot -p status # 能输出 Uptime 即正常
```

#### 1.2 执行导入（三选一）

**方式一：MySQL 命令行（推荐）**

在**项目根目录**下执行（Windows PowerShell 用户请用方式二中的 `source` 写法，PowerShell 不支持 `<`）：

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

**方式二：进入 mysql 交互环境执行**

```bash
mysql -uroot -p
```

```sql
SOURCE C:/Users/你的路径/vben-admin-backend/sql/init.sql;   -- Windows 路径用正斜杠
-- 或
SOURCE /path/to/vben-admin-backend/sql/init.sql;             -- macOS / Linux
```

**方式三：图形化工具（Navicat / DBeaver / DataGrip 等）**

新建查询窗口，粘贴 `vben-admin-backend/sql/init.sql` 全量执行。

#### 1.3 验证导入结果

```sql
USE vben_admin;
SHOW TABLES;                      -- 应看到约 20 张表（sys_user、sys_menu、sys_role 等）
SELECT COUNT(*) FROM sys_menu;    -- 返回 20
SELECT username, real_name FROM sys_user;   -- 应有 vben / admin / jack 三个账号
```

三条 SQL 都符合预期，数据库即初始化完成 ✅

> - 脚本内置 `CREATE DATABASE IF NOT EXISTS` 与 `USE vben_admin`，导入即强制写入 `vben_admin` 库（即使用 `-D 其他库` 指定也会覆盖）；
> - 重复执行安全（建表均带 `IF NOT EXISTS`，但演示数据会因主键冲突中断，因此**仅首次导入执行**）；
> - ❓ 报 `Access denied`：密码不对，确认 root 密码；❓ 报 `command not found`：mysql 未加入 `PATH`，使用完整路径（如 `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`）。

### 第二步：启动后端（Java / Node 二选一）

#### 方案 A：Java 后端（Spring Boot 4.1）

**A-1. 确认 JDK 与 Maven 版本**

```bash
java -version    # 必须 25.x；低版本会编译失败
mvn -v           # 必须 3.9+
```

**A-2. 首次编译（可选，验证环境）**

```bash
cd vben-admin-backend/java-backend
mvn clean compile          # 看到 BUILD SUCCESS 即环境正常
```

**A-3. 启动后端**

```bash
mvn spring-boot:run
```

**A-4. 确认启动成功**

终端出现以下日志即为成功（首次启动需下载依赖，可能耗时数分钟）：

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-5. 验证接口连通**

新开一个终端执行（返回 JSON 即正常）：

```bash
curl http://localhost:8080/api/auth/config
# 预期输出：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

> ❓ **常见失败**：
> - `Connection refused` 于数据库相关日志 → MySQL 未启动或账号密码与 `application-dev.yml` 不符；
> - `Port 8080 was already in use` → 8080 被占用（可能是 Node 后端在跑），先停掉或改端口；
> - 编译报错提示 JDK 版本 → 确认 `java -version` 为 25，并检查 `JAVA_HOME` 指向 JDK 25。
>
> **保持这个终端窗口不要关闭**，后端以前台方式持续运行；按 `Ctrl + C` 可停止。

<details>
<summary><b>常用配置（点击展开）</b></summary>

数据库连接在 `src/main/resources/application-dev.yml`，支持环境变量覆盖：

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DB_HOST` | `localhost` | 数据库地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_USERNAME` | `root` | 数据库账号 |
| `DB_PASSWORD` | `123456` | 数据库密码 |

`application.yml` 其他关键配置：

| 配置项 | 说明 |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken 有效期（秒，默认 7200） |
| `vben.auth.refresh-token-days` | refreshToken 有效天数（默认 7） |
| `vben.auth.login-methods.*` | 登录方式开关（account/phone/qrcode/register/oauth） |
| `vben.auth.sms-mock` / `email-mock` | 短信/邮件 Mock（验证码接口回显，生产关闭） |
| `vben.auth.upload-dir` | 上传文件目录（默认 `./uploads`） |
| `app.message.mail-enabled` | 消息中心邮件通知开关 |
| `app.tenant.enabled` | 多租户开关 |

</details>

<details>
<summary><b>打包部署（点击展开）</b></summary>

```bash
# 停止正在运行的后端进程后执行，否则 target/*.jar 被占用导致 repackage 失败
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar
```

</details>

#### 方案 B：Node 后端（NestJS 12 + Fastify 5 + Prisma 7）

**B-1. 安装依赖（首次）**

```bash
cd vben-admin-backend/node-backend
pnpm install
```

预期输出末尾为 `Done in x.xs`。❓ 若报 `[ERR_PNPM_IGNORED_BUILDS]`，确认 `pnpm-workspace.yaml` 中 `allowBuilds` 各项为 `true` 后重试。

**B-2. 生成 Prisma Client（首次必须，否则启动时报 PrismaClient 初始化错误）**

```bash
pnpm db:generate
```

预期输出 `✔ Generated Prisma Client`。

**B-3. 检查环境配置**

打开 `node-backend/.env`，重点核对 `DATABASE_URL` 的账号密码与第一步导入时使用的一致（默认 `root/123456`）。

**B-4. 启动后端**

```bash
pnpm start            # 运行编译产物 dist/main.js（推荐）
# 或开发模式（改代码自动重启）
pnpm dev
```

**B-5. 确认启动成功**

终端出现以下日志即为成功：

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. 验证接口连通**

新开一个终端执行（返回 JSON 即正常）：

```bash
curl http://localhost:8080/api/auth/config
# 预期输出：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

> ❓ **常见失败**：
> - `Cannot find module '@prisma/client'` → 漏了 B-2 步骤，执行 `pnpm db:generate`；
> - `Can't reach database server` → MySQL 未启动或 `.env` 连接串不对；
> - `Port 8080 is already in use` → 8080 被占用（可能是 Java 后端在跑），先停掉。
>
> **保持这个终端窗口不要关闭**，后端以前台方式持续运行；按 `Ctrl + C` 可停止。

<details>
<summary><b>常用配置与命令（点击展开）</b></summary>

所有配置集中在 `node-backend/.env`（模板见 `.env.example`）：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | 数据库连接串 |
| `PORT` | `8080` | 服务端口（与前端代理对齐） |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev 占位值 | JWT 签名密钥，**生产必须更换** |
| `ACCESS_TOKEN_EXPIRES` | `2h` | accessToken 有效期 |
| `REFRESH_TOKEN_DAYS` | `7` | refreshToken 有效天数 |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | `true`（phone 等见文件） | 登录方式开关，登录页据此显隐入口 |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `true` | 首次手机号/第三方登录自动建号（生产建议 `false`） |
| `UPLOAD_DIR` | `./uploads` | 上传目录 |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | 短信/邮件 Mock（验证码回显） |

其他命令：

```bash
pnpm dev              # 开发模式（tsx watch 热重载，改代码自动重启）
pnpm build            # 编译到 dist/
pnpm db:push          # 按 schema.prisma 同步表结构（一般无需使用，建表以 init.sql 为准）
pnpm db:studio        # Prisma 可视化数据浏览器
```

> **注意**：pnpm 10+ 默认拦截依赖构建脚本。若 `pnpm install` 报
> `[ERR_PNPM_IGNORED_BUILDS]`，请确认 `pnpm-workspace.yaml` 中 `allowBuilds` 各项为
> `true`（仓库已预置）后重新安装，并再次执行 `pnpm db:generate`。

</details>

> **双后端如何选择？**
> - 功能 100% 对等、数据库共用，切换零成本（停一个 → 起另一个 → 前端刷新重新登录）；
> - 团队偏 JVM 生态、需要 MyBatis 灵活 SQL → **Java**；
> - 团队偏全栈 TS、追求秒级启动与轻量部署 → **Node**；
> - 也可以先跑 Node 快速体验，再深入 Java 实现对照 `docs/api-contract.md` 阅读源码。

### 第三步：启动前端（4 套 UI 二选一）

| 应用 | UI 框架 | 开发端口 | filter 参数 |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `@vben/web-antd` |
| `web-antdv-next` | Ant Design Vue（next） | 6001 | `@vben/web-antdv-next` |
| `web-ele` | Element Plus | 5777 | `@vben/web-ele` |
| `web-naive` | Naive UI | 5888 | `@vben/web-naive` |

**F-1. 安装前端依赖（首次，一次装齐 4 套应用）**

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

预期输出末尾为 `Done in x.xs`（首次安装需下载数百 MB 依赖，耐心等待）。

**F-2. 启动所选 UI 应用（以 Ant Design Vue 版为例）**

```bash
pnpm --filter @vben/web-antd dev
```

**F-3. 确认启动成功**

终端出现以下输出即为成功（首次启动需预热依赖，可能耗时 20~40 秒）：

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. 浏览器访问并登录**

1. 打开浏览器访问 `http://localhost:5666`；
2. 自动跳转到登录页，输入演示账号 `vben / 123456`；
3. 完成滑块验证后点击「登录」；
4. 成功登录并跳转到分析页/工作台 → **全部部署完成 🎉**

> ❓ **常见失败**：
> - `pnpm install` 卡住或超时 → 配置国内镜像：`pnpm config set registry https://registry.npmmirror.com` 后重试；
> - 页面打开但接口报错（Network 面板 500/404）→ 后端未启动或端口不一致，回到第二步检查；
> - 端口 5666 被占用 → 修改 `apps/web-antd/.env.development` 的 `VITE_PORT` 后重启前端。
>
> **保持这个终端窗口不要关闭**；按 `Ctrl + C` 可停止前端。

**F-5. 换用其他 UI（可选）**

4 套应用已同时安装，停止当前前端后仅替换 filter 参数即可切换（端口见对照表）：

```bash
pnpm --filter @vben/web-ele dev       # Element Plus 版 → http://localhost:5777
pnpm --filter @vben/web-naive dev     # Naive UI 版 → http://localhost:5888
pnpm --filter @vben/web-antdv-next dev
```

> **前后端如何对接？** 已自动完成。每个应用 `vite.config.ts` 均预置代理
> `/api/**` → `http://localhost:8080/api/**`，后端跑在默认 8080 端口时前端零配置。
> 后端改端口时，同步修改 `apps/<你的应用>/vite.config.ts` 中的 `proxy.target`。

### 第四步：登录系统

访问前端地址，使用演示账号登录（密码均为 `123456`）：

| 账号 | 角色 | 登录后首页 | 可见范围 |
| --- | --- | --- | --- |
| **vben** | super 超级管理员 | /analytics 分析页 | 全部菜单与全部按钮权限 |
| **admin** | admin 管理员 | /workspace 工作台 | 系统管理/系统监控/系统工具；用户增删改查、角色编辑 |
| **jack** | user 普通用户 | /analytics 分析页 | 仅用户管理（只读）与角色管理；越权访问返回 403/404 |

> **开发期登录方式**：账号密码登录默认开启。手机验证码 / 扫码 / 注册 / 第三方 OAuth
> 由后端开关控制（Java 端 `application.yml` 默认仅开账号登录；Node 端 `.env` 默认全开），
> 开启后登录页会自动显示对应入口，验证码在 Mock 模式下直接回显。

## 功能模块一览

| 模块 | 路由 | 最低可见角色 | 说明 |
| --- | --- | --- | --- |
| 分析页 | `/analytics` | 所有角色 | 用户/角色/部门/菜单统计、流量趋势、分布图表 |
| 工作台 | `/workspace` | 所有角色 | 快捷入口、待办事项、最近通知 |
| 用户管理 | `/system/user` | super / admin / user(只读) | 分页搜索、增删改、重置密码、启禁用、导出 |
| 角色管理 | `/system/role` | super / admin / user | 角色 CRUD、菜单权限分配树 |
| 部门管理 | `/system/dept` | super / admin | 树形组织架构 CRUD |
| 菜单管理 | `/system/menu` | super / admin | 目录/菜单/按钮三级管理、权限码维护 |
| 在线用户 | `/system/monitor-cat/online` | super / admin | 会话列表、强制下线 |
| 操作日志 | `/system/monitor-cat/operation-log` | super / admin | 后台操作审计、导出、清空 |
| 登录日志 | `/system/monitor-cat/login-log` | super / admin | 登录记录（含 IP 归属地） |
| 审计日志 | `/system/monitor-cat/audit-log` | super | 数据变更前后快照对比 |
| 系统监控 | `/system/monitor-cat/monitor` | super / admin | 缓存与运行时状态 |
| 数据字典 | `/system/tools/dict` | super / admin | 字典类型 + 字典数据两级管理 |
| 参数配置 | `/system/tools/config` | super / admin | 系统键值参数 |
| 定时任务 | `/system/tools/job` | super / admin | Cron 调度、暂停/恢复/执行一次 |
| 通知管理 | `/system/tools/notice` | super / admin | 按用户发送 / 按角色广播 |
| 消息中心 | `/system/tools/message` | super / admin | 站内信收发、已读管理 |
| 附件中心 | `/system/tools/attachment` | super / admin | 上传、预览、删除 |
| 工作流 | `/system/tools/workflow` | super / admin | 流程定义、发起、审批（通过/驳回/撤回） |
| 个人中心 | `/profile` | 所有角色 | 资料、头像、修改密码 |

## 权限模型

系统采用 **RBAC（用户 → 角色 → 菜单/按钮）** 模型，前后端共用同一套权限码：

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 前端路由/侧边菜单
                                                              └─ type=button → auth_code（按钮级权限码）
```

- **菜单权限**：后端按用户角色动态返回路由树（`GET /menu/all`），无权限的路由前端根本不注册（直接访问返回 404）；
- **按钮权限**：`sys_menu(type=button).auth_code`（如 `AC_100010` 新增用户），前端通过 `v-access` 指令 / `hasAccessByCodes` 控制按钮显隐，后端通过 `@SaCheckPermission`（Java）/ `@Permissions` + `PermissionGuard`（Node）校验接口，**同一套码双向生效**；
- **超级管理员**：`code=super` 的角色拥有全部权限，无需逐条分配。

## 认证机制

登录成功后签发**双 Token**：

1. **accessToken**：有效期 2 小时，前端存入 localStorage，每次请求通过 `Authorization: Bearer <token>` 头携带；
2. **refreshToken**：有效期 7 天，写入 **HttpOnly Cookie**（前端 JS 不可读，防 XSS）；
3. accessToken 过期时前端自动携带 Cookie 调用 `POST /auth/refresh` 静默续期，用户无感知；
4. 退出登录 / 管理员强制下线会同时作废双 Token。

## 生产构建与部署

### 前端

```bash
cd vue-vben-admin-v5.7.0
pnpm --filter @vben/web-antd build     # 产物：apps/web-antd/dist
```

Nginx 参考配置：

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

### 后端

```bash
# Java（先停掉运行中的进程，避免 jar 被占用）
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

**生产安全清单**：

- [ ] 更换 Node 端 `.env` 中两个 JWT Secret 与数据库密码
- [ ] 数据库默认密码 `123456` 修改，演示账号下线或改密
- [ ] 关闭 SMS/EMAIL Mock（Java：`vben.auth.sms-mock=false`；Node：`.env` 同名项置 `false`）并接入真实短信/邮件服务
- [ ] 关闭 knife4j/Swagger 文档（Java：`springdoc.api-docs.enabled=false`）
- [ ] 登录方式按需收敛（关闭注册与第三方自动建号）
- [ ] HTTPS 环境下启用安全 Cookie（Java：`vben.auth.cookie-secure=true`；Node：`COOKIE_SECURE=true`）

## API 文档

| 后端 | 地址 |
| --- | --- |
| Java（knife4j） | <http://localhost:8080/api/doc.html> |
| Node（Swagger） | <http://localhost:8080/api/docs> |

在线调试：先调用 `POST /auth/login` 获取 accessToken，再在文档页 Authorize 中填入 `Bearer <accessToken>`。

接口契约详见 [`vben-admin-backend/docs/api-contract.md`](./vben-admin-backend/docs/api-contract.md)。

## 常见问题 FAQ

**Q1：前端请求全部失败 / 登录无响应？**
按顺序排查：① 后端是否启动在 8080（`curl http://localhost:8080/api/auth/config` 应返回 JSON）；② 数据库是否已执行 `init.sql`；③ 数据库连接账号密码是否正确（看后端启动日志）；④ 前端与后端是否都重启过（避免旧进程残留旧端口）。

**Q2：Node 端 `pnpm install` 报 `[ERR_PNPM_IGNORED_BUILDS]`？**
pnpm 10+ 默认拦截依赖构建脚本。确认 `node-backend/pnpm-workspace.yaml` 中 `allowBuilds` 各项为 `true` 后重新 `pnpm install`，并执行 `pnpm db:generate` 生成 Prisma Client。

**Q3：8080 端口被占用？**
Java 与 Node 后端共用 8080，不能同时启动。需要并行对比时：修改 Node 端 `.env` 的 `PORT`（如 8081），并同步修改前端 `vite.config.ts` 的 `proxy.target`。

**Q4：如何从 Java 后端切换到 Node 后端（或反向）？**
停止当前后端 → 启动另一套 → 前端刷新页面重新登录。数据库共用，数据无缝衔接；双端接口行为已对齐（含错误码与提示文案）。

**Q5：登录页看不到手机登录 / 注册 / 第三方登录入口？**
登录方式由后端开关控制并下发（`GET /auth/config`）。Java 端默认仅开启账号登录，在 `application.yml` 的 `vben.auth.login-methods.*` 中开启；Node 端在 `.env` 的 `LOGIN_METHODS_*` 中控制。

**Q6：验证码收不到？**
开发环境默认开启短信/邮件 Mock，验证码直接在接口响应中回显（登录页自动填入或接口返回 `mockCode`）。生产请接入真实服务并关闭 Mock。

**Q7：附件上传失败提示文件过大？**
后端限制单个文件 ≤ 5MB（Java 端 multipart 上限 10MB、业务校验 5MB）。Nginx 部署时还需设置 `client_max_body_size 10m;`。

**Q8：定时任务「执行一次」提示找不到 Bean / 方法？**
任务调用目标格式为 `beanName.methodName`（如 `sampleJob.run`），对应的 Bean 必须存在于后端代码中（Java：`@Component("xxx")`；Node：注册的任务方法）。新增任务前先确认目标已实现。

## 演示账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| vben | 123456 | super（全部权限） |
| admin | 123456 | admin |
| jack | 123456 | user（部分权限） |

## 许可证

[MIT](./LICENSE)
