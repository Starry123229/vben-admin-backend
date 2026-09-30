<div align="center">

# Vben Admin 管理システム

**Vue 3 + Vben Admin 5.7 で構築されたフロントエンド / バックエンド分離型のエンタープライズ管理システム**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#ライセンス)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | **日本語** | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## プロジェクト概要

- **フロントエンド**：Vben Admin 5.7 monorepo をベースに、**4 種類の UI アプリ**を同梱。ビジネスコードはすべて同一で、いずれか 1 つを選んで実行するだけです。
- **バックエンド**：Java（Spring Boot 4.1）と Node.js（NestJS 12）の 2 実装を提供。同一の MySQL データベースと同一の API 契約（[`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)）を共有し、機能は完全に同等です。どちらか 1 つを選んで実行します。
- すべての API は `/api` をグローバルプレフィックスとして使用し、フロントエンドの開発サーバーにはプロキシが設定済みです。**フロントエンドとバックエンドの連携設定は不要**です。
- 内蔵モジュール：ログイン認証、ユーザー / ロール / 部門 / メニュー、データ辞書、パラメータ設定、スケジュールジョブ、お知らせとメッセージセンター、添付ファイル、ワークフロー、操作 / ログイン / 監査ログ、オンラインユーザーとシステム監視、プロフィール。

| サイド（いずれか 1 つ） | 選択肢 | ポート |
| --- | --- | --- |
| バックエンド | Java Spring Boot 4.1 / Node NestJS 12 | いずれも `localhost:8080` |
| フロントエンド | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## ディレクトリ構成

```
vben/
├── vben-admin-backend/              # バックエンド
│   ├── docs/api-contract.md         # API 契約（両実装の共通仕様）
│   ├── java-backend/                # Java 実装（Spring Boot）
│   ├── node-backend/                # Node 実装（NestJS + Prisma）
│   └── sql/init.sql                 # DB 作成 + 20 テーブル + デモデータ（一括インポート）
└── vue-vben-admin-v5.7.0/           # フロントエンド monorepo（pnpm workspace）
    ├── apps/                        # 4 つの UI アプリ：web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # 共有パッケージ（UI コンポーネント、hooks、設定など）
    ├── internal/                    # ビルド・Lint 設定
    └── scripts/                     # スクリプトツール
```

## 技術スタックと動作環境

| サイド | 技術 |
| --- | --- |
| フロントエンド | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| フロントエンド UI（4 選 1） | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java バックエンド | Spring Boot 4.1（JDK 25）· Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node バックエンド | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| データベース | MySQL 8.x（utf8mb4） |

| ツール | バージョン要件 | 用途 |
| --- | --- | --- |
| Node.js | ≥ 22.18（24 LTS 推奨） | フロントエンド + Node バックエンド |
| pnpm | ≥ 10（`npm i -g pnpm`） | フロントエンド + Node バックエンド |
| MySQL | 8.x | 両バックエンドで共用 |
| JDK | 25 | Java バックエンドのみ |
| Maven | 3.9+ | Java バックエンドのみ |

インストール後、以下のセルフチェックを実行し、バージョンが要件を満たすことを確認してください。

```bash
node -v && pnpm -v && mysql --version    # フロントエンド + Node バックエンド
java -version && mvn -v                  # Java バックエンド
```

## クイックスタート

### ステップ 1：データベースの初期化

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) は 1 ファイルで**データベース作成（`vben_admin`）→ 20 テーブル作成 → デモデータ投入**まで完了します。両バックエンドで共用できます。

**1.1 MySQL サービスの起動確認**

```bash
Get-Service MySQL*            # Windows（管理者 PowerShell）。Status が Running であれば OK
mysqladmin -uroot -p status   # macOS / Linux。Uptime が出力されれば正常
```

**1.2 インポートの実行**

**リポジトリのルートディレクトリ**で実行します（推奨）：

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

その他の方法：

```sql
-- MySQL 対話シェル（mysql -uroot -p で入ってから実行。Windows のパスはスラッシュを使用）
SOURCE C:/your/path/vben-admin-backend/sql/init.sql;
```

または Navicat / DBeaver / DataGrip などの GUI ツールで `init.sql` を開き、全体を実行します。
（PowerShell は `<` をサポートしないため、上記いずれかの方法を使用してください。）

**1.3 インポート結果の確認**

```sql
USE vben_admin;
SHOW TABLES;                          -- 約 20 テーブル（sys_user、sys_menu、sys_role など）
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

3 つの SQL がすべて期待どおりであれば初期化完了です。

> - スクリプトには `CREATE DATABASE IF NOT EXISTS` と `USE vben_admin` が含まれており、インポート先は常に `vben_admin` です。
> - テーブル作成は `IF NOT EXISTS` 付きで再実行可能ですが、デモデータの再投入は主キー重複で中断します。**フルインポートは初回のみ実行してください**。
> - `Access denied` はパスワード誤り、`command not found` は mysql が `PATH` にないことを示します。フルパス（例：`"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`）を使用してください。

### ステップ 2：バックエンドの起動（Java / Node のいずれか）

> 両バックエンドはポート 8080 を共用するため、**同時に起動できるのは 1 つだけ**です。データベースは共用なので、切り替え時のマイグレーションは不要です。

#### オプション A：Java バックエンド（Spring Boot 4.1）

**A-1. 起動**（初回は依存関係のダウンロードのため数分かかることがあります）：

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. 起動確認** — 以下のログが出力されれば成功です（ターミナルは開いたままにし、`Ctrl + C` で停止）：

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. 疎通確認** — 別のターミナルで実行（JSON が返れば正常）：

```bash
curl http://localhost:8080/api/auth/config
# 期待値：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**データベース接続**は `src/main/resources/application-dev.yml` にあり、環境変数で上書きできます：

| 環境変数 | デフォルト | 説明 |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | データベースのホスト / ポート |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | データベースのユーザー / パスワード |

**その他の主要設定**（`src/main/resources/application.yml`）：

| 設定項目 | 説明 |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken の有効期限（秒、デフォルト 7200） |
| `vben.auth.refresh-token-days` | refreshToken の有効日数（デフォルト 7） |
| `vben.auth.login-methods.*` | ログイン方式のスイッチ（デフォルトはアカウントログインのみ） |
| `vben.auth.sms-mock` / `email-mock` | SMS / メールのモック（確認コードをレスポンスに含める。本番では無効化） |
| `vben.auth.upload-dir` | アップロードディレクトリ（デフォルト `./uploads`） |
| `app.message.mail-enabled` | メッセージセンターのメール通知スイッチ |
| `app.tenant.enabled` | マルチテナントスイッチ |

> **よくある失敗**：
> - データベース関連ログの `Connection refused` → MySQL が停止しているか、認証情報が一致していません。
> - `Port 8080 was already in use` → 8080 が使用中です（Node バックエンドが起動中の可能性）。先に停止してください。
> - JDK バージョンに関するコンパイルエラー → `java -version` が 25 であることと、`JAVA_HOME` が JDK 25 を指していることを確認してください。

#### オプション B：Node バックエンド（NestJS 12 + Fastify 5 + Prisma 7）

**B-1. 依存関係のインストールと環境ファイルの準備**：

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env はバージョン管理対象外（.gitignore で除外）。初回はテンプレートからコピーが必要
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. データベース接続の確認**：`.env` を開き、`DATABASE_URL` の認証情報がステップ 1 と一致することを確認します（デフォルト `root/123456`）。

**B-3. Prisma Client の生成**（初回必須。実行しないと起動時に PrismaClient の初期化エラーになります）：

```bash
pnpm db:generate
# 期待される出力：✔ Generated Prisma Client
```

**B-4. バックエンドの起動**：

```bash
pnpm dev              # 開発モード（tsx watch によるホットリロード）
# または pnpm build && pnpm start   # コンパイル済み出力を実行
```

**B-5. 起動確認** — 以下のログが出力されれば成功です（ターミナルは開いたままにし、`Ctrl + C` で停止）：

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. 疎通確認** — 別のターミナルで実行（JSON が返れば正常）：

```bash
curl http://localhost:8080/api/auth/config
# 期待値：{"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**`.env` の主要設定**（テンプレート：`.env.example`）：

| 変数 | デフォルト（テンプレート） | 説明 |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | データベース接続文字列 |
| `PORT` | `8080` | サーバーポート（フロントエンドのプロキシと一致させる） |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev 用プレースホルダー | JWT 署名シークレット。**本番では必ず変更** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | トークンの有効期限 |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | `ACCOUNT=true` のみ | ログイン方式のスイッチ。ログインページの表示に反映 |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | 初回の電話番号 / OAuth ログインで自動アカウント作成（本番は `false` のまま） |
| `UPLOAD_DIR` | `./uploads` | アップロードディレクトリ |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | SMS / メールのモック（確認コードを返却。本番では無効化） |

その他のコマンド：`pnpm build`（`dist/` へコンパイル）、`pnpm db:studio`（Prisma のビジュアルデータブラウザー）。

> **よくある失敗**：
> - `Cannot find module '@prisma/client'` → `pnpm db:generate` を実行していません。
> - `Can't reach database server` → MySQL が停止しているか、`.env` の接続文字列が誤っています。
> - `Port 8080 is already in use` → 8080 が使用中です（Java バックエンドが起動中の可能性）。先に停止してください。
> - `pnpm install` で `[ERR_PNPM_IGNORED_BUILDS]` → `pnpm-workspace.yaml` の `allowBuilds` がすべて `true` であることを確認し（リポジトリに設定済み）、再インストールしてください。

### ステップ 3：フロントエンドの起動（4 つから 1 つ選択）

| アプリ | UI フレームワーク | 開発ポート | 起動コマンド |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. フロントエンドの依存関係をインストール**（初回。4 アプリを一括インストール。数百 MB のダウンロードが発生します）：

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. 選択したアプリを起動**（Ant Design Vue 版の例）：

```bash
pnpm dev:antd        # pnpm --filter @vben/web-antd dev と同等
```

**F-3. 起動確認**（初回起動は依存関係のウォームアップのため 20〜40 秒ほどかかります）：

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. ブラウザーでアクセスしてログイン**：`http://localhost:5666` を開くとログインページにリダイレクトされます。スライダー認証を完了し、デモアカウントでログインします（ステップ 4 参照）。

**F-5. 別の UI に切り替え（任意）**：現在のフロントエンドを停止し、起動コマンドを差し替えるだけです（ポートは上の表を参照）：

```bash
pnpm dev:ele           # Element Plus 版 → http://localhost:5777
pnpm dev:naive         # Naive UI 版 → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next 版 → http://localhost:6001
```

> - **フロントエンドとバックエンドの接続は自動設定済み**：各アプリの `vite.config.ts` にはプロキシ `/api/**` → `http://localhost:8080/api/**` が設定されています。バックエンドがデフォルトの 8080 で動作していれば、フロントエンド側の設定は不要です。ポートを変更する場合は `apps/<アプリ>/vite.config.ts` の `proxy.target` を更新してください。
> - **よくある失敗**：`pnpm install` が進まない → ミラーを設定（`pnpm config set registry https://registry.npmmirror.com`）して再試行。API が 500/404 を返す → バックエンドが停止しているかポートが不一致。ポートが使用中 → `apps/<アプリ>/.env.development` の `VITE_PORT` を変更して再起動。

### ステップ 4：ログイン

デモアカウント（パスワードはすべて `123456`）：

| アカウント | ロール | ログイン後のページ | 権限範囲 |
| --- | --- | --- | --- |
| **vben** | super スーパー管理者 | /analytics 分析ページ | すべてのメニューとボタン権限 |
| **admin** | admin 管理者 | /workspace ワークスペース | システム管理 / 監視 / ツール |
| **jack** | user 一般ユーザー | /analytics 分析ページ | ユーザー管理（読み取り専用）とロール管理のみ。権限外アクセスは 403/404 |

ログインに成功し、分析ページ / ワークスペースに遷移すれば**デプロイ完了**です。

> 電話番号ログイン / QR コード / 新規登録 / OAuth の各入口はバックエンドのスイッチで制御され（ステップ 2 の設定表参照）、有効化するとログインページに自動表示されます。モックモードでは確認コードが API レスポンスにそのまま含まれます。

## 本番デプロイ

### フロントエンドのビルド

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # pnpm --filter @vben/web-antd build と同等。出力：apps/web-antd/dist
```

その他の UI：`pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`。

**Nginx 設定例**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # dist ディレクトリを指定
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA フォールバック
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # バックエンドは /api プレフィックス込みのため書き換え不要
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # 添付ファイル
    }
}
```

### バックエンドのビルド

```bash
# Java（実行中のプロセスを先に停止しないと jar がロックされパッケージングに失敗します）
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### 本番セキュリティチェックリスト

- [ ] データベースのデフォルトパスワード `123456` を変更し、デモアカウントを無効化またはパスワード変更
- [ ] Node の `.env` にある `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` を変更
- [ ] SMS / メールのモックを無効化（Java：`vben.auth.sms-mock=false`；Node：`.env` の同名項目を `false`）し、実際のサービスを接続
- [ ] knife4j / Swagger ドキュメントを無効化（Java：`springdoc.api-docs.enabled=false`）
- [ ] ログイン方式を必要最小限に（新規登録と電話番号 / OAuth の自動登録を無効化）
- [ ] HTTPS 環境ではセキュア Cookie を有効化（Java：`vben.auth.cookie-secure=true`；Node：`COOKIE_SECURE=true`）

## システムの仕組み

**権限モデル**：RBAC（ユーザー → ロール → メニュー / ボタン）。フロントエンドとバックエンドで同一の権限コードを共有します。

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → フロントエンドのルート / サイドメニュー
                                                              └─ type=button → auth_code（ボタン単位の権限コード）
```

- **メニュー権限**：バックエンドがユーザーのロールに応じてルートツリーを動的に返します（`GET /menu/all`）。権限のないルートはフロントエンドに登録されません（直接アクセスすると 404）。
- **ボタン権限**：`auth_code`（例：`AC_100010` はユーザー作成）は、フロントエンドでは `v-access` ディレクティブ / `hasAccessByCodes` でボタンの表示を制御し、バックエンドでは `@SaCheckPermission`（Java）/ `@Permissions` + `PermissionGuard`（Node）で API を検証します。
- **スーパー管理者**：`code=super` のロールはすべての権限を持ちます。

**認証**：ログイン時にデュアルトークンを発行します —— accessToken（2 時間、localStorage に保存、`Authorization: Bearer <token>` で送信）+ refreshToken（7 日間、HttpOnly Cookie で XSS 対策）。accessToken の期限切れ時はフロントエンドが `POST /auth/refresh` を自動呼び出ししてサイレント更新します。ログアウト / 強制ログアウトで両方のトークンが失効します。

## API ドキュメント

| バックエンド | URL |
| --- | --- |
| Java（knife4j） | <http://localhost:8080/api/doc.html> |
| Node（Swagger） | <http://localhost:8080/api/docs> |

ライブデバッグ：まず `POST /auth/login` で accessToken を取得し、ドキュメントページの Authorize に `Bearer <accessToken>` を入力します。完全な API 契約は [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md) にあります。

## よくある質問（FAQ）

**Q1：すべてのリクエストが失敗する / ログインが反応しない**
順に確認してください：① バックエンドが 8080 で動作しているか（`curl http://localhost:8080/api/auth/config` が JSON を返すか）。② `init.sql` をインポート済みか。③ データベースの認証情報が正しいか（バックエンドの起動ログを確認）。④ 古いプロセスが残っていないか。

**Q2：ポート 8080 が使用中 / バックエンドを切り替えるには？**
Java と Node は 8080 を共用するため同時起動できません。切り替えは、一方を停止して他方を起動し、フロントエンドを再読み込みしてログインし直すだけです（データベースは共用のため移行不要）。並行して比較する場合は、Node の `.env` の `PORT`（例：8081）を変更し、フロントエンドの `vite.config.ts` の `proxy.target` も合わせて更新します。

**Q3：ログインページに電話番号ログイン / 新規登録 / OAuth の入口が表示されない**
ログイン方式はバックエンドのスイッチで制御され、`GET /auth/config` で配信されます。Java は `application.yml` の `vben.auth.login-methods.*`、Node は `.env` の `LOGIN_METHODS_*` で有効化します。

**Q4：確認コードが届かない**
開発環境では SMS / メールのモックがデフォルトで有効になっており、確認コードは API レスポンスにそのまま含まれます。本番では実際のサービスを接続し、モックを無効化してください。

**Q5：添付ファイルのアップロードがサイズエラーになる**
バックエンドは 1 ファイルあたり 5MB 以下に制限しています（Java の multipart 上限は 10MB、業務チェックは 5MB）。Nginx 配下では `client_max_body_size 10m;` も設定してください。

**Q6：スケジュールジョブの「1 回実行」で Bean / メソッドが見つからない**
呼び出しターゲットの形式は `beanName.methodName`（例：`sampleJob.run`）で、参照先の Bean がバックエンドのコードに存在する必要があります（Java：`@Component("xxx")`、Node：登録済みのジョブメソッド）。

## ライセンス

[MIT](../LICENSE)
