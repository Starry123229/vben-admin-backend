<div align="center">

# Vben Admin 後台管理系統

**基於 Vue 3 + Vben Admin 5.7 的前後端分離企業級中後台管理系統**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#授權條款)

[简体中文](../README.md) | **繁體中文** | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## 專案簡介

- **前端**：基於 Vben Admin 5.7 monorepo，內建 4 套 UI 應用，業務程式碼一致，任選其一執行；
- **後端**：Java（Spring Boot 4.1）與 Node.js（NestJS 12）雙實作，共用同一 MySQL 資料庫與同一份 API 契約（[`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)），功能完全對等，任選其一執行；
- 所有 API 統一以 `/api` 為全域前綴，前端開發伺服器已預設代理，**前後端聯調零設定**；
- 內建模組：登入驗證、使用者/角色/部門/選單、資料字典、參數設定、排程任務、通知與訊息中心、附件、工作流程、操作/登入/稽核日誌、線上使用者與系統監控、個人中心。

| 端（二選一 / 四選一） | 選項 | 連接埠 |
| --- | --- | --- |
| 後端 | Java Spring Boot 4.1 / Node NestJS 12 | 均監聽 `localhost:8080` |
| 前端 | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## 目錄結構

```
vben/
├── vben-admin-backend/              # 後端
│   ├── docs/api-contract.md         # API 契約（雙端實作依據）
│   ├── java-backend/                # Java 實作（Spring Boot）
│   ├── node-backend/                # Node 實作（NestJS + Prisma）
│   └── sql/init.sql                 # 建庫 + 20 張表 + 示範資料（一鍵匯入）
└── vue-vben-admin-v5.7.0/           # 前端 monorepo（pnpm workspace）
    ├── apps/                        # 4 套 UI 應用：web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # 共用套件（UI 元件、hooks、偏好設定等）
    ├── internal/                    # 建置與 Lint 設定
    └── scripts/                     # 指令碼工具
```

## 技術棧與環境需求

| 端 | 技術 |
| --- | --- |
| 前端 | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| 前端 UI（4 選 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 後端 | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node 後端 | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| 資料庫 | MySQL 9.x（utf8mb4） |

| 工具 | 版本需求 | 用途 |
| --- | --- | --- |
| Node.js | ≥ 22.18（建議 24 LTS） | 前端 + Node 後端 |
| pnpm | ≥ 10（`npm i -g pnpm`） | 前端 + Node 後端 |
| MySQL | 9.x | 雙後端共用 |
| JDK | 25 | 僅 Java 後端 |
| Maven | 3.9+ | 僅 Java 後端 |

工具安裝完成後執行自我檢查，版本不低於需求即可：

```bash
node -v && pnpm -v && mysql --version    # 前端 + Node 後端
java -version && mvn -v                  # Java 後端
```

## 快速開始

### 第 1 步：初始化資料庫

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) 單一檔案完成**建庫（`vben_admin`）→ 建 20 張表 → 匯入示範資料**，雙後端共用。

**1.1 確認 MySQL 服務已執行**

```bash
Get-Service MySQL*            # Windows（管理員 PowerShell），Status 應為 Running
mysqladmin -uroot -p status   # macOS / Linux，能輸出 Uptime 即正常
```

**1.2 執行匯入**

在**專案根目錄**執行（推薦）：

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

其他方式（二選一）：

```sql
-- MySQL 互動環境（mysql -uroot -p 進入後執行；Windows 路徑用正斜線）
SOURCE C:/你的路徑/vben-admin-backend/sql/init.sql;
```

或使用 Navicat / DBeaver / DataGrip 等圖形化工具，開啟 `init.sql` 全文執行（PowerShell 不支援 `<`，請用這兩種方式之一）。

**1.3 驗證匯入結果**

```sql
USE vben_admin;
SHOW TABLES;                          -- 約 20 張表（sys_user、sys_menu、sys_role 等）
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

三條 SQL 符合預期即初始化完成。

> - 指令碼內建 `CREATE DATABASE IF NOT EXISTS` 與 `USE vben_admin`，匯入即寫入 `vben_admin` 資料庫；
> - 建表均帶 `IF NOT EXISTS`，但示範資料重複插入會因主鍵衝突中斷，**僅首次匯入執行**；
> - 報 `Access denied` 為密碼錯誤；報 `command not found` 表示 mysql 未加入 `PATH`，改用完整路徑（如 `"C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"`）。

### 第 2 步：啟動後端（Java / Node 二選一）

> 雙後端共用 8080 連接埠，**執行時只能二選一**；資料庫共用，切換無需遷移資料。

#### 方案 A：Java 後端（Spring Boot 4.1）

**A-1. 啟動**（首次執行需下載相依套件，可能耗時數分鐘）：

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. 確認啟動成功**，終端出現以下日誌即為成功（保持視窗開啟，`Ctrl + C` 停止）：

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. 驗證 API 連通**，另開終端執行（回傳 JSON 即正常）：

```bash
curl http://localhost:8080/api/auth/config
# 預期：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**資料庫連線**在 `src/main/resources/application-dev.yml`，支援環境變數覆寫：

| 環境變數 | 預設值 | 說明 |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | 資料庫位址 / 連接埠 |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | 資料庫帳號 / 密碼 |

**其他常用設定**（`src/main/resources/application.yml`）：

| 設定項 | 說明 |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken 有效期（秒，預設 7200） |
| `vben.auth.refresh-token-days` | refreshToken 有效天數（預設 7） |
| `vben.auth.login-methods.*` | 登入方式開關（預設僅開啟帳號登入） |
| `vben.auth.sms-mock` / `email-mock` | 簡訊/郵件 Mock（驗證碼由 API 回顯，正式環境請關閉） |
| `vben.auth.upload-dir` | 上傳檔案目錄（預設 `./uploads`） |
| `app.message.mail-enabled` | 訊息中心郵件通知開關 |
| `app.tenant.enabled` | 多租戶開關 |

> **常見失敗**：
> - 資料庫相關日誌 `Connection refused` → MySQL 未啟動或帳號密碼不符；
> - `Port 8080 was already in use` → 8080 被占用（可能是 Node 後端在執行），請先停掉；
> - 編譯報 JDK 版本錯誤 → 確認 `java -version` 為 25 且 `JAVA_HOME` 指向 JDK 25。

#### 方案 B：Node 後端（NestJS 12 + Fastify 5 + Prisma 7）

**B-1. 安裝相依套件並準備環境檔案**：

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env 未納入版本控制（被 .gitignore 忽略），首次必須從範本複製
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. 核對資料庫連線**：開啟 `.env`，確認 `DATABASE_URL` 的帳號密碼與第 1 步一致（預設 `root/123456`）。

**B-3. 產生 Prisma Client**（首次必須，否則啟動報 PrismaClient 初始化錯誤）：

```bash
pnpm db:generate
# 預期輸出：✔ Generated Prisma Client
```

**B-4. 啟動後端**：

```bash
pnpm dev              # 開發模式（tsx watch 熱重載，改程式碼自動重啟）
# 或 pnpm build && pnpm start   # 執行編譯產物
```

**B-5. 確認啟動成功**，終端出現以下日誌即為成功（保持視窗開啟，`Ctrl + C` 停止）：

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. 驗證 API 連通**，另開終端執行（回傳 JSON 即正常）：

```bash
curl http://localhost:8080/api/auth/config
# 預期：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**`.env` 關鍵設定**（範本見 `.env.example`）：

| 變數 | 預設值（範本） | 說明 |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | 資料庫連線字串 |
| `PORT` | `8080` | 服務連接埠（與前端代理對齊） |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev 佔位值 | JWT 簽章金鑰，**正式環境必須更換** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Token 有效期 |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | 僅 `ACCOUNT=true` | 登入方式開關，登入頁據此顯示/隱藏入口 |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | 首次手機號 / 第三方登入自動建號（正式環境維持 `false`） |
| `UPLOAD_DIR` | `./uploads` | 上傳目錄 |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | 簡訊/郵件 Mock（驗證碼回顯，正式環境關閉） |

其他指令：`pnpm build`（編譯至 `dist/`）、`pnpm db:studio`（Prisma 視覺化資料瀏覽器）。

> **常見失敗**：
> - `Cannot find module '@prisma/client'` → 漏了 `pnpm db:generate`；
> - `Can't reach database server` → MySQL 未啟動或 `.env` 連線字串不正確；
> - `Port 8080 is already in use` → 8080 被占用（可能是 Java 後端在執行），請先停掉；
> - `pnpm install` 報 `[ERR_PNPM_IGNORED_BUILDS]` → 確認 `pnpm-workspace.yaml` 中 `allowBuilds` 各項為 `true`（專案已預設）後重新安裝。

### 第 3 步：啟動前端（4 選 1）

| 應用 | UI 框架 | 開發連接埠 | 啟動指令 |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. 安裝前端相依套件**（首次，一次裝齊 4 套應用，需下載數百 MB）：

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. 啟動所選應用**（以 Ant Design Vue 版為例）：

```bash
pnpm dev:antd        # 等同於 pnpm --filter @vben/web-antd dev
```

**F-3. 確認啟動成功**（首次啟動需預熱相依套件，約 20~40 秒）：

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. 開啟瀏覽器並登入**：瀏覽器開啟 `http://localhost:5666`，自動跳轉登入頁，完成滑動驗證後使用示範帳號登入（見第 4 步）。

**F-5. 切換其他 UI**（選用）：停止目前前端，替換啟動指令即可（連接埠見上表）：

```bash
pnpm dev:ele           # Element Plus 版 → http://localhost:5777
pnpm dev:naive         # Naive UI 版 → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next 版 → http://localhost:6001
```

> - **前後端對接已自動完成**：每個應用 `vite.config.ts` 均預設代理 `/api/**` → `http://localhost:8080/api/**`，後端執行於預設 8080 連接埠時前端零設定；後端改連接埠時同步修改 `apps/<應用>/vite.config.ts` 的 `proxy.target`；
> - **常見失敗**：`pnpm install` 卡住 → 換鏡像 `pnpm config set registry https://registry.npmmirror.com` 後重試；頁面 API 報 500/404 → 後端未啟動或連接埠不一致；連接埠被占用 → 修改對應 `apps/<應用>/.env.development` 的 `VITE_PORT` 後重啟。

### 第 4 步：登入系統

示範帳號（密碼均為 `123456`）：

| 帳號 | 角色 | 登入後首頁 | 可見範圍 |
| --- | --- | --- | --- |
| **vben** | super 超級管理員 | /analytics 分析頁 | 全部選單與按鈕權限 |
| **admin** | admin 管理員 | /workspace 工作台 | 系統管理 / 系統監控 / 系統工具 |
| **jack** | user 一般使用者 | /analytics 分析頁 | 僅使用者管理（唯讀）與角色管理，越權存取回傳 403/404 |

登入成功並跳轉至分析頁 / 工作台即**部署完成**。

> 手機驗證碼 / 掃碼 / 註冊 / 第三方 OAuth 入口由後端開關控制（見第 2 步設定表），開啟後登入頁自動顯示；Mock 模式下驗證碼直接在 API 回應中回顯。

## 正式環境部署

### 前端建置

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # 等同 pnpm --filter @vben/web-antd build；產物：apps/web-antd/dist
```

其他 UI：`pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`。

**Nginx 參考設定**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # 指向 dist 目錄
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA 路由回退
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # 後端自帶 /api 前綴，無需重寫
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # 附件上傳
    }
}
```

### 後端建置

```bash
# Java（先停止執行中的行程，否則 jar 被占用導致打包失敗）
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### 正式環境安全檢查清單

- [ ] 修改資料庫預設密碼 `123456`，示範帳號下線或改密
- [ ] 更換 Node 端 `.env` 中的 `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- [ ] 關閉 SMS/EMAIL Mock（Java：`vben.auth.sms-mock=false`；Node：`.env` 同名項設為 `false`）並接入真實簡訊/郵件服務
- [ ] 關閉 knife4j / Swagger 文件（Java：`springdoc.api-docs.enabled=false`）
- [ ] 收斂登入方式（關閉註冊與手機號/第三方自動建號）
- [ ] HTTPS 環境啟用安全 Cookie（Java：`vben.auth.cookie-secure=true`；Node：`COOKIE_SECURE=true`）

## 系統說明

**權限模型**：RBAC（使用者 → 角色 → 選單/按鈕），前後端共用同一套權限碼。

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 前端路由 / 側邊選單
                                                              └─ type=button → auth_code（按鈕級權限碼）
```

- **選單權限**：後端依使用者角色動態回傳路由樹（`GET /menu/all`），無權限的路由前端不註冊（直接存取回傳 404）；
- **按鈕權限**：`auth_code`（如 `AC_100010` 新增使用者）在前端透過 `v-access` 指令 / `hasAccessByCodes` 控制按鈕顯示隱藏，後端透過 `@SaCheckPermission`（Java）/ `@Permissions` + `PermissionGuard`（Node）驗證 API；
- **超級管理員**：`code=super` 的角色擁有全部權限。

**驗證機制**：登入後簽發雙 Token —— accessToken（2 小時，localStorage，`Authorization: Bearer <token>` 攜帶）+ refreshToken（7 天，HttpOnly Cookie，防 XSS）；accessToken 過期時前端自動呼叫 `POST /auth/refresh` 靜默續期；登出 / 強制下線作廢雙 Token。

## API 文件

| 後端 | 位址 |
| --- | --- |
| Java（knife4j） | <http://localhost:8080/api/doc.html> |
| Node（Swagger） | <http://localhost:8080/api/docs> |

線上除錯：先呼叫 `POST /auth/login` 取得 accessToken，再於文件頁 Authorize 中填入 `Bearer <accessToken>`。完整 API 契約見 [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)。

## 常見問題 FAQ

**Q1：前端請求全部失敗 / 登入無回應？**
依序排查：① 後端是否執行於 8080（`curl http://localhost:8080/api/auth/config` 應回傳 JSON）；② 資料庫是否已匯入 `init.sql`；③ 資料庫帳號密碼是否正確（看後端啟動日誌）；④ 是否有舊行程殘留。

**Q2：8080 連接埠被占用 / 如何切換雙後端？**
Java 與 Node 後端共用 8080，不能同時啟動；切換只需停一個、起另一個，前端重新整理後重新登入（資料庫共用，無需遷移）。需要並行對比時：修改 Node 端 `.env` 的 `PORT`（如 8081），並同步修改前端 `vite.config.ts` 的 `proxy.target`。

**Q3：登入頁看不到手機登入 / 註冊 / 第三方登入入口？**
登入方式由後端開關控制並下發（`GET /auth/config`）：Java 端在 `application.yml` 的 `vben.auth.login-methods.*` 中開啟；Node 端在 `.env` 的 `LOGIN_METHODS_*` 中控制。

**Q4：驗證碼收不到？**
開發環境預設開啟簡訊/郵件 Mock，驗證碼直接在 API 回應中回顯。正式環境請接入真實服務並關閉 Mock。

**Q5：附件上傳失敗提示檔案過大？**
後端限制單一檔案 ≤ 5MB（Java 端 multipart 上限 10MB、業務驗證 5MB）。Nginx 部署時需設定 `client_max_body_size 10m;`。

**Q6：排程任務「執行一次」提示找不到 Bean / 方法？**
任務呼叫目標格式為 `beanName.methodName`（如 `sampleJob.run`），對應實作必須存在於後端程式碼中（Java：`@Component("xxx")`；Node：已註冊的任務方法）。

## 授權條款

[MIT](../LICENSE)
