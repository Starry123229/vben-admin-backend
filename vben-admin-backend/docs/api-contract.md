# Vben Admin v5.7.0 后端 API 契约

> 提取自 `vue-vben-admin v5.7.0` 的 `apps/backend-mock`（Nitro 实现）及前端 `apps/web-antd` 的实际消费代码。
> 本文档是 Java 后端与 Node 后端的**共同实现规范**，两端必须产出完全一致的 HTTP 行为。

---

## 目录

- [1. 端点总览](#1-端点总览)
- [2. 通用约定](#2-通用约定)
- [3. 核心端点（必须实现）](#3-核心端点必须实现)
- [4. 前端认证时序（实现参考）](#4-前端认证时序实现参考)
- [5. 扩展端点（可选实现）](#5-扩展端点可选实现)
- [6. 数据模型与建表建议](#6-数据模型与建表建议)
- [7. 前端对接步骤](#7-前端对接步骤)
- [8. 实现注意事项（坑点清单）](#8-实现注意事项坑点清单)
- [9. 联调验收清单](#9-联调验收清单)

---

## 1. 端点总览

### 1.1 核心端点（登录跑通必需，共 6 个）

| # | 方法 | 路径 | 鉴权 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/auth/login` | 无 | 登录，返回 accessToken，种 refresh Cookie |
| 2 | POST | `/auth/refresh` | Cookie | 刷新 accessToken，**响应体为裸字符串** |
| 3 | POST | `/auth/logout` | Cookie | 登出，清 Cookie |
| 4 | GET | `/auth/codes` | Bearer | 按钮权限码列表 |
| 5 | GET | `/user/info` | Bearer | 当前用户信息 |
| 6 | GET | `/menu/all` | Bearer | 后端模式的动态菜单路由树 |

> 注意 1：默认 `accessMode = 'frontend'`（见 `packages/@core/preferences/src/config.ts`），此时前端不调用 `/menu/all`。只有把偏好设置切到 backend 模式才会调用。后端仍应实现它。
> 注意 2：仓库自带 5 个前端 app（web-antd / web-ele / web-naive / web-tdesign / web-antdv-next）的核心 API 层完全一致（已逐一核对），实现一套后端即可服务全部 app。

### 1.2 扩展端点（演示/管理功能，可选实现）

| 组 | 方法与路径 |
|----|-----------|
| system | GET `/system/user/list`、GET `/system/role/list`、GET `/system/menu/list`、GET `/system/menu/name-exists`、GET `/system/menu/path-exists`、GET `/system/dept/list`、POST `/system/dept`、PUT `/system/dept/{id}`、DELETE `/system/dept/{id}` |
| table | GET `/table/list` |
| upload | POST `/upload` |
| timezone | GET `/timezone`、GET `/timezone/options`、POST `/timezone/set` |
| 调试 | GET `/status`、GET `/test`、POST `/test`、GET `/demo/bigint` |

> web-antd v5.7.0 的 `src/` 内没有任何代码调用扩展端点（已全文检索确认），它们服务于 playground/演示场景。自建后端建议按需实现，用于验证分页、上传等通用能力。

---

## 2. 通用约定

### 2.1 基础路径

- 前端请求前缀：`VITE_GLOB_API_URL=/api`，所有请求发往 `/api/**`。
- 后端路由的**逻辑路径以 `/api` 为根**，例如前端调 `/api/auth/login` → 后端处理 `/auth/login`（Java 可用 `context-path: /api` 或网层去掉前缀，见 [第 7 节](#7-前端对接步骤)）。

### 2.2 统一响应包裹

```json
{
  "code": 0,
  "data": {},
  "error": null,
  "message": "ok"
}
```

- `code = 0`：成功。前端拦截器（`defaultResponseInterceptor`，`codeField=code` / `dataField=data` / `successCode=0`）直接返回 `data` 字段给业务代码。
- `code = -1`（非 0）：业务失败。前端抛出异常并读取 `response.data.error ?? response.data.message` 作为提示文案，二者至少填一个。
- HTTP 状态码与包裹体**同时使用**：mock 的错误响应是「非 2xx 状态码 + 包裹体」的组合（如 403 + code:-1）。
- 唯一例外：`POST /auth/refresh` 成功时返回**裸 token 字符串**，不包裹（见 3.2）。

### 2.3 HTTP 状态码语义（前端行为对齐）

| 状态码 | 前端行为 |
|--------|---------|
| 2xx / 3xx | 走包裹体解析（code 判断） |
| 400 | 提示 badRequest，读取包裹体 `error`/`message` |
| 401 | **触发无感刷新流程**（携带 Cookie 调 `/auth/refresh`），刷新失败则强制重新登录 |
| 403 | 提示 forbidden |
| 404 | 提示 notFound |
| 408 | 提示 requestTimeout |
| 其他 | 提示 internalServerError |

### 2.4 认证机制（双 token）

- **accessToken**：登录响应体返回，前端存 Pinia/localStorage，每次请求放 `Authorization: Bearer <token>` 头。mock 设定 7 天有效。
- **refreshToken**：**不出现在响应体**，通过 `Set-Cookie` 下发：
  - Cookie 名：`jwt`
  - `HttpOnly; SameSite=None; Secure;`
  - `maxAge = 86400`（24 小时，注意：mock 的 JWT 本体有效期是 30 天，两者不一致，见第 8 节）
- 请求 `/auth/refresh` 时浏览器自动带 Cookie（前端 `withCredentials: true`）。

### 2.5 JWT 细节（mock 实现）

- 算法 HS256；access 与 refresh 使用**不同密钥**（`access_token_secret` / `refresh_token_secret`，自建后端必须换成强随机密钥并放配置）。
- Payload 直接放**用户对象**：`{ id, username, realName, roles, homePath, iat, exp }`。
- 校验 access token 后，mock 会**按 username 回查用户**再返回用户信息（等价于 token 里只信任 username，其余以库为准）——自建后端建议沿用此模式，便于改密/禁用即时生效。

### 2.6 CORS（仅跨域直连时需要）

mock 由两层组成：`nitro.config.ts` 的 `routeRules` 对 `/api/**` 开启 cors 并设置响应头，`middleware/1.api.ts` 再回显请求 `Origin` 到 `Access-Control-Allow-Origin`（覆盖通配符），`OPTIONS` 返回 204。自建后端跨域直连时需：

- `Access-Control-Allow-Credentials: true` + **回显 Origin**（带 Cookie 时不能为 `*`）
- `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`
- `Access-Control-Allow-Headers` 至少含 `Accept, Authorization, Content-Type, X-Requested-With`

开发期走 Vite 同源代理（推荐）则无 CORS 问题。

### 2.7 请求头与数组参数序列化

前端每次请求固定携带：

- `Authorization: Bearer <accessToken>`（有 token 时）
- `Accept-Language: <locale>`（如 `zh-CN`，取自偏好设置，后端可用于错误信息国际化）

GET 数组参数默认按 **brackets** 序列化（`@vben/request` 的 `paramsSerializer` 默认值）：`ids[]=1&ids[]=2&ids[]=3`。后端解析数组 query 时注意兼容此格式（Spring 需 `List<Long> ids` 直接绑定，Nitro 需处理 `ids[]` 键名）。

### 2.8 演示拦截器（不要模仿）

mock 的 `middleware/1.api.ts` 对 `POST/PUT/PATCH/DELETE /api/system/**` 返回 403「演示环境，禁止修改」。这是 mock 防护，**自建后端不要实现此行为**，做真实 CRUD。

---

## 3. 核心端点（必须实现）

### 3.1 POST `/auth/login`

**请求**（JSON）：

```json
{ "username": "vben", "password": "123456" }
```

**行为**：

1. `username` 或 `password` 缺失 → HTTP 400 + `code:-1`，error=`'BadRequestException'`。
2. 凭据错误 → 清 refresh Cookie + HTTP 403 + `code:-1`，error/message=`'Username or password is incorrect.'`。
3. 成功 → 生成 accessToken（7d）+ refreshToken（30d），`Set-Cookie: jwt=...`，返回：

```json
{
  "code": 0,
  "data": {
    "id": 0,
    "username": "vben",
    "realName": "Vben",
    "roles": ["super"],
    "accessToken": "eyJhbGciOi..."
  },
  "error": null,
  "message": "ok"
}
```

> 前端**只消费 `data.accessToken`**（`LoginResult` 类型仅声明该字段）。mock 把整个用户对象连同 password 一起返回是坏味道，自建后端**只返回 `accessToken`**（最多附带脱敏用户字段），绝不返回密码。

### 3.2 POST `/auth/refresh` ⚠️ 特殊响应格式

**请求**：无 body，凭 Cookie `jwt`。

**行为**：

1. 无 Cookie → 清 Cookie + HTTP 403 + `code:-1`（error/message=`'Forbidden Exception'`）。
2. refreshToken 无效/过期 → 同上。
3. 成功 → **响应体直接就是新的 accessToken 字符串**（非 JSON 包裹，Content-Type 为 text/plain）：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

同时 mock 会**重新 Set-Cookie 原 refreshToken**（注意：不换新 refresh token，仅滑动 Cookie 有效期）。

> 前端用**裸 axios 客户端**（`baseRequestClient`，无包裹解析拦截器）调用本接口，取 `resp.data` 即新 token。自建后端如果返回包裹 JSON，刷新逻辑会静默失败，这是对接最容易踩的坑。

### 3.3 POST `/auth/logout`

**请求**：无 body，凭 Cookie。

**行为**：无论有无 Cookie，一律返回成功并清 Cookie：

```json
{ "code": 0, "data": "", "error": null, "message": "ok" }
```

自建后端应同时使服务端的 refresh token 失效（如删 `refresh_token` 表记录）。

### 3.4 GET `/auth/codes`

**鉴权**：Bearer。

- 未认证 → HTTP 401 + `code:-1`（error/message=`'Unauthorized Exception'`）。
- 成功 → 当前用户的按钮权限码数组：

```json
{ "code": 0, "data": ["AC_100100", "AC_100110", "AC_100120", "AC_100010"], "error": null, "message": "ok" }
```

无权限码的用户返回 `data: []`。权限码用于前端 `v-access` 指令/`hasAccessByCodes`。

### 3.5 GET `/user/info`

**鉴权**：Bearer。401 行为同上。

**成功响应**（用户对象去 password，字段与前端 `UserInfo` 类型对齐）：

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "Admin",
    "roles": ["admin"],
    "homePath": "/workspace"
  },
  "error": null,
  "message": "ok"
}
```

- `roles`：角色编码数组，用于前端路由 `meta.authority` 匹配。
- `homePath`：可选，登录成功后的跳转目标；缺省时前端用全局默认首页。
- 前端 `UserInfo`（`packages/types/src/user.ts`）还声明了 `avatar`、`userId`、`desc`、`token` 字段，均可选，建议返回 `avatar`。

### 3.6 GET `/menu/all`

**鉴权**：Bearer。401 行为同上。

**成功响应**：`data` 为路由树数组（`RouteRecordStringComponent[]`），节点结构：

```json
{
  "name": "Dashboard",
  "path": "/dashboard",
  "redirect": "/analytics",
  "meta": { "order": -1, "title": "page.dashboard.title" },
  "children": [
    {
      "name": "Analytics",
      "path": "/analytics",
      "component": "/dashboard/analytics/index",
      "meta": { "affixTab": true, "title": "page.dashboard.analytics" }
    }
  ]
}
```

**`component` 字符串解析规则**（前端 `generate-routes-backend.ts`）：

| component 值 | 解析 |
|--------------|------|
| `BasicLayout` | 主布局 |
| `IFrameView` | 内嵌 iframe 容器（配合 `meta.iframeSrc` 外链 `meta.link`） |
| `/dashboard/analytics/index` 等路径串 | 映射到 `src/views` 下的 `.vue` 文件（相对 views 目录，无扩展名） |
| 缺省（目录节点） | 只做菜单分组，需有 `redirect` + `children` |

**`meta` 常用字段**：`title`（i18n key 或原文）、`icon`（iconify 名）、`order`（排序，越小越靠前）、`badge`/`badgeType`/`badgeVariants`（角标）、`affixTab`（固定 tab）、`keepAlive`、`authority`（角色数组，控制可见性）、`menuVisibleWithForbidden`（可见但 403）、`iframeSrc`、`link`、`hideInMenu`。

> 权限语义：角色不匹配 `authority` 的节点前端直接不渲染；`menuVisibleWithForbidden: true` 的节点渲染菜单但访问显示 403。

---

## 4. 前端认证时序（实现参考）

### 4.1 登录时序（`apps/web-antd/src/store/auth.ts`）

```
loginApi(username, password)
  └─ POST /auth/login ──→ 取 data.accessToken
       └─ 并行：GET /user/info + GET /auth/codes
            └─ 跳转 userInfo.homePath || preferences.app.defaultHomePath
```

### 4.2 401 无感刷新时序（`@vben/request` 拦截器）

```
任一业务请求返回 401
  ├─ 未启用 refreshToken 或已是重试请求 → 清 token，弹登录过期 modal / 跳登录页
  ├─ 正在刷新中 → 请求入队，等新 token 后自动重放
  └─ 否则：
       POST /auth/refresh（带 Cookie）
         ├─ 成功 → 存新 accessToken → 重放队列 + 原请求
         └─ 失败 → 清 token → 重新认证
```

后端只需保证：**401 表示 access token 过期**、**refresh 失败返回非 2xx（mock 用 403）**，前端会正确分流。

> ⚠️ 前置条件：`preferences.app.enableRefreshToken` **默认为 `false`**（`packages/@core/preferences/src/config.ts`），不开则 401 直接走重新认证，整个刷新流程不触发。联调刷新必须先开启（见第 7 节步骤 4）。`loginExpiredMode` 默认 `'page'`（跳登录页），可切 `'modal'`（弹窗重新登录）。

### 4.3 登出时序

```
POST /auth/logout（带 Cookie）→ 前端无视成败 → 清空全部 store → 跳登录页（带 redirect 参数）
```

---

## 5. 扩展端点（可选实现）

所有扩展端点均需 Bearer 鉴权（401 行为同核心端点；`timezone/options` 和 `test`、`status` 除外）。

### 5.1 GET `/system/user/list`

Query（均可选）：`page`(默认1)、`pageSize`(默认20)、`name`、`id`、`remark`、`startTime`、`endTime`、`deptId`、`status`(0|1)。

响应为**分页结构** `data: { items: [...], total: N }`：

```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "0b0f...",
        "name": "产品名称",
        "status": 1,
        "createTime": "2023/06/15 10:23:45",
        "deptId": "a1b2...",
        "remark": "备注"
      }
    ],
    "total": 100
  },
  "error": null,
  "message": "ok"
}
```

- `status`：0 停用 / 1 启用（全部 system 模块一致）。
- `createTime` 格式：`yyyy/MM/dd HH:mm:ss`（zh-CN Intl 格式）。
- 筛选语义：name/id/remark 为模糊包含；时间为闭区间字符串比较；status 精确；deptId 精确。

### 5.2 GET `/system/role/list`

Query 同 5.1（无 deptId）。行结构：

```json
{ "id": "...", "name": "...", "status": 1, "createTime": "2023/06/15 10:23:45", "permissions": [1, 201, 20101], "remark": "..." }
```

`permissions` 为该角色拥有的菜单 id 数组（对应 `/system/menu/list` 的 id）。

### 5.3 GET `/system/menu/list`

返回菜单管理树（mock 为固定树 `MOCK_MENU_LIST`）。节点结构：

```json
{
  "id": 201,
  "pid": 2,
  "name": "SystemMenu",
  "path": "/system/menu",
  "component": "/system/menu/list",
  "type": "menu",
  "status": 1,
  "authCode": "System:Menu:List",
  "meta": { "icon": "carbon:menu", "title": "system.menu.title" },
  "children": [ { "type": "button", "authCode": "System:Menu:Create", "...": "..." } ]
}
```

- `type`：`catalog`（目录）/ `menu`（页面）/ `button`（按钮权限）/ `embedded`（iframe）/ `link`（外链）。
- `authCode`：权限码，button 型节点的 authCode 即 `/auth/codes` 的数据来源。
- 根节点 `pid` 为 0 或缺省。

### 5.4 GET `/system/menu/name-exists`、GET `/system/menu/path-exists`

Query：`name`（或 `path`）、`id`（可选，编辑时排除自身）。

语义：**`data=true` 表示"已存在"**（新建设计校验用）。

```json
{ "code": 0, "data": true, "error": null, "message": "ok" }
```

### 5.5 GET `/system/dept/list`

返回部门树（不分页）：

```json
{
  "code": 0,
  "data": [
    {
      "id": "uuid",
      "pid": 0,
      "name": "研发部",
      "status": 1,
      "createTime": "2021/08/08 09:30:00",
      "remark": "...",
      "children": [ { "id": "uuid", "pid": "父id", "...": "..." } ]
    }
  ],
  "error": null,
  "message": "ok"
}
```

根节点 `pid = 0`；children 可选。

### 5.6 POST `/system/dept`、PUT `/system/dept/{id}`、DELETE `/system/dept/{id}`

- 成功统一返回 `{ "code": 0, "data": null, "error": null, "message": "ok" }`。
- 请求体建议与 5.5 行结构对齐（`name`、`pid`、`status`、`remark`）。
- mock 内置了 600ms/2s/1s 人为延迟模拟，自建后端不需要。

### 5.7 GET `/table/list`（vxe-table 演示数据）

Query：`page`(默认1)、`pageSize`(默认10，上限100)、`sortBy`(字段名)、`sortOrder`(`asc|desc`)。

响应分页结构，行字段（19 个）：

```
id(uuid), imageUrl, imageUrl2, open(bool), status('success'|'error'|'warning'),
productName, price, currency, quantity(int), available(bool), category,
releaseDate(ISO), rating(float), description, weight(float), color,
inProduction(bool), tags(string[])
```

排序语义：仅当 sortBy 为合法字段才排序；数值比大小、布尔 false<true、其余按 `localeCompare(numeric)`。mock 固定 100 条数据 + 600ms 延迟。

### 5.8 POST `/upload`

`multipart/form-data` 文件上传。成功：

```json
{ "code": 0, "data": { "url": "https://.../xxx.webp" }, "error": null, "message": "ok" }
```

mock 未读取真实文件，固定返回 URL；自建后端应落盘/OSS 并返回可访问 URL。

### 5.9 timezone 三件套（v5.7.0 新增，web-antd 未接入）

| 端点 | 行为 |
|------|------|
| GET `/timezone`（Bearer） | 返回当前时区，`data: "Asia/Shanghai"` 或 `null` |
| GET `/timezone/options` | `data: [{ "label": "Asia/Shanghai (GMT+8)", "value": "Asia/Shanghai" }]`，无鉴权 |
| POST `/timezone/set`（Bearer） | body `{ "timezone": "Asia/Shanghai" }`；非法值 → 400 + `message:'Invalid timezone'`；成功 `data: {}` |

mock 为全局内存变量；真实实现应按用户持久化。选项集见 `TIME_ZONE_OPTIONS`（纽约/伦敦/上海/东京/首尔）。

### 5.10 调试端点

| 端点 | 行为 |
|------|------|
| GET `/status?status=500` | 原样返回该状态码 + `code:-1` 包裹体（错误演示） |
| GET `/test`、POST `/test` | 返回纯文本 `'Test get/post handler'`，无鉴权 |
| GET `/demo/bigint`（Bearer） | 返回**非包裹的原始 JSON 字符串**，演示超出 JS 安全整数的 id 序列化约定 |

---

## 6. 数据模型与建表建议

双后端共用一套 MySQL schema（下划线命名，utf8mb4）：

```
sys_user            id BIGINT PK, username UNIQUE, password_hash, real_name,
                    avatar, home_path VARCHAR, dept_id, status TINYINT, remark,
                    create_time, update_time
sys_role            id BIGINT PK, name, code UNIQUE(super/admin/user...),
                    status, remark, create_time
sys_user_role       user_id, role_id (联合主键)
sys_menu            id BIGINT PK, pid(默认0), name UNIQUE, type(catalog/menu/button/embedded/link),
                    path, component, auth_code, icon, status, sort,
                    meta JSON(badge/affixTab/keepAlive/authority/iframeSrc/link/...),
                    create_time, update_time
sys_role_menu       role_id, menu_id (联合主键)
sys_dept            id BIGINT PK, pid(默认0), name, status, remark, create_time
sys_refresh_token   id BIGINT PK, user_id, token_hash UNIQUE, expires_at,
                    created_at, revoked(是否已作废)
```

推导关系：

- `/user/info` 的 `roles` ← sys_user_role + sys_role.code
- `/auth/codes` ← 角色关联的 `type='button'` 菜单的 `auth_code` 去重
- `/menu/all` ← 角色关联的非 button 菜单组装成树（只含授权节点）
- `/system/menu/name-exists`、`path-exists` ← sys_menu 的 name/path 唯一性校验

演示账号（与 mock 一致，密码均为 `123456`）：

| username | roles | homePath |
|----------|-------|----------|
| vben | super | 默认(/analytics) |
| admin | admin | /workspace |
| jack | user | /analytics |

---

## 7. 前端对接步骤

1. **关闭内置 mock**：`apps/web-antd/.env.development` → `VITE_NITRO_MOCK=false`。（不关的话，根目录 `pnpm dev` 会在 5320 端口自动拉起 mock 服务）
2. **改代理指向自建后端**：`apps/web-antd/vite.config.ts` 已内置代理：

```ts
server: {
  proxy: {
    '/api': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),  // 去掉 /api 前缀
      target: 'http://localhost:5320/api',             // ← 改成自己的后端
      ws: true,
    },
  },
},
```

   例：Java 后端设 `server.servlet.context-path=/api`，则 target 改 `http://localhost:8080/api`；Node/Nitro 后端直接改 `http://localhost:3000/api`（路由保持 `api/` 目录结构）。rewrite 会先去掉请求中的 `/api` 再拼接 target，最终后端收到的仍是 `/api/auth/login`。
3. **开启无感刷新（联调刷新流程必做）**：`apps/web-antd/src/preferences.ts`：

```ts
export const overridesPreferences = defineOverridesPreferences({
  app: {
    enableRefreshToken: true, // 默认 false，不开则 401 直接跳登录页
  },
});
```

4. **后端菜单模式联调**：偏好设置面板把「权限模式」切到 backend，或在 `overridesPreferences` 里加 `app: { accessMode: 'backend' }`，前端才会调 `/menu/all`。
5. **生产部署**：`VITE_GLOB_API_URL=/api` + Nginx 反代同源转发（避免 CORS + Cookie 问题），或改为后端绝对地址并配 CORS + `withCredentials`。所有 `VITE_GLOB_*` 变量在打包时注入 `dist/_app.config.js`，**改后端地址可直接改该文件，无需重新打包**。

---

## 8. 实现注意事项（坑点清单）

1. **`/auth/refresh` 成功响应是裸 token 字符串**，不是 `{code,data}` 包裹；失败才用 403 + 包裹体。写反了前端无感刷新直接失效。
2. **登录响应不要带 password**（mock 带了，是演示坏味道）；前端只读 `accessToken`。
3. **401 是刷新信号**：所有需鉴权端点的 token 失效必须返回 401（不是 403），否则前端不会尝试刷新。
4. **refresh Cookie 名固定为 `jwt`**，HttpOnly；`SameSite=None` 必须配 `Secure`（HTTPS）。开发期走 Vite 同源代理可规避浏览器限制；自建后端 dev 环境可放宽为 `Lax`。
5. mock 中 **Cookie maxAge=24h 但 refresh JWT 本体 30d**，两者矛盾（即 cookie 过期后 refresh token 再无机会使用）。自建后端建议：access token 短效（30min~2h），refresh token 与 Cookie maxAge 一致（如 7d），并支持 refresh token 轮换（每次刷新换新、旧的作废）。
6. **业务错误两套通道**：HTTP 200 + `code:-1`（业务失败，toast `error ?? message`）与非 2xx + 包裹体（含 401 触发刷新）。实现时约定：参数/业务校验失败用 400/403 + 包裹；token 问题统一 401。
7. **`/api/system/**` 的写操作 403 是 mock 防护**，自建后端做真实 CRUD，勿照抄。
8. **`menu/all` 的 `component` 是字符串**：`BasicLayout` / `IFrameView` / views 相对路径三种；目录节点无 component 但要有 `redirect`。默认 `accessMode='frontend'` 时前端不调此接口，联调菜单需在偏好设置（或 `overridesPreferences`）切到 backend。
9. **大整数**：`/demo/bigint` 演示了 id 超过 JS `Number.MAX_SAFE_INTEGER` 的场景。业务表主键建议 BIGINT 且序列化时转字符串（Jackson 配 `Long→String`、Drizzle 用 `mode:'string'`）。
10. **错误文案字段**：优先 `error`，其次 `message`；两者都空时前端按 HTTP 状态码兜底提示。
11. **时区端点**：v5.7.0 新增但 web-antd 未启用（默认前端本地选项），可最后实现或跳过。
12. **`enableRefreshToken` 默认 false**：不开的话 401 直接重新认证，`/auth/refresh` 永远不会被调用（连实现得对不对都验证不了）。联调前先按第 7 节步骤 3 开启。
13. **全局异常处理**：mock 的 `error.ts` 把未捕获异常以 `[Error Handler] <stack>` **纯文本**返回（泄漏堆栈）。自建后端必须有全局异常处理器，未预期异常统一返回 `500 + code:-1 包裹体`，禁止裸堆栈出站。

---

## 9. 联调验收清单

- [ ] `vben/123456`、`admin/123456`、`jack/123456` 均可登录并进入对应首页
- [ ] 错误密码 → 403 + toast「Username or password is incorrect.」
- [ ] 登录后 F5 刷新页面仍保持登录（access token 存活期间）
- [ ] 开启 `enableRefreshToken` 后：手动篡改 localStorage 的 access token → 任意请求 401 → 自动调 `/auth/refresh` → 请求重放成功
- [ ] 等待/清除 refresh Cookie 后操作 → 跳转登录页（或弹登录过期 modal）
- [ ] 登出 → Cookie 被清、refresh token 服务端失效、回登录页带 redirect 参数
- [ ] `admin` 登录后按钮权限码为 `["AC_100010","AC_100020","AC_100030"]`，demo 按钮按权限显隐
- [ ] 偏好切换 accessMode=backend 后 `/menu/all` 返回的菜单树可正常渲染与跳转
- [ ] 分页接口（table/system）`items/total` 结构正确，pageSize 上限 100
- [ ] Chrome Network 面板确认：`/auth/refresh` 响应体是纯 token 字符串
