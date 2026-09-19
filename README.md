# Vben Admin 后台管理系统

基于 **Vben Admin 5.7** 的企业级后台管理系统，采用**前后端分离**架构：

- **前端**：一套 Vue 3 代码库，内置 **4 套 UI 框架应用**（Ant Design Vue / Ant Design Vue Next / Element Plus / Naive UI），任选其一运行；
- **后端**：提供 **Java 与 Node.js 双实现**，两者共用同一套 MySQL 数据库与 API 契约，功能完全对等，**任选其一运行**；
- 所有后端接口均以 `/api` 为全局前缀，前端开发服务器已预配置代理，无需手动修改。

```
┌────────────────────────────┐         ┌──────────────────────────┐
│  前端（4 选 1）             │  /api   │  后端（2 选 1）           │
│  web-antd      :5666       │ ──────► │  Java  (Spring Boot)     │
│  web-antdv-next:6001       │  代理    │  Node  (NestJS+Fastify)  │
│  web-ele       :5777       │         │  均监听 localhost:8080    │
│  web-naive     :5888       │         └───────────┬──────────────┘
└────────────────────────────┘                     │
                                                   ▼
                                        MySQL 8.x（vben_admin 库）
```

## 目录结构

```
├── vben-admin-backend/              # 后端项目
│   ├── docs/api-contract.md         # 前后端 API 契约（双端实现依据）
│   ├── java-backend/                # Java 实现（Spring Boot 4.1）
│   │   └── src/main/resources/application.yml   # 主配置文件
│   ├── node-backend/                # Node 实现（NestJS 12 + Fastify 5 + Prisma 7）
│   │   ├── .env                     # 环境配置（数据库/端口/JWT 等）
│   │   └── prisma/schema.prisma     # 数据模型
│   └── sql/
│       └── init.sql                 # 建库建表 + 全部表结构 + 演示数据（双后端共用，单文件一键导入）
└── vue-vben-admin-v5.7.0/           # 前端 monorepo（pnpm workspace）
    └── apps/
        ├── web-antd/                # Ant Design Vue 版（默认端口 5666）
        ├── web-antdv-next/          # Ant Design Vue Next 版（端口 6001）
        ├── web-ele/                 # Element Plus 版（端口 5777）
        └── web-naive/               # Naive UI 版（端口 5888）
```

## 环境要求

| 工具 | 版本要求 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 20 | 前端与 Node 后端必需 |
| pnpm | ≥ 9 | 前端与 Node 后端包管理器（`npm i -g pnpm`） |
| MySQL | 8.x（8.4+ 推荐） | 双后端共用同一数据库 |
| JDK | 25 | **仅 Java 后端需要** |
| Maven | 3.9+ | **仅 Java 后端需要** |

## 第一步：初始化数据库

`init.sql` 会自动完成**建库（vben_admin）→ 建表 → 灌入演示数据**三步，Java / Node 后端共用，任选以下一种方式执行：

**方式一：MySQL 命令行（推荐）**

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

或进入 mysql 交互环境后执行：

```sql
SOURCE /path/to/vben-admin-backend/sql/init.sql;
```

**方式二：图形化工具（Navicat / DBeaver / DataGrip 等）**

新建查询窗口，打开 `vben-admin-backend/sql/init.sql` 全量执行即可。

> 执行成功后可通过 `SHOW TABLES;` 确认，应能看到 `sys_user`、`sys_menu`、`sys_role` 等约 20 张表
>（含消息中心、附件、审计日志、工作流相关表）。

## 第二步：启动后端（Java / Node 二选一）

两套后端实现完全对等、监听同一端口（`localhost:8080`），**运行时只能二选一**（端口冲突），切换时先停掉当前运行的后端即可，前端无需任何改动。

### 方案 A：Java 后端（Spring Boot 4.1）

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

看到 `Started BackendApplication` 即启动成功，接口前缀为 `/api`。

<details>
<summary>数据库连接与常用配置（application-dev.yml / 环境变量）</summary>

数据库默认连接 `localhost:3306/vben_admin`，账号 `root/123456`，可通过环境变量覆盖：

```bash
DB_HOST=localhost DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=123456 mvn spring-boot:run
```

其他常用开关（`application.yml`）：
- `VBEN_AUTH_UPLOAD_DIR`：上传文件存储目录（默认 `./uploads`）
- 登录方式开关、SMS/邮件 Mock 等均在 `application.yml` 的 `vben.auth` 节点

</details>

<details>
<summary>打包部署（生产）</summary>

```bash
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar
```

</details>

### 方案 B：Node 后端（NestJS 12 + Fastify 5 + Prisma 7）

```bash
cd vben-admin-backend/node-backend
pnpm install          # 首次执行；若提示依赖构建脚本被忽略，按第 3 步处理
pnpm db:generate      # 生成 Prisma Client（首次必须执行）
pnpm start            # 运行编译产物 dist/main.js
```

看到 `服务启动: http://localhost:8080`、`数据库连接成功` 即启动成功。

<details>
<summary>开发模式与其他命令</summary>

```bash
pnpm dev              # 开发模式（tsx watch 热重载）
pnpm build            # 编译到 dist/
pnpm db:push          # 以 prisma/schema.prisma 同步表结构（一般无需使用，建表以 init.sql 为准）
```

> **注意**：pnpm 10+ 默认拦截依赖的构建脚本。若安装时出现 `[ERR_PNPM_IGNORED_BUILDS]`，
> 请确认 `pnpm-workspace.yaml` 中 `allowBuilds` 各项为 `true`（仓库已预置），再重新 `pnpm install`。

</details>

<details>
<summary>环境配置（.env）</summary>

Node 端所有配置集中在 `node-backend/.env`（参考 `.env.example`）：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `DATABASE_URL` | MySQL 连接串 | `mysql://root:123456@localhost:3306/vben_admin` |
| `PORT` | 服务端口（与前端代理对齐） | `8080` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT 签名密钥，**生产必须更换** | dev 占位值 |
| `ACCESS_TOKEN_EXPIRES` | accessToken 有效期 | `2h` |
| `REFRESH_TOKEN_DAYS` | refreshToken 有效天数 | `7` |
| `LOGIN_METHODS_*` | 登录方式开关（账号/手机/扫码/注册/第三方） | `true` / `false` |
| `SMS_MOCK` / `EMAIL_MOCK` | 短信与邮件 Mock（验证码回显） | `true` |

</details>

> **双后端如何选择？** 功能完全一致。团队技术栈偏 JVM 选 Java；偏全 JS/TS、追求轻量快速启动选 Node。
> 想对比验证时，可分别启动（切换前先停掉另一个），数据层共用，切换无迁移成本。

## 第三步：启动前端（4 套 UI 二选一）

4 套应用共享同一套业务代码与页面，仅 UI 组件库不同，任选其一：

| 应用 | UI 框架 | 开发端口 |
| --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 |
| `web-antdv-next` | Ant Design Vue（next） | 6001 |
| `web-ele` | Element Plus | 5777 |
| `web-naive` | Naive UI | 5888 |

```bash
cd vue-vben-admin-v5.7.0
pnpm install                          # monorepo 首次安装（已含全部 4 套应用）

# 以 Ant Design Vue 版为例：
pnpm --filter @vben/web-antd dev
```

启动成功后访问 `http://localhost:5666`（其他应用对应上表端口）。换用其他 UI 只需替换 `--filter` 参数，例如：

```bash
pnpm --filter @vben/web-ele dev       # Element Plus 版，端口 5777
pnpm --filter @vben/web-naive dev     # Naive UI 版，端口 5888
pnpm --filter @vben/web-antdv-next dev
```

> **前后端如何对接？** 已自动完成——每个应用 `vite.config.ts` 均预置了代理：
> `/api/**` → `http://localhost:8080/api/**`。只要后端跑在默认 8080 端口，前端零配置。
> 若后端改用其他端口，同步修改对应 `apps/<你的应用>/vite.config.ts` 中的 `proxy.target` 即可。

## 第四步：登录系统

使用下方任一演示账号登录（密码均为 `123456`）：

| 账号 | 角色 | 可见范围 |
| --- | --- | --- |
| **vben** | super 超级管理员 | 全部菜单与全部按钮权限 |
| **admin** | admin 管理员 | 系统管理/系统监控/系统工具，用户增删改查、角色编辑 |
| **jack** | user 普通用户 | 仅用户管理（只读）与角色管理，越权访问返回 403/404 |

登录后即可体验：用户/角色/部门/菜单管理、数据字典、参数配置、定时任务、通知与消息中心、附件中心、工作流审批、在线用户强退、操作/登录/审计日志等全部功能。

## 生产构建

```bash
# 前端打包（产物在 apps/<你的应用>/dist）
pnpm --filter @vben/web-antd build

# Java 后端
cd vben-admin-backend/java-backend && mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node 后端
cd vben-admin-backend/node-backend && pnpm build
pnpm start
```

生产部署提示：
1. **更换所有默认密钥**：Node 端 `.env` 中两个 JWT Secret、数据库密码；
2. 后端跨域/文件上传目录（`UPLOAD_DIR` / `VBEN_AUTH_UPLOAD_DIR`）按实际环境调整；
3. 前端构建产物由 Nginx 等静态服务器托管，并将 `/api` 反向代理到后端 8080。

## API 文档

后端启动后访问 Swagger 在线文档：

- Java 端（knife4j）：[http://localhost:8080/api/doc.html](http://localhost:8080/api/doc.html)
- Node 端（Swagger）：[http://localhost:8080/api/docs](http://localhost:8080/api/docs)

在线调试时在 Authorize 处填入登录接口返回的 accessToken。

## 常见问题（FAQ）

**Q：前端页面一直提示请求失败 / 登录无响应？**
依次确认：① 后端是否启动在 8080 端口（`curl http://localhost:8080/api/auth/config` 应返回 JSON）；② 数据库是否已执行 `init.sql` 且连接账号正确；③ 后端与前端是否有一个未重启导致旧端口残留。

**Q：Node 端 `pnpm install` 报 `ERR_PNPM_IGNORED_BUILDS`？**
pnpm 10+ 默认不执行依赖构建脚本。确认 `node-backend/pnpm-workspace.yaml` 中 `allowBuilds` 各项为 `true` 后重新安装，并执行 `pnpm db:generate` 生成 Prisma Client。

**Q：8080 端口被占用？**
Java 与 Node 后端共用 8080，不能同时启动。需要并行对比时，修改 Node 端 `.env` 的 `PORT` 与前端 `vite.config.ts` 的 `proxy.target` 指向新端口。

**Q：如何从 Java 后端切换到 Node 后端（或反向）？**
停掉当前运行的后端进程 → 启动另一套 → 前端刷新页面重新登录即可。数据库共用，数据无缝衔接。

**Q：忘记密码 / 测试验证码收不到？**
开发环境默认开启短信/邮件 Mock，验证码会直接在接口响应中回显；生产环境请接入真实短信/邮件服务并关闭 Mock 开关。

## 演示账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| vben | 123456 | super（全部权限） |
| admin | 123456 | admin |
| jack | 123456 | user（部分权限） |
