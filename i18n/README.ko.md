<div align="center">

# Vben Admin 관리 시스템

<p>Vue 3 + Vben Admin 5.7로 구축한 프런트엔드·백엔드 분리형 엔터프라이즈 관리 시스템</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#라이선스)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | **한국어** | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## 특징

- 💪 프런트엔드 4종 UI 앱（Ant Design Vue / Element Plus / Naive UI / Ant Design Vue Next）, 비즈니스 코드 동일, 원하는 하나 선택
- 🚀 백엔드 Java（Spring Boot 4.1）와 Node.js（NestJS 12）두 가지 구현, 기능 완전 동일, 둘 중 하나 선택
- 💅 RBAC 권한 모델 + 이중 토큰 인증（accessToken + refreshToken）
- 🌍 프런트엔드·백엔드 연동 설정 불필요, 개발 서버에 `/api` 프록시 미리 설정
- 📦️ 내장 모듈: 사용자/역할/부서/메뉴, 데이터 사전, 파라미터 설정, 예약 작업, 공지 및 메시지 센터, 첨부 파일, 워크플로, 작업/로그인/감사 로그, 온라인 사용자 및 시스템 모니터링
- 🥳 오픈소스 버전 상업적 이용 무료

## 디렉터리 구조

```
vben/
├── vben-admin-backend/              # 백엔드
│   ├── docs/api-contract.md         # API 계약(두 구현의 공통 기준)
│   ├── java-backend/                # Java 구현(Spring Boot)
│   ├── node-backend/                # Node 구현(NestJS + Prisma)
│   └── sql/init.sql                 # DB 생성 + 20개 테이블 + 데모 데이터(일괄 가져오기)
└── vue-vben-admin-v5.7.0/           # 프런트엔드 monorepo(pnpm workspace)
    ├── apps/                        # 4개 UI 앱
    ├── packages/                    # 공유 패키지
    └── internal/                    # 빌드 및 Lint 설정
```

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프런트엔드 | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm monorepo |
| 프런트엔드 UI(4개 중 1개) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java 백엔드 | Spring Boot 4.1(JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Node 백엔드 | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| 데이터베이스 | MySQL 9.x(utf8mb4) |

## 빠른 시작

### 1. 데이터베이스 초기화

```bash
# MySQL 실행 확인 후 일괄 가져오기
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` 파일 하나로 데이터베이스 생성(`vben_admin`) → 20개 테이블 생성 → 데모 데이터 입력이 완료됩니다. 두 백엔드 공용.

### 2. 백엔드 시작(Java / Node 중 하나)

```bash
# 옵션 A: Java 백엔드
cd vben-admin-backend/java-backend
mvn spring-boot:run

# 옵션 B: Node 백엔드
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> 두 백엔드는 8080 포트를 공유하므로 동시에 하나만 실행할 수 있습니다. 데이터베이스 기본값 `root/123456`. 변경 시 각 설정 파일을 참조하세요.

### 3. 프런트엔드 시작(4개 중 1개 선택)

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. 로그인

데모 계정(비밀번호는 모두 `123456`):

| 계정 | 역할 | 권한 범위 |
| --- | --- | --- |
| **vben** | 슈퍼 관리자 | 모든 메뉴와 버튼 권한 |
| **admin** | 관리자 | 시스템 관리 / 모니터링 / 도구 |
| **jack** | 일반 사용자 | 사용자 관리(읽기 전용)와 역할 관리 |

## 운영 배포

### 프런트엔드 빌드

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # 결과물: apps/web-antd/dist
```

### 백엔드 빌드

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Nginx 설정 예시

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

## 시스템 설명

**권한 모델**: RBAC(사용자 → 역할 → 메뉴/버튼). 프런트엔드와 백엔드가 동일한 권한 코드를 공유.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → 프런트엔드 라우트 / 사이드 메뉴
                                                              └─ type=button → auth_code(버튼 단위 권한 코드)
```

**인증 흐름**:

```
로그인 → 이중 토큰 발급
  ├─ accessToken(2h, localStorage, 요청 헤더 Authorization: Bearer)
  └─ refreshToken(7d, HttpOnly Cookie, XSS 방지)
      └─ accessToken 만료 → 프런트엔드가 자동으로 POST /auth/refresh 호출하여 무중단 갱신
      └─ 로그아웃 / 강제 로그아웃 → 두 토큰 모두 폐기
```

**메뉴 및 버튼 권한**:

- **메뉴 권한**: 백엔드가 역할에 따라 라우트 트리를 동적으로 반환합니다(`GET /menu/all`). 권한 없는 라우트는 프런트엔드에 등록되지 않습니다.
- **버튼 권한**: `auth_code`(예: `AC_100010`)는 프런트엔드에서 `v-access` 디렉티브로 표시를 제어하고, 백엔드에서 `@SaCheckPermission`(Java) / `@Permissions`(Node)로 API를 검증합니다.
- **슈퍼 관리자**: `code=super` 역할은 모든 권한을 가집니다.

## API 문서

| 백엔드 | URL |
| --- | --- |
| Java(knife4j) | http://localhost:8080/api/doc.html |
| Node(Swagger) | http://localhost:8080/api/docs |

전체 API 계약은 [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)에 있습니다.

## 라이선스

[MIT](../LICENSE)
