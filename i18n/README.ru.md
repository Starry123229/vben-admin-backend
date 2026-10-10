<div align="center">

# Vben Admin — Система администрирования

<p>Открытый фреймворк для админ-панелей (Vue 3 Admin Template / Dashboard): полноценное решение на базе Vben Admin 5.7 — фронтенд Vue 3 + Vite, двойной бэкенд Java Spring Boot 4 / Node.js NestJS 12, RBAC, двойной JWT-токен, MySQL. Готов к запуску, лицензия MIT, бесплатно для коммерческого использования</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#лицензия)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | **Русский**

</div>

---

## Особенности

- 💪 4 UI-приложения фронтенда (Ant Design Vue / Element Plus / Naive UI / Ant Design Vue Next) с одинаковым бизнес-кодом — выберите одно
- 🚀 Два полностью эквивалентных бэкенда — Java (Spring Boot 4.1) и Node.js (NestJS 12) — выберите один
- 💅 Модель прав RBAC + двухтокенная аутентификация (accessToken + refreshToken)
- 🌍 Никакой настройки для локальной разработки — dev-сервер фронтенда поставляется с преднастроенным прокси `/api`
- 📦️ Встроенные модули: пользователи / роли / подразделения / меню, словарь данных, управление параметрами, запланированные задачи, объявления и центр сообщений, вложения, рабочие процессы, журналы операций / входов / аудита, онлайн-пользователи и мониторинг системы
- 🥳 Версия с открытым исходным кодом бесплатна для коммерческого использования

## Структура проекта

```
vben/
├── vben-admin-backend/              # Бэкенд
│   ├── docs/api-contract.md         # Контракт API (общий для обеих реализаций)
│   ├── java-backend/                # Реализация на Java (Spring Boot)
│   ├── node-backend/                # Реализация на Node (NestJS + Prisma)
│   └── sql/init.sql                 # База + 20 таблиц + демо-данные (один импорт)
└── vue-vben-admin-v5.7.0/           # Монорепозиторий фронтенда (pnpm workspace)
    ├── apps/                        # 4 UI-приложения
    ├── packages/                    # Общие пакеты
    └── internal/                    # Конфигурация сборки и линтера
```

## Технологический стек

| Сторона | Технологии |
| --- | --- |
| Фронтенд | Vue 3.5 · Vite 8 · TypeScript · Pinia · монорепозиторий pnpm |
| UI фронтенда (1 из 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Бэкенд Java | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Бэкенд Node | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| База данных | MySQL 9.x (utf8mb4) |

## Быстрый старт

### 1. Инициализация базы данных

```bash
# Убедитесь, что MySQL запущен, затем импортируйте
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` одним файлом создаёт базу данных (`vben_admin`), все 20 таблиц и демо-данные — общий для обоих бэкендов.

### 2. Запуск бэкенда (Java / Node, выберите одно)

```bash
# Вариант A: бэкенд Java
cd vben-admin-backend/java-backend
mvn spring-boot:run

# Вариант B: бэкенд Node
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> Оба бэкенда используют порт 8080 — одновременно может работать только один. Данные БД по умолчанию: `root/123456`. См. файлы конфигурации для изменения.

### 3. Запуск фронтенда (1 из 4 UI-приложений)

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. Вход в систему

Демо-аккаунты (пароль у всех — `123456`):

| Аккаунт | Роль | Область доступа |
| --- | --- | --- |
| **vben** | супер-администратор | все меню и права на кнопки |
| **admin** | администратор | управление системой / мониторинг / инструменты |
| **jack** | пользователь | управление пользователями (только чтение) + управление ролями |

## Развёртывание в продакшене

### Сборка фронтенда

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # вывод: apps/web-antd/dist
```

### Сборка бэкенда

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Пример конфигурации Nginx

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

## Как это устроено

**Модель прав**: RBAC (пользователь → роль → меню/кнопка) с общим набором кодов разрешений на обеих сторонах.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → маршруты фронтенда / боковое меню
                                                              └─ type=button → auth_code (коды кнопок)
```

**Поток аутентификации**:

```
Вход → выдача двух токенов
  ├─ accessToken (2 ч, localStorage, передаётся как Authorization: Bearer)
  └─ refreshToken (7 дней, HttpOnly cookie, защита от XSS)
      └─ accessToken истекает → фронтенд незаметно вызывает POST /auth/refresh
      └─ выход / принудительный выход → оба токена отзываются
```

**Права на меню и кнопки**:

- **Права на меню**: бэкенд возвращает дерево маршрутов для пользователя (`GET /menu/all`); неавторизованные маршруты не регистрируются на фронтенде.
- **Права на кнопки**: `auth_code` (например, `AC_100010`) управляет видимостью кнопок через директиву `v-access` и проверяется через `@SaCheckPermission` (Java) / `@Permissions` (Node) на бэкенде.
- **Супер-администратор**: роль с `code=super` обладает всеми правами.

## Документация API

| Бэкенд | URL |
| --- | --- |
| Java (knife4j) | http://localhost:8080/api/doc.html |
| Node (Swagger) | http://localhost:8080/api/docs |

Полный контракт API: [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## Лицензия

[MIT](../LICENSE)
