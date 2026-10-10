<div align="center">

# Vben Admin 後台管理系統

<p>開源後台管理框架（Vue 3 Admin Template / Dashboard）：基於 Vben Admin 5.7 的全棧方案，Vue 3 + Vite 前端，Java Spring Boot 4 / Node.js NestJS 12 雙後端，RBAC 權限、JWT 雙 Token、MySQL，開箱即用，MIT 免費商用</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#授權條款)
[![GitHub Stars](https://img.shields.io/github/stars/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Starry123229/vben-admin-backend)](https://github.com/Starry123229/vben-admin-backend/issues)

[简体中文](../README.md) | **繁體中文** | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## 目錄結構

```
vben/
├── vben-admin-backend/              # 後端
│   ├── docs/api-contract.md         # API 契約（雙端實作依據）
│   ├── java-backend/                # Java 實作（Spring Boot）
│   ├── node-backend/                # Node 實作（NestJS + Prisma）
│   └── sql/init.sql                 # 建庫 + 20 張表 + 示範資料（一鍵匯入）
└── vue-vben-admin-v5.7.0/           # 前端 monorepo（pnpm workspace）
    ├── apps/                        # 4 套 UI 應用
    ├── packages/                    # 共用套件
    └── internal/                    # 建置與 Lint 設定
```

## 技術棧

| 端 | 技術 |
| --- | --- |
| 前端 | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| 前端 UI（4 選 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 後端 | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Node 後端 | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| 資料庫 | MySQL 9.x（utf8mb4） |

## 快速開始

### 1. 初始化資料庫

```bash
# 確認 MySQL 已執行，執行一鍵匯入
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` 單一檔案完成建庫（`vben_admin`）→ 建 20 張表 → 匯入示範資料，雙後端共用。

### 2. 啟動後端（Java / Node 二選一）

```bash
# 方案 A：Java 後端
cd vben-admin-backend/java-backend
mvn spring-boot:run

# 方案 B：Node 後端
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> 雙後端共用 8080 連接埠，同時只能執行一個。資料庫預設 `root/123456`，如需修改見各端設定檔。

### 3. 啟動前端（4 選 1）

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. 登入系統

示範帳號（密碼均為 `123456`）：

| 帳號 | 角色 | 可見範圍 |
| --- | --- | --- |
| **vben** | 超級管理員 | 全部選單與按鈕權限 |
| **admin** | 管理員 | 系統管理 / 監控 / 工具 |
| **jack** | 一般使用者 | 使用者管理（唯讀）與角色管理 |

## 正式環境部署

### 前端建置

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # 產物：apps/web-antd/dist
```

### 後端建置

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Nginx 參考設定

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

## 系統流程

**權限模型**：RBAC（使用者 → 角色 → 選單/按鈕），前後端共用同一套權限碼。

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 前端路由 / 側邊選單
                                                              └─ type=button → auth_code（按鈕級權限碼）
```

**認證流程**：

```
登入 → 簽發雙 Token
  ├─ accessToken （2h，localStorage，請求標頭 Authorization: Bearer）
  └─ refreshToken（7d，HttpOnly Cookie，防 XSS）
      └─ accessToken 過期 → 前端自動呼叫 POST /auth/refresh 靜默續期
      └─ 登出 / 強制下線 → 雙 Token 作廢
```

**選單與按鈕權限**：

- **選單權限**：後端依角色動態回傳路由樹（`GET /menu/all`），無權限路由前端不註冊；
- **按鈕權限**：`auth_code`（如 `AC_100010`）在前端透過 `v-access` 指令控制顯示隱藏，後端透過 `@SaCheckPermission`（Java）/ `@Permissions`（Node）驗證 API；
- **超級管理員**：`code=super` 的角色擁有全部權限。

## API 文件

| 後端 | 位址 |
| --- | --- |
| Java（knife4j） | http://localhost:8080/api/doc.html |
| Node（Swagger） | http://localhost:8080/api/docs |

完整 API 契約見 [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)。

## ❓ 常見問題

**1. Java 後端和 Node 後端怎麼切換？**
兩套後端實作同一份 API 契約、共用同一個資料庫和 8080 連接埠，停掉一個、啟動另一個即可，前端無需任何改動。

**2. 預設的登入帳號密碼是什麼？**
見上方「快速開始 → 登入系統」，示範帳號密碼均為 `123456`。

**3. 忘記密碼 / 想重置示範資料？**
重新執行 `mysql -uroot -p < vben-admin-backend/sql/init.sql` 即可恢復全部示範資料（注意會清空現有資料）。

**4. 支援 PostgreSQL / Oracle 嗎？**
目前 SQL 腳本為 MySQL 方言（utf8mb4）。Java 端基於 MyBatis-Plus、Node 端基於 Prisma，均具備切換資料庫的基礎能力，歡迎提 PR。

**5. 連接埠被佔用怎麼改？**
後端預設 `8080`，前端 4 套應用分別為 `5666 / 5777 / 5888 / 6001`，在各端設定檔中修改即可。

**6. 可以商用嗎？**
可以，MIT 授權條款允許免費商用，請保留版權聲明。

## 💬 交流與回饋

- 🐛 Bug 回報 / 功能建議：[Issues](https://github.com/Starry123229/vben-admin-backend/issues)
- 💡 使用交流 / 經驗分享：[Discussions](https://github.com/Starry123229/vben-admin-backend/discussions)

## 授權條款

[MIT](../LICENSE)
