<div align="center">

# Vben Admin 관리 시스템

**Vue 3 + Vben Admin 5.7로 구축한 프런트엔드·백엔드 분리형 엔터프라이즈 관리 시스템**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#라이선스)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | **한국어** | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## 프로젝트 소개

- **프런트엔드**: Vben Admin 5.7 monorepo 기반으로 **4종의 UI 앱**을 내장하고 있으며, 비즈니스 코드는 모두 동일하므로 원하는 하나를 골라 실행하면 됩니다.
- **백엔드**: Java(Spring Boot 4.1)와 Node.js(NestJS 12) 두 가지 구현을 제공합니다. 동일한 MySQL 데이터베이스와 동일한 API 계약([`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md))을 공유하며 기능은 완전히 동일합니다. 둘 중 하나를 골라 실행합니다.
- 모든 API는 `/api`를 전역 접두사로 사용하며, 프런트엔드 개발 서버에 프록시가 미리 설정되어 있어 **별도 연동 설정이 필요 없습니다**.
- 내장 모듈: 로그인 인증, 사용자/역할/부서/메뉴, 데이터 사전, 파라미터 설정, 예약 작업, 공지 및 메시지 센터, 첨부 파일, 워크플로, 작업/로그인/감사 로그, 온라인 사용자 및 시스템 모니터링, 프로필.

| 영역(하나 선택) | 선택지 | 포트 |
| --- | --- | --- |
| 백엔드 | Java Spring Boot 4.1 / Node NestJS 12 | 모두 `localhost:8080` |
| 프런트엔드 | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## 디렉터리 구조

```
vben/
├── vben-admin-backend/              # 백엔드
│   ├── docs/api-contract.md         # API 계약(두 구현의 공통 기준)
│   ├── java-backend/                # Java 구현(Spring Boot)
│   ├── node-backend/                # Node 구현(NestJS + Prisma)
│   └── sql/init.sql                 # DB 생성 + 20개 테이블 + 데모 데이터(일괄 가져오기)
└── vue-vben-admin-v5.7.0/           # 프런트엔드 monorepo(pnpm workspace)
    ├── apps/                        # 4개 UI 앱: web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # 공유 패키지(UI 컴포넌트, hooks, 환경 설정 등)
    ├── internal/                    # 빌드 및 Lint 설정
    └── scripts/                     # 스크립트 도구
```

## 기술 스택 및 환경 요구 사항

| 영역 | 기술 |
| --- | --- |
| 프런트엔드 | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| 프런트엔드 UI(4개 중 1개) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 백엔드 | Spring Boot 4.1(JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node 백엔드 | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| 데이터베이스 | MySQL 8.x(utf8mb4) |

| 도구 | 버전 요구 사항 | 용도 |
| --- | --- | --- |
| Node.js | ≥ 22.18(24 LTS 권장) | 프런트엔드 + Node 백엔드 |
| pnpm | ≥ 10(`npm i -g pnpm`) | 프런트엔드 + Node 백엔드 |
| MySQL | 8.x | 두 백엔드 공용 |
| JDK | 25 | Java 백엔드 전용 |
| Maven | 3.9+ | Java 백엔드 전용 |

설치 후 아래 자가 점검을 실행하여 버전이 요구 사항을 충족하는지 확인하세요.

```bash
node -v && pnpm -v && mysql --version    # 프런트엔드 + Node 백엔드
java -version && mvn -v                  # Java 백엔드
```

## 빠른 시작

### 1단계: 데이터베이스 초기화

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) 파일 하나로 **데이터베이스 생성(`vben_admin`) → 20개 테이블 생성 → 데모 데이터 입력**이 완료되며, 두 백엔드가 공용합니다.

**1.1 MySQL 서비스 실행 확인**

```bash
Get-Service MySQL*            # Windows(관리자 PowerShell), Status가 Running이면 정상
mysqladmin -uroot -p status   # macOS / Linux, Uptime이 출력되면 정상
```

**1.2 가져오기 실행**

**저장소 루트 디렉터리**에서 실행합니다(권장):

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

다른 방법:

```sql
-- MySQL 대화형 셸(mysql -uroot -p 진입 후 실행, Windows 경로는 슬래시 사용)
SOURCE C:/your/path/vben-admin-backend/sql/init.sql;
```

또는 Navicat / DBeaver / DataGrip 같은 GUI 도구에서 `init.sql`을 열고 전체를 실행합니다.
(PowerShell은 `<`를 지원하지 않으므로 위 두 방법 중 하나를 사용하세요.)

**1.3 가져오기 결과 확인**

```sql
USE vben_admin;
SHOW TABLES;                          -- 약 20개 테이블(sys_user, sys_menu, sys_role 등)
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

세 SQL이 모두 기대대로 나오면 초기화가 완료된 것입니다.

> - 스크립트에 `CREATE DATABASE IF NOT EXISTS`와 `USE vben_admin`이 포함되어 있어 항상 `vben_admin`에 가져옵니다.
> - 테이블 생성은 `IF NOT EXISTS`로 재실행해도 안전하지만, 데모 데이터를 다시 입력하면 기본 키 충돌로 중단됩니다. **전체 가져오기는 최초 한 번만 실행하세요**.
> - `Access denied`는 비밀번호 오류, `command not found`는 mysql이 `PATH`에 없음을 의미합니다. 전체 경로(예: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`)를 사용하세요.

### 2단계: 백엔드 시작(Java / Node 중 하나)

> 두 백엔드는 8080 포트를 공유하므로 **동시에 하나만 실행할 수 있습니다**. 데이터베이스는 공용이므로 전환 시 마이그레이션이 필요 없습니다.

#### 옵션 A: Java 백엔드(Spring Boot 4.1)

**A-1. 시작**(최초 실행 시 의존성 다운로드로 몇 분 걸릴 수 있습니다):

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. 시작 확인** — 아래 로그가 출력되면 성공입니다(터미널을 열어 둔 채로 유지하고, `Ctrl + C`로 중지):

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. 연결 확인** — 새 터미널에서 실행(JSON이 반환되면 정상):

```bash
curl http://localhost:8080/api/auth/config
# 예상: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**데이터베이스 연결**은 `src/main/resources/application-dev.yml`에 있으며 환경 변수로 재정의할 수 있습니다:

| 환경 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | 데이터베이스 호스트 / 포트 |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | 데이터베이스 계정 / 비밀번호 |

**기타 주요 설정**(`src/main/resources/application.yml`):

| 설정 항목 | 설명 |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | accessToken 유효 기간(초, 기본 7200) |
| `vben.auth.refresh-token-days` | refreshToken 유효 일수(기본 7) |
| `vben.auth.login-methods.*` | 로그인 방식 스위치(기본은 계정 로그인만 활성화) |
| `vben.auth.sms-mock` / `email-mock` | SMS/이메일 Mock(인증 코드를 응답에 포함, 운영에서는 비활성화) |
| `vben.auth.upload-dir` | 업로드 디렉터리(기본 `./uploads`) |
| `app.message.mail-enabled` | 메시지 센터 이메일 알림 스위치 |
| `app.tenant.enabled` | 멀티 테넌트 스위치 |

> **자주 발생하는 실패**:
> - 데이터베이스 로그의 `Connection refused` → MySQL이 중지되었거나 계정 정보가 일치하지 않음;
> - `Port 8080 was already in use` → 8080이 사용 중(Node 백엔드가 실행 중일 수 있음), 먼저 중지;
> - JDK 버전 관련 컴파일 오류 → `java -version`이 25인지, `JAVA_HOME`이 JDK 25를 가리키는지 확인.

#### 옵션 B: Node 백엔드(NestJS 12 + Fastify 5 + Prisma 7)

**B-1. 의존성 설치 및 환경 파일 준비**:

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env는 버전 관리 대상이 아님(.gitignore에서 제외). 최초에는 템플릿에서 복사해야 함
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. 데이터베이스 연결 확인**: `.env`를 열고 `DATABASE_URL`의 계정 정보가 1단계와 일치하는지 확인합니다(기본 `root/123456`).

**B-3. Prisma Client 생성**(최초 필수, 실행하지 않으면 시작 시 PrismaClient 초기화 오류 발생):

```bash
pnpm db:generate
# 예상 출력: ✔ Generated Prisma Client
```

**B-4. 백엔드 시작**:

```bash
pnpm dev              # 개발 모드(tsx watch 핫 리로드)
# 또는 pnpm build && pnpm start   # 컴파일된 결과물 실행
```

**B-5. 시작 확인** — 아래 로그가 출력되면 성공입니다(터미널을 열어 둔 채로 유지하고, `Ctrl + C`로 중지):

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. 연결 확인** — 새 터미널에서 실행(JSON이 반환되면 정상):

```bash
curl http://localhost:8080/api/auth/config
# 예상: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**`.env` 주요 설정**(템플릿: `.env.example`):

| 변수 | 기본값(템플릿) | 설명 |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | 데이터베이스 연결 문자열 |
| `PORT` | `8080` | 서버 포트(프런트엔드 프록시와 일치해야 함) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev용 임시 값 | JWT 서명 키, **운영에서는 반드시 교체** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | 토큰 유효 기간 |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | `ACCOUNT=true`만 | 로그인 방식 스위치, 로그인 페이지에 반영 |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | 최초 휴대폰/OAuth 로그인 시 자동 계정 생성(운영에서는 `false` 유지) |
| `UPLOAD_DIR` | `./uploads` | 업로드 디렉터리 |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | SMS/이메일 Mock(인증 코드 반환, 운영에서는 비활성화) |

기타 명령: `pnpm build`(`dist/`로 컴파일), `pnpm db:studio`(Prisma 시각적 데이터 브라우저).

> **자주 발생하는 실패**:
> - `Cannot find module '@prisma/client'` → `pnpm db:generate`를 실행하지 않음;
> - `Can't reach database server` → MySQL이 중지되었거나 `.env` 연결 문자열이 잘못됨;
> - `Port 8080 is already in use` → 8080이 사용 중(Java 백엔드가 실행 중일 수 있음), 먼저 중지;
> - `pnpm install`에서 `[ERR_PNPM_IGNORED_BUILDS]` → `pnpm-workspace.yaml`의 `allowBuilds`가 모두 `true`인지 확인(저장소에 미리 설정됨)한 뒤 다시 설치.

### 3단계: 프런트엔드 시작(4개 중 1개 선택)

| 앱 | UI 프레임워크 | 개발 포트 | 시작 명령 |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. 프런트엔드 의존성 설치**(최초 1회, 4개 앱을 한 번에 설치, 수백 MB 다운로드):

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. 선택한 앱 시작**(Ant Design Vue 버전 예시):

```bash
pnpm dev:antd        # pnpm --filter @vben/web-antd dev와 동일
```

**F-3. 시작 확인**(최초 시작 시 의존성 준비로 20~40초 소요):

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. 브라우저 접속 및 로그인**: `http://localhost:5666`을 열면 로그인 페이지로 리디렉션됩니다. 슬라이더 인증을 완료한 뒤 데모 계정으로 로그인합니다(4단계 참조).

**F-5. 다른 UI로 전환(선택)**: 현재 프런트엔드를 중지하고 시작 명령만 바꾸면 됩니다(포트는 위 표 참조):

```bash
pnpm dev:ele           # Element Plus 버전 → http://localhost:5777
pnpm dev:naive         # Naive UI 버전 → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next 버전 → http://localhost:6001
```

> - **프런트엔드·백엔드 연결은 자동 설정됨**: 각 앱의 `vite.config.ts`에 프록시 `/api/**` → `http://localhost:8080/api/**`가 설정되어 있습니다. 백엔드가 기본 8080에서 실행 중이면 프런트엔드 설정이 필요 없습니다. 포트를 바꾸려면 `apps/<앱>/vite.config.ts`의 `proxy.target`을 수정하세요.
> - **자주 발생하는 실패**: `pnpm install`이 멈춤 → 미러 설정(`pnpm config set registry https://registry.npmmirror.com`) 후 재시도; API가 500/404 반환 → 백엔드가 중지되었거나 포트 불일치; 포트 사용 중 → `apps/<앱>/.env.development`의 `VITE_PORT`를 변경 후 재시작.

### 4단계: 로그인

데모 계정(비밀번호는 모두 `123456`):

| 계정 | 역할 | 로그인 후 페이지 | 권한 범위 |
| --- | --- | --- | --- |
| **vben** | super 슈퍼 관리자 | /analytics 분석 페이지 | 모든 메뉴와 버튼 권한 |
| **admin** | admin 관리자 | /workspace 워크스페이스 | 시스템 관리 / 모니터링 / 도구 |
| **jack** | user 일반 사용자 | /analytics 분석 페이지 | 사용자 관리(읽기 전용)와 역할 관리만, 권한 외 접근은 403/404 |

로그인에 성공하여 분석 페이지 / 워크스페이스로 이동하면 **배포가 완료**된 것입니다.

> 휴대폰 인증 / QR 코드 / 회원가입 / OAuth 로그인 항목은 백엔드 스위치로 제어되며(2단계 설정 표 참조), 활성화하면 로그인 페이지에 자동으로 표시됩니다. Mock 모드에서는 인증 코드가 API 응답에 그대로 포함됩니다.

## 운영 배포

### 프런트엔드 빌드

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # pnpm --filter @vben/web-antd build와 동일, 결과물: apps/web-antd/dist
```

기타 UI: `pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`.

**Nginx 설정 예시**:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # dist 디렉터리 지정
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA 폴백
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # 백엔드에 /api 접두사가 포함되어 있어 재작성 불필요
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # 첨부 파일
    }
}
```

### 백엔드 빌드

```bash
# Java(실행 중인 프로세스를 먼저 중지하지 않으면 jar가 잠겨 패키징에 실패합니다)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### 운영 보안 체크리스트

- [ ] 데이터베이스 기본 비밀번호 `123456` 변경, 데모 계정 비활성화 또는 비밀번호 변경
- [ ] Node `.env`의 `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` 교체
- [ ] SMS/이메일 Mock 비활성화(Java: `vben.auth.sms-mock=false`; Node: `.env`의 동일 항목을 `false`) 후 실제 서비스 연동
- [ ] knife4j / Swagger 문서 비활성화(Java: `springdoc.api-docs.enabled=false`)
- [ ] 로그인 방식 최소화(회원가입 및 휴대폰/OAuth 자동 가입 비활성화)
- [ ] HTTPS 환경에서 보안 쿠키 활성화(Java: `vben.auth.cookie-secure=true`; Node: `COOKIE_SECURE=true`)

## 시스템 설명

**권한 모델**: RBAC(사용자 → 역할 → 메뉴/버튼)이며, 프런트엔드와 백엔드가 동일한 권한 코드를 공유합니다.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 프런트엔드 라우트 / 사이드 메뉴
                                                              └─ type=button → auth_code(버튼 단위 권한 코드)
```

- **메뉴 권한**: 백엔드가 사용자 역할에 따라 라우트 트리를 동적으로 반환합니다(`GET /menu/all`). 권한 없는 라우트는 프런트엔드에 등록되지 않습니다(직접 접근 시 404).
- **버튼 권한**: `auth_code`(예: `AC_100010`은 사용자 생성)를 프런트엔드에서는 `v-access` 디렉티브 / `hasAccessByCodes`로 버튼 표시를 제어하고, 백엔드에서는 `@SaCheckPermission`(Java) / `@Permissions` + `PermissionGuard`(Node)로 API를 검증합니다.
- **슈퍼 관리자**: `code=super` 역할은 모든 권한을 가집니다.

**인증**: 로그인 시 이중 토큰을 발급합니다 — accessToken(2시간, localStorage 저장, `Authorization: Bearer <token>`으로 전송) + refreshToken(7일, HttpOnly Cookie, XSS 방지). accessToken이 만료되면 프런트엔드가 `POST /auth/refresh`를 자동 호출하여 무중단 갱신합니다. 로그아웃 / 강제 로그아웃 시 두 토큰이 모두 폐기됩니다.

## API 문서

| 백엔드 | URL |
| --- | --- |
| Java(knife4j) | <http://localhost:8080/api/doc.html> |
| Node(Swagger) | <http://localhost:8080/api/docs> |

실시간 디버깅: 먼저 `POST /auth/login`으로 accessToken을 받은 뒤 문서 페이지의 Authorize에 `Bearer <accessToken>`을 입력합니다. 전체 API 계약은 [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)에 있습니다.

## 자주 묻는 질문(FAQ)

**Q1: 모든 요청이 실패하거나 로그인이 반응하지 않습니다.**
순서대로 확인하세요: ① 백엔드가 8080에서 실행 중인지(`curl http://localhost:8080/api/auth/config`가 JSON 반환); ② `init.sql`을 가져왔는지; ③ 데이터베이스 계정 정보가 올바른지(백엔드 시작 로그 확인); ④ 이전 프로세스가 남아 있지 않은지.

**Q2: 8080 포트가 사용 중이거나 백엔드를 전환하려면?**
Java와 Node는 8080을 공유하므로 동시에 실행할 수 없습니다. 전환은 하나를 중지하고 다른 하나를 시작한 뒤 프런트엔드를 새로고침하여 다시 로그인하면 됩니다(데이터베이스 공용, 마이그레이션 불필요). 병행 비교가 필요하면 Node `.env`의 `PORT`(예: 8081)를 변경하고 프런트엔드 `vite.config.ts`의 `proxy.target`도 함께 수정하세요.

**Q3: 로그인 페이지에 휴대폰 로그인 / 회원가입 / OAuth 항목이 보이지 않습니다.**
로그인 방식은 백엔드 스위치로 제어되며 `GET /auth/config`로 전달됩니다. Java는 `application.yml`의 `vben.auth.login-methods.*`, Node는 `.env`의 `LOGIN_METHODS_*`에서 활성화합니다.

**Q4: 인증 코드를 받지 못합니다.**
개발 환경에서는 SMS/이메일 Mock이 기본으로 활성화되어 인증 코드가 API 응답에 그대로 포함됩니다. 운영에서는 실제 서비스를 연동하고 Mock을 비활성화하세요.

**Q5: 첨부 파일 업로드 시 용량 오류가 발생합니다.**
백엔드는 파일당 5MB 이하로 제한합니다(Java multipart 상한 10MB, 비즈니스 검증 5MB). Nginx 배포 시 `client_max_body_size 10m;`도 설정하세요.

**Q6: 예약 작업의 "1회 실행"에서 Bean/메서드를 찾을 수 없다고 합니다.**
호출 대상 형식은 `beanName.methodName`(예: `sampleJob.run`)이며, 해당 구현이 백엔드 코드에 존재해야 합니다(Java: `@Component("xxx")`; Node: 등록된 작업 메서드).

## 라이선스

[MIT](../LICENSE)
