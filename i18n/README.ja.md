<div align="center">

# Vben Admin 管理システム

<p>オープンソースの管理システム框架（Vue 3 Admin Template / Dashboard）：Vben Admin 5.7 を基にしたフルスタック構成。Vue 3 + Vite フロントエンド、Java Spring Boot 4 / Node.js NestJS 12 のデュアルバックエンド、RBAC 権限、JWT デュアルトークン、MySQL。すぐに使えて、MIT ライセンスで商用利用無料</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#ライセンス)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | **日本語** | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## 特徴

- 💪 フロントエンド 4 種類の UI アプリ（Ant Design Vue / Element Plus / Naive UI / Ant Design Vue Next）。ビジネスコードは同一で、いずれか 1 つを選択
- 🚀 バックエンドは Java（Spring Boot 4.1）と Node.js（NestJS 12）の 2 実装を提供。機能は完全に同等で、どちらかを選択
- 💅 RBAC 権限モデル + デュアルトークン認証（accessToken + refreshToken）
- 🌍 フロントエンド・バックエンド連携設定不要。開発サーバーに `/api` プロキシが設定済み
- 📦️ 内蔵モジュール：ユーザー / ロール / 部門 / メニュー、データ辞書、パラメータ設定、スケジュールジョブ、お知らせとメッセージセンター、添付ファイル、ワークフロー、操作 / ログイン / 監査ログ、オンラインユーザーとシステム監視
- 🥳 オープンソース版は商用利用無料

## ディレクトリ構成

```
vben/
├── vben-admin-backend/              # バックエンド
│   ├── docs/api-contract.md         # API 契約（両実装の共通仕様）
│   ├── java-backend/                # Java 実装（Spring Boot）
│   ├── node-backend/                # Node 実装（NestJS + Prisma）
│   └── sql/init.sql                 # DB 作成 + 20 テーブル + デモデータ（一括インポート）
└── vue-vben-admin-v5.7.0/           # フロントエンド monorepo（pnpm workspace）
    ├── apps/                        # 4 つの UI アプリ
    ├── packages/                    # 共有パッケージ
    └── internal/                    # ビルド・Lint 設定
```

## 技術スタック

| サイド | 技術 |
| --- | --- |
| フロントエンド | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| フロントエンド UI（4 選 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java バックエンド | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Node バックエンド | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| データベース | MySQL 9.x（utf8mb4） |

## クイックスタート

### 1. データベースの初期化

```bash
# MySQL が起動していることを確認し、一括インポート
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` は 1 ファイルでデータベース作成（`vben_admin`）→ 20 テーブル作成 → デモデータ投入まで完了します。両バックエンドで共用。

### 2. バックエンドの起動（Java / Node いずれか）

```bash
# オプション A：Java バックエンド
cd vben-admin-backend/java-backend
mvn spring-boot:run

# オプション B：Node バックエンド
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> 両バックエンドはポート 8080 を共用するため、同時に 1 つしか起動できません。データベースのデフォルトは `root/123456`。変更する場合は各設定ファイルを参照してください。

### 3. フロントエンドの起動（4 つから 1 つ選択）

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. ログイン

デモアカウント（パスワードはすべて `123456`）：

| アカウント | ロール | 権限範囲 |
| --- | --- | --- |
| **vben** | スーパー管理者 | すべてのメニューとボタン権限 |
| **admin** | 管理者 | システム管理 / 監視 / ツール |
| **jack** | 一般ユーザー | ユーザー管理（読み取り専用）とロール管理 |

## 本番デプロイ

### フロントエンドのビルド

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # 出力：apps/web-antd/dist
```

### バックエンドのビルド

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Nginx 設定例

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

## システムの仕組み

**権限モデル**：RBAC（ユーザー → ロール → メニュー / ボタン）。フロントエンドとバックエンドで同一の権限コードを共有。

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → フロントエンドのルート / サイドメニュー
                                                              └─ type=button → auth_code（ボタン単位の権限コード）
```

**認証フロー**：

```
ログイン → デュアルトークン発行
  ├─ accessToken（2h、localStorage、リクエストヘッダー Authorization: Bearer）
  └─ refreshToken（7d、HttpOnly Cookie、XSS 対策）
      └─ accessToken 期限切れ → フロントエンドが自動で POST /auth/refresh を呼び出しサイレント更新
      └─ ログアウト / 強制ログアウト → 両トークン失効
```

**メニューとボタン権限**：

- **メニュー権限**：バックエンドがロールに応じてルートツリーを動的に返します（`GET /menu/all`）。権限のないルートはフロントエンドに登録されません。
- **ボタン権限**：`auth_code`（例：`AC_100010`）はフロントエンドで `v-access` ディレクティブで表示を制御し、バックエンドで `@SaCheckPermission`（Java）/ `@Permissions`（Node）で API を検証します。
- **スーパー管理者**：`code=super` のロールはすべての権限を持ちます。

## API ドキュメント

| バックエンド | URL |
| --- | --- |
| Java（knife4j） | http://localhost:8080/api/doc.html |
| Node（Swagger） | http://localhost:8080/api/docs |

完全な API 契約は [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md) にあります。

## ライセンス

[MIT](../LICENSE)
