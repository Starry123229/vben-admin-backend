# 后端 API 契约

> 本文档是 Java 后端与 Node 后端的**共同实现规范**，两端必须产出完全一致的 HTTP 行为。
> 文档与代码同步维护：新增/修改接口时先更新本契约，再实现两端。

---

## 目录

- [1. 端点总览](#1-端点总览)
- [2. 通用约定](#2-通用约定)
- [3. 认证与账号端点](#3-认证与账号端点)
- [4. 前端认证时序（实现参考）](#4-前端认证时序实现参考)
- [5. 业务模块端点契约](#5-业务模块端点契约)
- [6. 按钮权限码总表](#6-按钮权限码总表)
- [7. 数据模型](#7-数据模型)
- [8. 前端对接步骤](#8-前端对接步骤)
- [9. 实现注意事项（坑点清单）](#9-实现注意事项坑点清单)
- [10. 联调验收清单](#10-联调验收清单)

---

## 1. 端点总览

### 1.1 核心端点（登录跑通必需，共 6 个）

| # | 方法 | 路径 | 鉴权 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/auth/login` | 无 | 登录，返回 accessToken，种 refresh Cookie |
| 2 | POST | `/auth/refresh` | Cookie | 刷新 accessToken，**响应体为裸字符串** |
| 3 | POST | `/auth/logout` | Cookie | 登出，清 Cookie 并作废服务端令牌 |
| 4 | GET | `/auth/codes` | Bearer | 按钮权限码列表 |
| 5 | GET | `/user/info` | Bearer | 当前用户信息 |
| 6 | GET | `/menu/all` | Bearer | 按角色动态生成的路由树 |

### 1.2 业务模块端点（双后端均已实现）

| 模块 | 端点（方法 + 路径） | 权限码 |
|------|---------------------|--------|
| 用户管理 | GET `/system/user/list` · POST `/system/user` · PUT `/system/user/{id}` · DELETE `/system/user/{id}` · POST `/system/user/{id}/reset-password` · GET `/system/user/export` | list/export=AC_1000000 · create=AC_100010 · update/reset=AC_100020 · delete=AC_100030 |
| 个人账号 | GET `/user/info` · PUT `/user/profile` · POST `/user/avatar` · POST `/user/password` | 登录即可（无权限码） |
| 角色管理 | GET `/system/role/list` · POST `/system/role` · PUT `/system/role/{id}` · DELETE `/system/role/{id}` · GET `/system/role/{id}/menus` · POST `/system/role/{id}/menus` · GET `/system/role/export` | list/export=AC_1000001 · 其余=AC_1000002 |
| 部门管理 | GET `/system/dept/list` · POST `/system/dept` · PUT `/system/dept/{id}` · DELETE `/system/dept/{id}` | super/admin（页面级控制） |
| 菜单管理 | GET `/system/menu/list` · GET `/system/menu/tree` · POST `/system/menu` · PUT `/system/menu/{id}` · DELETE `/system/menu/{id}` · GET `/system/menu/name-exists` · GET `/system/menu/path-exists` | super/admin（页面级控制） |
| 路由树 | GET `/menu/all` | 登录即可（按角色过滤） |
| 数据字典 | GET `/system/dict/type/list` · GET `/system/dict/type/code-exists` · POST/PUT/DELETE `/system/dict/type[/{id}]` · GET `/system/dict/data/list?typeId` · GET `/system/dict/data/code/{code}` · POST/PUT/DELETE `/system/dict/data[/{id}]` | super/admin |
| 参数配置 | GET `/system/config/list` · GET `/system/config/key/{key}` · GET `/system/config/key-exists` · POST/PUT/DELETE `/system/config[/{id}]` | super/admin |
| 定时任务 | GET `/system/job/list` · POST `/system/job` · PUT `/system/job/{id}` · DELETE `/system/job/{id}` · PUT `/system/job/{id}/toggle` · PUT `/system/job/{id}/run` | super/admin |
| 通知管理 | GET `/system/notice/list` · PUT `/system/notice/{id}/read` · PUT `/system/notice/read-all` · DELETE `/system/notice/{id}` · DELETE `/system/notice/clear` · POST `/system/notice/send` · POST `/system/notice/broadcast` | 发送=super/admin · 其余=登录即可 |
| 消息中心 | GET `/system/message/list` · GET `/system/message/unread-count` · PUT `/system/message/{id}/read` · PUT `/system/message/read-all` · POST `/system/message/send` | 登录即可 |
| 附件中心 | GET `/system/attachment/list` · GET `/system/attachment/{id}` · POST `/system/attachment/upload` · DELETE `/system/attachment/{id}` | super/admin |
| 工作流 | GET `/system/workflow/list` · POST `/system/workflow` · PUT/DELETE `/system/workflow/{id}` · POST `/system/workflow/start` · PUT `/system/workflow/{instanceId}/approve` · PUT `/system/workflow/{instanceId}/cancel` · GET `/system/workflow/instances` · GET `/system/workflow/{instanceId}/tasks` | super/admin |
| 在线用户 | GET `/system/online/list` · DELETE `/system/online/{token}` | super/admin |
| 操作日志 | GET `/system/log/operation/list` · DELETE `/system/log/operation` · GET `/system/log/operation/export` | super/admin |
| 登录日志 | GET `/system/log/login/list` · DELETE `/system/log/login` · GET `/system/log/login/export` | super/admin |
| 审计日志 | GET `/system/audit-log/list` | super |
| 仪表盘 | GET `/dashboard/overview` · GET `/dashboard/user-trends` · GET `/dashboard/role-distribution` · GET `/dashboard/dept-distribution` · GET `/dashboard/browser-distribution` | 登录即可 |

> 双端接口行为已逐一对齐（含错误码与提示文案）。历史 mock 的演示端点
> （`/table/list`、`/upload`、`/timezone/*`、`/status`、`/test`、`/demo/bigint`）
> 前端已不再调用，双后端可忽略。

---

## 2. 通用约定

### 2.1 基础路径

- 前端请求前缀：`VITE_GLOB_API_URL=/api`，所有请求发往 `/api/**`。
- 后端路由的**逻辑路径以 `/api` 为根**：Java 用 `server.servlet.context-path=/api`；Node 在 `main.ts` 设全局前缀 `api`。前端 Vite 代理把 `/api/**` 原样转发到 `http://localhost:8080/api/**`（`apps/*/vite.config.ts` 已预置，无需修改）。

### 2.2 统一响应包裹

```json
{
  "code": 0,
  "data": {},
  "error": null,
  "message": "ok"
}
```

- `code = 0`：成功。前端拦截器（`codeField=code` / `dataField=data` / `successCode=0`）直接返回 `data` 字段给业务代码。
- `code = -1`（非 0）：业务失败。前端抛出异常并读取 `response.data.error ?? response.data.message` 作为提示文案，二者至少填一个。
- HTTP 状态码与包裹体**同时使用**：错误响应是「非 2xx 状态码 + 包裹体」的组合（如 403 + code:-1）。
- 唯一例外：`POST /auth/refresh` 成功时返回**裸 token 字符串**，不包裹（见 3.2）。

### 2.3 HTTP 状态码语义（前端行为对齐）

| 状态码 | 语义 | 前端行为 |
|--------|------|---------|
| 2xx / 3xx | 成功 | 走包裹体解析（code 判断） |
| 400 | 参数/业务校验失败（重复名、密码弱、删除有子节点等） | 提示 `error`/`message` |
| 401 | **accessToken 失效**（唯一含义） | **触发无感刷新流程**，刷新失败则强制重新登录 |
| 403 | 权限不足（越权操作/禁用账号/登录方式关闭） | 提示 forbidden |
| 404 | 资源不存在 | 提示 notFound |
| 408 | 超时 | 提示 requestTimeout |
| 500 | 未预期异常（禁止裸堆栈出站） | 提示 internalServerError |

两端已对齐的典型错误：

| 场景 | 状态码 + 文案 |
|------|---------------|
| 用户名或密码错误 | 403 `Username or password is incorrect.` |
| 账号已禁用 | 403 `该账号已被禁用，请联系管理员` |
| 连续失败锁定 | 400 `失败次数过多，账号已锁定，请 N 分钟后再试`（Java 已实现） |
| 越权操作 | 403 `无权限执行此操作` |
| 重复用户名 | 400 `登录名已存在` |
| 删除自己 | 400 `不能删除当前登录账号` |
| 菜单缺路由路径 | 400 `路由路径不能为空` |

### 2.4 认证机制（双 token）

- **accessToken**：登录响应体返回，前端存 Pinia/localStorage，每次请求放 `Authorization: Bearer <token>` 头。有效期 2 小时（Java Sa-Token / Node JWT `ACCESS_TOKEN_EXPIRES`）。
- **refreshToken**：**不出现在响应体**，通过 `Set-Cookie` 下发：
  - HttpOnly；`SameSite=Lax`（开发 HTTP 同源代理）/ `None; Secure`（生产 HTTPS）；
  - 有效期 7 天（`REFRESH_TOKEN_DAYS`），服务端持久化哈希（`sys_refresh_token` 表）支持轮换吊销；
  - 请求 `/auth/refresh` 时浏览器自动带 Cookie（前端 `withCredentials: true`）。
- 实现差异：Java 用 Sa-Token（uuid 风格 token，内存会话）；Node 用 JWT（HS256，双密钥）。对前端完全透明。

### 2.5 Token 校验即回查用户（防改密/禁用延迟）

两端校验 accessToken 后都**按 userId 回查 `sys_user`** 再放行：用户被禁用/删除后，即使 token 未过期也立即失效（返回 403「该账号已被禁用」）。自建后端建议沿用此模式。

### 2.6 CORS（仅跨域直连时需要）

开发期走 Vite 同源代理（推荐）无 CORS 问题。跨域直连时需：

- `Access-Control-Allow-Credentials: true` + **回显 Origin**（带 Cookie 时不能为 `*`）
- `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`
- `Access-Control-Allow-Headers` 至少含 `Accept, Authorization, Content-Type, X-Requested-With`

### 2.7 请求头与数组参数序列化

前端每次请求固定携带：

- `Authorization: Bearer <accessToken>`（有 token 时）
- `Accept-Language: <locale>`（如 `zh-CN`，后端可用于错误信息国际化）

GET 数组参数默认按 **brackets** 序列化（`@vben/request` 的 `paramsSerializer`）：`ids[]=1&ids[]=2`。后端解析数组 query 时注意兼容此格式。

### 2.8 文件上传与下载

- 上传：`multipart/form-data`，字段名 `file`；图片类接口（头像）仅 jpg/jpeg/png/webp/gif 且 ≤5MB；附件 ≤5MB（Java multipart 上限 10MB）。
- 下载（Excel 导出）：`GET */export` 返回二进制流，Content-Type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`，前端用 `requestClient.download` 接收（`responseType: 'blob'`）。
- 上传文件访问：落盘 `{upload-dir}/avatar|file/`，经公开端点 `GET /avatar/file/{filename}` 提供 `<img>` 访问（文件名白名单防目录穿越），URL 必须带 `/api` 前缀以走前端代理。

---

## 3. 认证与账号端点

### 3.1 POST `/auth/login`

**请求**（JSON）：

```json
{ "username": "vben", "password": "123456" }
```

**行为**：

1. `username`/`password` 缺失 → 400 `用户名和密码必填`；
2. 连续失败达阈值（`sys.login.max-fail-count`，默认 5 次）→ 400 `失败次数过多，账号已锁定，请 N 分钟后再试`（锁定时长 `sys.login.lock-minutes`，默认 30 分钟；Java 已实现，Node 待补）；
3. 凭据错误 → 403 `Username or password is incorrect.`（不区分账号不存在/密码错误，防枚举）；
4. 账号被禁用 → 403 `该账号已被禁用，请联系管理员`；
5. 成功 → 签发双 token，`Set-Cookie: refreshToken`，返回：

```json
{
  "code": 0,
  "data": { "accessToken": "10753240-f1d4-... | eyJhbGciOi..." },
  "error": null,
  "message": "ok"
}
```

> 前端**只消费 `data.accessToken`**。登录成功/失败均写登录日志（用户、IP、归属地、浏览器、OS、方式、结果）。

### 3.2 POST `/auth/refresh` ⚠️ 特殊响应格式

**请求**：无 body，凭 refreshToken Cookie。

- 无 Cookie / 无效 / 过期 → 403 + `code:-1` 包裹体；
- 成功 → **响应体直接就是新的 accessToken 字符串**（非 JSON 包裹，Content-Type text/plain）：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 前端用**裸 axios 客户端**调用本接口，取 `resp.data` 即新 token。如果返回包裹 JSON，刷新逻辑会静默失败——这是对接最容易踩的坑。
> Java 端支持 refreshToken 轮换（每次刷新换新、旧 token 哈希写 `sys_refresh_token` 表）。

### 3.3 POST `/auth/logout`

无论有无 Cookie 一律成功，并作废服务端令牌（删 refresh 表记录 / Sa-Token 登出）：

```json
{ "code": 0, "data": "", "error": null, "message": "ok" }
```

### 3.4 GET `/auth/codes`

成功返回当前用户的按钮权限码数组（来源见 [第 6 节](#6-按钮权限码总表)）：

```json
{ "code": 0, "data": ["AC_100010", "AC_100020", "AC_100030", "AC_1000000", "AC_1000001", "AC_1000002"], "error": null, "message": "ok" }
```

super 与 admin 的码集相同（6 个）；jack（user）为 `["AC_1000001", "AC_1000002", "AC_1000000"]`；无权限用户返回 `data: []`。未认证 → 401。

### 3.5 GET `/user/info`

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "vben",
    "realName": "Vben Admin",
    "roles": ["super"],
    "homePath": null,
    "avatar": "/api/avatar/vben.svg",
    "email": "vben@vben-demo.com",
    "phone": "13800000001",
    "intro": "..."
  },
  "error": null,
  "message": "ok"
}
```

- `roles`：角色编码数组，用于前端路由 `meta.authority` 匹配；
- `homePath`：登录成功后的跳转目标（`sys_user.home_path`，可空，空则用全局默认）；
- 绝不返回 `password_hash`。

### 3.6 账号资料端点（登录即可）

| 端点 | 请求 | 说明 |
|------|------|------|
| PUT `/user/profile` | `{ realName?, intro? }` | 更新基本资料 |
| POST `/user/avatar` | multipart `file` | 上传头像，返回 `{ avatar: "/api/avatar/file/xxx.png" }` 并更新 `sys_user.avatar`；仅图片、≤5MB |
| POST `/user/password` | `{ oldPassword, newPassword, confirmPassword }` | 修改自己的密码；旧密码错 → 400 `原密码不正确`；两次不一致 → 400 `两次输入的新密码不一致`；新密码需满足强度策略（≥8 位，含大小写/数字/特殊字符） |

### 3.7 登录方式开关（前后端同源）

`GET /auth/config`（公开免鉴权）下发五个布尔值，登录页据此显隐入口：

```json
{ "code": 0, "data": { "account": true, "phone": true, "qrcode": true, "register": true, "oauth": true }, "error": null, "message": "ok" }
```

- Java 端配置入口：`application.yml -> vben.auth.login-methods.*`（默认仅 `account: true`）；
- Node 端配置入口：`.env -> LOGIN_METHODS_*`（当前默认全开）；
- **后端强制**：对应开关关闭时，辅助接口返回 403（如「手机号登录已关闭」「第三方登录已关闭」）；
- 前端登录页 `onMounted` 拉取该配置，拉取失败保持默认全开，避免登录页不可用。

### 3.8 认证扩展端点

| 端点 | 请求 | 说明 |
|------|------|------|
| POST `/auth/register` | `{ username, password, realName?, phone?, email? }` | 注册并自动登录（返回 LoginResult）；`register=false` 时 403 |
| POST `/auth/sms/send` | `{ phone }` | 发送短信验证码；Mock 模式响应 `{ mockCode: "123456" }` 供联调 |
| POST `/auth/phone-login` | `{ phone, code }` | 手机验证码登录；`PHONE_AUTO_REGISTER=true` 时未注册手机号自动建号，否则 400 `该手机号未注册` |
| GET `/auth/qr/create` | — | 创建扫码会话 `{ ticket, status }`；`GET /auth/qr/status?ticket=` 轮询状态；`POST /auth/qr/confirm`（Bearer）已登录设备确认 |
| POST `/auth/forgot/send` | `{ email }` | 发送重置密码邮件验证码（EMAIL_MOCK 回显） |
| POST `/auth/forgot/reset` | `{ email, code, newPassword }` | 校验验证码并重置密码 |
| GET `/auth/oauth/{provider}/url` | provider=qq/wechat/github/google | 返回授权跳转 URL（凭证未配置时为本地 mock 流程） |
| GET `/auth/oauth/callback/{provider}` | `?code=` | OAuth 回调，返回 LoginResult；`OAUTH_AUTO_REGISTER=false` 且未绑定时 400 `该第三方账号未绑定系统用户` |

### 3.9 登录安全增强

| 机制 | 说明 |
|------|------|
| 按用户失败锁定 | 连续失败 N 次（`sys.login.max-fail-count`）锁定 M 分钟（`sys.login.lock-minutes`），登录成功清零；Java 内存实现 |
| IP 限流 | 同 IP 1 分钟内登录请求超限（默认 10 次）拒绝并提示稍后再试；Java 实现 |
| 禁用即时生效 | 每个 Bearer 请求回查用户状态，禁用后存量 token 立即 403 |
| 强制下线 | `DELETE /system/online/{token}` 作废目标会话，被踢 token 立即 401 |
| 登录日志 | 成功/失败均记录：用户、IP、归属地、浏览器、OS、方式、结果 |

---

## 4. 前端认证时序（实现参考）

### 4.1 登录时序（`apps/*/src/store/auth.ts`）

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

后端只需保证：**401 表示 access token 过期**、**refresh 失败返回非 2xx（403）**，前端会正确分流。

> ⚠️ 前置条件：`preferences.app.enableRefreshToken` 默认 `false`，不开则 401 直接走重新认证，整个刷新流程不触发。`loginExpiredMode` 默认 `'page'`（跳登录页），可切 `'modal'`（弹窗重新登录）。

### 4.3 登出时序

```
POST /auth/logout（带 Cookie）→ 前端无视成败 → 清空全部 store → 跳登录页（带 redirect 参数）
```

---

## 5. 业务模块端点契约

通用约定（适用于全部业务端点）：

- **鉴权**：均需 Bearer；401 行为同 3.4；
- **权限**：标注权限码的接口按 [第 6 节](#6-按钮权限码总表) 校验；标注 super/admin 的接口按用户角色码校验；
- **分页**：`page`（默认 1）、`pageSize`（默认 10）→ 响应 `data: { items: [...], total: N }`；
- **时间格式**：`yyyy/MM/dd HH:mm:ss`（vxe 表格类）或 `yyyy-MM-dd HH:mm:ss`（通知/消息等），以各接口示例为准；
- **状态**：`status`：1 启用 / 0 禁用（全部模块一致）；
- **Excel 导出**：`*/export` 返回 xlsx 二进制流（Content-Type 见 2.8）。

### 5.1 用户管理

| 端点 | 请求 / Query | 响应要点 |
|------|--------------|----------|
| GET `/system/user/list` | `page,pageSize,username(模糊),status,deptId` | `{ items, total }`；项含 `id,username,realName,roleCodes[],deptId,status,remark,createTime`（脱敏，无密码） |
| POST `/system/user` | `{ username,password,realName?,deptId?,roleIds?,status?,remark? }` | `data: 新用户id`；重复用户名 → 400 `登录名已存在`；弱密码 → 400 `密码至少 8 位，且必须包含大小写字母、数字和特殊字符` |
| PUT `/system/user/{id}` | 同 create（password 可省略=不改密码） | 成功 `data: null` |
| DELETE `/system/user/{id}` | — | 删除自己 → 400 `不能删除当前登录账号` |
| POST `/system/user/{id}/reset-password` | `{ newPassword }` | 重置为指定密码（同样过强度校验） |
| GET `/system/user/export` | 同 list 筛选 | xlsx 二进制流（用户列表.xlsx） |

### 5.2 角色管理

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/role/list` | `page,pageSize,name?` | `{ items, total }`；项含 `id,name,code,status,remark,createTime` |
| POST `/system/role` | `{ name,code,status,remark? }` | `data: 新角色id`；code 唯一 |
| PUT `/system/role/{id}` | 同 create | 成功 `data: null` |
| DELETE `/system/role/{id}` | — | 有用户引用时拒绝 |
| GET `/system/role/{id}/menus` | — | `data: 该角色已分配的 menuId 数组`（含 button 节点，权限分配树回显） |
| POST `/system/role/{id}/menus` | `{ menuIds: number[] }` | 全量覆盖角色的菜单/按钮关联（先删后插，事务） |
| GET `/system/role/export` | — | xlsx 二进制流（角色列表.xlsx） |

### 5.3 部门管理

- GET `/system/dept/list`：`data` 为部门**树**（`pid=0` 为根，节点含 `children`）；
- POST `/system/dept`：`{ pid?, name, status, remark? }` → `data: 新部门id`；
- PUT `/system/dept/{id}` / DELETE `/system/dept/{id}`：有子部门或有用户引用时删除拒绝。

### 5.4 菜单管理

- GET `/system/menu/list`：扁平列表（含 button 型）；
- GET `/system/menu/tree`：管理树（不含 button，角色权限分配勾选用）；
- POST `/system/menu`：`{ pid?, name, type, path?, component?, redirect?, authCode?, icon?, status?, sort?, meta? }` → `data: 新菜单id`；
  - 类型校验：`type ∈ {dir, menu, button}`；**路由完整性校验（双端一致）**：`dir/menu` 必填 `path`，`menu` 还必填 `component`，`button` 豁免 → 否则 400 `路由路径不能为空` / `组件路径不能为空`；
  - 唯一性：name(路由名) 与 path 不可重复 → 400 `菜单名称(路由名)已存在：xxx`；
- PUT `/system/menu/{id}`：同 create（部分字段更新，按合并后结果校验）；
- DELETE `/system/menu/{id}`：有子节点 → 400 `该菜单存在子节点，无法删除`；成功则级联清理 `sys_role_menu`；
- GET `/system/menu/name-exists?name=&id=`、`GET /system/menu/path-exists?path=&id=`：`data: true` 表示已存在（id 为编辑时排除自身）。

### 5.5 路由树 GET `/menu/all`

`data` 为路由树数组（只含当前用户授权的非 button 菜单）：

```json
{
  "name": "Dashboard",
  "path": "/dashboard",
  "redirect": "/analytics",
  "meta": { "order": -1, "title": "page.dashboard.title" },
  "children": [
    { "name": "Analytics", "path": "/analytics", "component": "/dashboard/analytics/index",
      "meta": { "affixTab": true, "title": "page.dashboard.analytics" } }
  ]
}
```

- `component` 解析规则：`BasicLayout`（主布局）/ `IFrameView`（内嵌容器，配 `meta.iframeSrc`）/ `/xxx/index` 字符串映射到 `src/views` 下 `.vue` 文件；目录节点无 component 但要有 `redirect`；
- `meta` 常用字段：`title`（i18n key）、`icon`（iconify 名）、`order`、`badge*`、`affixTab`、`keepAlive`、`authority`（角色数组）、`menuVisibleWithForbidden`（可见但 403）、`hideInMenu`、`iframeSrc`、`link`；
- super 返回全部启用菜单；其他角色按 `sys_role_menu` 过滤。

### 5.6 数据字典

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/dict/type/list` | `page,pageSize,name?,status?` | `{ items, total }`；项含 `id,name,code,status,remark,createTime` |
| GET `/system/dict/type/code-exists` | `code,id?` | `data: true` 表示已存在 |
| POST/PUT/DELETE `/system/dict/type[/{id}]` | `{ name,code,status,remark? }` | code 必填且唯一 → 400 `字典编码已存在: xxx`；删除类型级联删除其数据 |
| GET `/system/dict/data/list` | `typeId` | `data: 数据数组`（按 sort 升序；项含 `id,typeId,label,value,sort,status`） |
| GET `/system/dict/data/code/{code}` | — | 按类型编码查启用数据（业务下拉数据源），无则 `data: []` |
| POST/PUT/DELETE `/system/dict/data[/{id}]` | `{ typeId,label,value,sort,status }` | label 必填、typeId 必填 |

### 5.7 参数配置

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/config/list` | `page,pageSize,name?,key?` | `{ items, total }`；项含 `id,name,key,value,type,remark` |
| GET `/system/config/key/{key}` | — | `data: 该 key 的 value 字符串`（后端自身也读取，如登录锁定阈值） |
| GET `/system/config/key-exists` | `key,id?` | `data: true` 表示已存在 |
| POST/PUT/DELETE `/system/config[/{id}]` | `{ name,key,value,type,remark? }` | key 唯一 |

内置参数：`sys.name`（系统名称）、`sys.default-password`（重置密码默认值）、`sys.login.max-fail-count`、`sys.login.lock-minutes`、`sys.token.timeout`。

### 5.8 定时任务

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/job/list` | — | `data: 任务数组`（**非分页**）；项含 `id,name,groupName,invokeTarget,cron,status(0暂停/1启用),remark,createTime` |
| POST `/system/job` | `{ name,groupName,invokeTarget,cron,status,remark? }` | `invokeTarget` 格式 `beanName.methodName`（如 `sampleJob.run`），目标必须真实存在，否则执行时失败 |
| PUT `/system/job/{id}` | 同 create | 修改后重新注册调度 |
| DELETE `/system/job/{id}` | — | 取消调度并删除 |
| PUT `/system/job/{id}/toggle` | — | 暂停 ↔ 启用切换（status 0↔1），联动调度引擎注册/取消 |
| PUT `/system/job/{id}/run` | — | 立即执行一次（异步），结果写日志；目标不存在 → 日志报 `无法找到 Bean` |

调度实现：Java 用 Spring `CronTrigger` 动态注册（`JobSchedulerService`，启动时加载全部 status=1 的任务）；内置演示任务：`systemMonitorTask.checkStatus`（系统状态检查）、`authCleanupTask.cleanExpiredTokens`（清理过期刷新令牌）、`sampleJob.run`（示例）。

### 5.9 通知管理

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/notice/list` | — | `data: 当前用户的通知数组`（创建时间倒序；项含 `id,title,message,avatar,link,isRead(boolean),type,date`） |
| PUT `/system/notice/{id}/read` | — | 标记单条已读；非本人通知 → 400 `通知不存在或无权操作` |
| PUT `/system/notice/read-all` | — | 全部已读 |
| DELETE `/system/notice/{id}` | — | 删除单条（仅本人） |
| DELETE `/system/notice/clear` | — | 清空本人全部通知 |
| POST `/system/notice/send` | `{ userId,title,message?,avatar?,link?,type? }` | 发送给指定用户（super/admin）；`type` ∈ info/success/warning/error |
| POST `/system/notice/broadcast` | `{ roleId,title,...同上 }` | 按角色广播给该角色全部用户，`data: 送达人数` |

发送时 `isRead=0`（未读）；前端打开通知面板会调用 read 接口标记。

### 5.10 消息中心

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/message/list` | `page,pageSize,title?,isRead?` | `{ items, total }`；项含 `id,title,content,type,isRead(0/1),createTime` |
| GET `/system/message/unread-count` | — | `data: { unread: N }` |
| PUT `/system/message/{id}/read` | — | 单条已读 |
| PUT `/system/message/read-all` | — | 全部已读 |
| POST `/system/message/send` | Query `{ userId,title,content,type? }` | 发送站内信（super/admin）；邮件开关开启且已配置 SMTP 时同步发邮件 |

### 5.11 附件中心

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/attachment/list` | `page,pageSize,originalName?,bizType?` | `{ items, total }`；项含 `id,originalName,fileSize,contentType,fileExt,md5Hash,uploadUsername,bizType,url,createTime` |
| GET `/system/attachment/{id}` | — | 单条详情 |
| POST `/system/attachment/upload` | multipart `file`（+ 可选 `bizType,bizId`） | `data: 附件记录`；非白名单类型/超 5MB → 400 |
| DELETE `/system/attachment/{id}` | — | 删除记录与落盘文件 |

### 5.12 工作流

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/workflow/list` | `page,pageSize,name?` | `{ items, total }`；定义项含 `id,name,code,type,definition(JSON审批链字符串),status,remark` |
| POST `/system/workflow` | 同上 | `data: 新定义id`；code 唯一 |
| PUT/DELETE `/system/workflow/{id}` | — | 编辑 / 删除定义 |
| POST `/system/workflow/start` | Query `{ workflowId,title,content?,bizType?,bizId? }` | `data: 实例id`；实例初始 `currentStep=0,totalSteps=N,status='pending'` |
| PUT `/system/workflow/{instanceId}/approve` | Query `{ action: approve|reject, comment? }` | 推进审批链；最后一步 → `status='approved'|'rejected'` + `finishTime`；每步动作写入任务表 |
| PUT `/system/workflow/{instanceId}/cancel` | — | 申请人撤回 → `status='cancelled'` |
| GET `/system/workflow/instances` | `page,pageSize,status?` | `{ items, total }`；实例项含 `id,workflowId,workflowName,applicantName,title,currentStep,totalSteps,status,createTime,finishTime` |
| GET `/system/workflow/{instanceId}/tasks` | — | `data: 审批记录数组`（step,approverName,action,comment,approveTime） |

### 5.13 在线用户

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/online/list` | `username?` | `data: 会话数组`（**非分页**）；项含 `userId,username,token,loginTime` |
| DELETE `/system/online/{token}` | — | 强制下线（作废目标会话），被踢 token 立即 401 |

### 5.14 日志与审计

| 端点 | 请求 | 响应要点 |
|------|------|----------|
| GET `/system/log/operation/list` | `page,pageSize,module?,username?,status?` | `{ items, total }`；项含 `id,username,module,description,method,requestUrl,requestMethod,requestParams,ip,status(1成功/0失败),errorMsg,costTime,createTime` |
| DELETE `/system/log/operation` | — | 清空全部操作日志 |
| GET `/system/log/operation/export` | 同筛选 | xlsx 二进制流（操作日志.xlsx） |
| GET `/system/log/login/list` | `page,pageSize,username?,status?,loginType?` | `{ items, total }`；项含 `username,ip,location,browser,os,loginType,status,message,createTime` |
| DELETE `/system/log/login` · GET `/system/log/login/export` | — | 同上语义（登录日志.xlsx） |
| GET `/system/audit-log/list` | `page,pageSize,module?,entityType?,operation?` | `{ items, total }`；项含 `username,module,operation,entityType,entityId,oldData,newData,changedFields,ip,createTime` |

操作日志由 Java 端 `@Log` 注解 AOP 自动记录（模块/方法/参数/IP/耗时/成败）。

### 5.15 仪表盘（分析页/工作台数据源）

| 端点 | 响应要点 |
|------|----------|
| GET `/dashboard/overview` | `data: { totalUsers,activeUsers,disabledUsers,totalRoles,totalDepts,totalMenus }` |
| GET `/dashboard/user-trends` | `data: [{ month: "2026-09", count: N }]`（近 12 个月新增用户） |
| GET `/dashboard/role-distribution` | `data: [{ name: "超级管理员", value: N }]` |
| GET `/dashboard/dept-distribution` | `data: [{ name: "总公司", value: N }]` |
| GET `/dashboard/browser-distribution` | `data: [{ name: "Chrome", value: N }]`（来源：登录日志 UA 统计） |

---

## 6. 按钮权限码总表

权限码定义于 `sys_menu(type='button', auth_code=...)`，通过角色-菜单关联分配。
前端 `v-access`/`hasAccessByCodes` 与后端 `@SaCheckPermission`（Java）/ `@Permissions`+`PermissionGuard`（Node）使用**同一套码**。

| 权限码 | 含义 | 挂载菜单 | super | admin | user |
|--------|------|----------|:-----:|:-----:|:----:|
| `AC_1000000` | 查看用户（列表/导出） | 用户管理 | ✓ | ✓ | ✓ |
| `AC_100010` | 新增用户 | 用户管理 | ✓ | ✓ | ✗ |
| `AC_100020` | 编辑用户 / 重置密码 / 用户状态切换 | 用户管理 | ✓ | ✓ | ✗ |
| `AC_100030` | 删除用户 | 用户管理 | ✓ | ✓ | ✗ |
| `AC_1000001` | 查看角色（页面/导出） | 角色管理 | ✓ | ✓ | ✓ |
| `AC_1000002` | 编辑角色（增删改/状态切换/权限分配） | 角色管理 | ✓ | ✓ | ✓ |

- 业务扩展时按同样规范在菜单管理页追加按钮节点即可（后端 Guard 动态读表，无需改代码）；
- super 角色在 Guard 中硬编码跳过校验（全通过）；admin/user 按 `sys_role_menu` 实际分配；
- 各角色当前码集：super = admin = 上述 6 个；user = `AC_1000000, AC_1000001, AC_1000002`（查看用户 + 查看/编辑角色）。

---

## 7. 数据模型

双后端共用一套 MySQL schema（`vben_admin` 库，下划线命名，utf8mb4，完整定义见 `sql/init.sql`，共 20 张表）：

| 表 | 说明 | 关键字段 |
|----|------|----------|
| `sys_user` | 用户 | id PK, username UNIQUE, password_hash(BCrypt), real_name, avatar, home_path, phone, email, dept_id, intro, status, remark |
| `sys_role` | 角色 | id PK, name, code UNIQUE(super/admin/user), status, remark |
| `sys_user_role` | 用户-角色 | user_id + role_id 联合主键 |
| `sys_menu` | 菜单/按钮 | id PK, pid, name UNIQUE, type(catalog/menu/button/embedded/link), path, component, redirect, auth_code, icon, status, sort, meta(JSON) |
| `sys_role_menu` | 角色-菜单 | role_id + menu_id 联合主键 |
| `sys_dept` | 部门 | id PK, pid, name, status, remark |
| `sys_refresh_token` | 刷新令牌 | id PK, user_id, token_hash UNIQUE(SHA-256), expires_at, revoked, created_at |
| `sys_notice` | 通知 | id PK, title, message, avatar, link, is_read, user_id, role_id, type |
| `sys_message` | 站内信 | id PK, user_id, sender_id, title, content, type, biz_id, is_read |
| `sys_attachment` | 附件 | id PK, original_name, storage_path, file_size, content_type, file_ext, md5_hash, upload_user_id, upload_username, biz_type, biz_id, url |
| `sys_audit_log` | 审计日志 | id PK, user_id, username, module, operation, entity_type, entity_id, old_data, new_data, changed_fields, ip |
| `sys_operation_log` | 操作日志 | id PK, user_id, username, module, description, method, request_url, request_method, request_params, ip, status, error_msg, cost_time |
| `sys_login_log` | 登录日志 | id PK, user_id, username, ip, location, browser, os, login_type, status, message |
| `sys_job` | 定时任务 | id PK, name, group_name, invoke_target, cron, status(0暂停/1启用), remark |
| `sys_dict_type` | 字典类型 | id PK, name, code UNIQUE, status, remark |
| `sys_dict_data` | 字典数据 | id PK, type_id, label, value, sort, status |
| `sys_config` | 参数配置 | id PK, name, key UNIQUE, value, type, remark |
| `sys_workflow` | 工作流定义 | id PK, name, code UNIQUE, type, definition(JSON), status, remark |
| `sys_workflow_instance` | 工作流实例 | id PK, workflow_id, applicant_id, title, content, current_step, total_steps, status(pending/approved/rejected/cancelled), biz_type, biz_id, finish_time |
| `sys_workflow_task` | 审批记录 | id PK, instance_id, step, approver_id, approver_name, action, comment, approve_time |

推导关系：

- `/user/info` 的 `roles` ← sys_user_role + sys_role.code
- `/auth/codes` ← 角色关联的 `type='button'` 菜单的 `auth_code` 去重
- `/menu/all` ← 角色关联的非 button 菜单组装成树（super 直取全部）
- `/system/menu/name-exists`、`path-exists` ← sys_menu 的 name/path 唯一性校验

演示账号（密码均为 `123456`）：

| username | roles | homePath |
|----------|-------|----------|
| vben | super | 默认(/analytics) |
| admin | admin | /workspace |
| jack | user | /analytics |

> **大整数**：主键为 BIGINT，序列化时**必须转字符串**（Jackson 配 `Long→String`；Prisma 用 `BigInt` + `.toString()`），避免超出 JS `Number.MAX_SAFE_INTEGER` 丢精度。前端 id 类型统一 `number | string`。

---

## 8. 前端对接步骤

本仓库的 4 个前端 app **已完成全部对接配置**，正常情况下无需改动：

1. **代理已预置**：`apps/*/vite.config.ts` → `/api/**` 转发 `http://localhost:8080/api/**`（后端改端口时同步改 `proxy.target`）；
2. **无感刷新开关**：`apps/web-antd/src/preferences.ts` 的 `overridesPreferences` 已含 `app.enableRefreshToken: true`（新 app 需自行开启，否则 401 直接跳登录页）；
3. **后端菜单模式（可选）**：默认 `accessMode='frontend'` 不调 `/menu/all`；联调动态菜单时在偏好设置面板切「权限模式」到 backend，或在 `overridesPreferences` 加 `app: { accessMode: 'backend' }`；
4. **生产部署**：`VITE_GLOB_API_URL=/api` + Nginx 同源反代（避免 CORS + Cookie 问题）。所有 `VITE_GLOB_*` 变量在打包时注入 `dist/_app.config.js`，**改后端地址可直接改该文件，无需重新打包**。

---

## 9. 实现注意事项（坑点清单）

1. **`/auth/refresh` 成功响应是裸 token 字符串**，不是 `{code,data}` 包裹；失败才用 403 + 包裹体。写反了前端无感刷新直接失效。
2. **401 是刷新信号**：需鉴权端点的 token 失效必须返回 401（不是 403/400），否则前端不会尝试刷新。权限不足才是 403。
3. **登录响应不要带 password**；前端只读 `accessToken`。
4. **refreshToken 走 HttpOnly Cookie**：`SameSite=None` 必须配 `Secure`（HTTPS）；开发期 HTTP 同源代理用 `Lax` 规避浏览器限制。
5. **refresh token 轮换**：access 短效（2h），refresh 与 Cookie maxAge 一致（7d），每次刷新换新、旧的作废（哈希入库），防重放。
6. **业务错误两套通道**：HTTP 200 + `code:-1`（业务失败，toast `error ?? message`）与非 2xx + 包裹体（含 401 触发刷新）。约定：参数/业务校验失败用 400/403 + 包裹；token 问题统一 401。
7. **全局异常处理器必须有**：未预期异常统一返回 `500 + code:-1 包裹体`，禁止裸堆栈出站。注意正确透传 NestJS `HttpException` 的状态码与消息（踩坑实例：过滤器曾把 ForbiddenException 降级为 400「无」，见 git 历史）。
8. **`menu/all` 的 `component` 是字符串**：`BasicLayout` / `IFrameView` / views 相对路径三种；目录节点无 component 但要有 `redirect`。
9. **大整数序列化转字符串**（见第 7 节末尾）。
10. **错误文案字段**：优先 `error`，其次 `message`；两者都空时前端按 HTTP 状态码兜底提示。双端同场景文案保持一致（见 2.3 对照表）。
11. **菜单路由完整性校验**：dir/menu 必填 path、menu 必填 component，否则产生前端不可见且无法删除的脏数据（双端已实现）。
12. **`enableRefreshToken` 默认 false**：不开的话 401 直接重新认证，`/auth/refresh` 永远不会被调用。联调刷新前先确认已开启。
13. **Token 校验回查用户**：禁用/删除用户后存量 token 立即失效（见 2.5）。
14. **Excel 导出响应**：直接写二进制流（不经包裹体拦截器），前端必须用 `download` 客户端（blob）接收。
15. **强制下线语义**：被踢会话的所有后续请求立即 401（而非 403），前端会走一次刷新失败后跳登录页，符合预期。

---

## 10. 联调验收清单

### 认证与会话

- [ ] `vben/123456`、`admin/123456`、`jack/123456` 均可登录并进入各自 home_path（/analytics、/workspace、/analytics）
- [ ] 错误密码 → 403；连续 5 次失败 → 400 锁定提示（Java）；锁定期内正确密码也无法登录
- [ ] 禁用账号登录 → 403 `该账号已被禁用`；被禁用用户的存量 token 请求 → 403
- [ ] 登录后 F5 刷新仍保持登录；篡改 localStorage 的 accessToken → 请求 401 → 自动 `/auth/refresh` → 重放成功（需开启 enableRefreshToken）
- [ ] Chrome Network 面板确认：`/auth/refresh` 成功响应体是**纯 token 字符串**
- [ ] 登出 → Cookie 被清、服务端令牌失效、回登录页带 redirect 参数
- [ ] 修改密码后旧密码登录失败、新密码登录成功

### 权限与菜单

- [ ] jack 菜单仅「概览/分析页 + 系统管理(用户/角色)」；直接访问 `/system/menu` → 404
- [ ] admin 用户管理操作列为「修改/重置密码/删除」，jack 为空；jack 角色管理按钮齐全
- [ ] jack 调 POST `/system/user` → 403 `无权限执行此操作`
- [ ] admin 的 `/auth/codes` 返回 6 个码；jack 返回 3 个码
- [ ] 偏好切换 accessMode=backend 后 `/menu/all` 返回的菜单树可正常渲染与跳转

### 业务功能

- [ ] 用户 CRUD 全链路：新增（弱密码被拒）→ 编辑 → 重置密码 → 删除（删自己被拒）
- [ ] 角色/部门/字典/参数 CRUD 全链路（含唯一性校验 400）
- [ ] 菜单新增缺 path → 400 `路由路径不能为空`（双端一致）
- [ ] 定时任务：新增 → 执行一次（日志确认执行成功）→ 暂停/恢复 → 删除
- [ ] 通知发送（按用户/按角色广播）→ 接收方通知列表可见；消息中心已读/全部已读
- [ ] 附件上传（真实文件）→ 列表可见 → 删除
- [ ] 工作流：新建定义 → 发起 → 审批通过（状态变 approved）→ 撤回/驳回路径 → 删除
- [ ] 在线用户强退 → 被踢 token 立即 401、列表移除
- [ ] 分页接口 `items/total` 结构正确；Excel 导出（用户/角色/日志）可下载打开
