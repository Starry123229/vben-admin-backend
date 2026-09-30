<div align="center">

# Vben Admin — Система администрирования

**Корпоративная система администрирования с разделёнными фронтендом и бэкендом на базе Vue 3 + Vben Admin 5.7**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#лицензия)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | [Español](./README.es.md) | **Русский**

</div>

---

## Введение

- **Фронтенд**: на базе монорепозитория Vben Admin 5.7, включает **4 UI-приложения**; бизнес-код одинаков — выберите одно;
- **Бэкенд**: две полностью эквивалентные реализации — Java (Spring Boot 4.1) и Node.js (NestJS 12) — используют одну и ту же базу данных MySQL и один и тот же контракт API ([`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)). Выберите одну;
- Все эндпоинты используют глобальный префикс `/api`, а dev-сервер фронтенда поставляется с преднастроенным прокси — **никакой настройки для локальной разработки**;
- Встроенные модули: аутентификация, пользователи / роли / подразделения / меню, словарь данных, управление параметрами, запланированные задачи, объявления и центр сообщений, вложения, рабочие процессы, журналы операций / входов / аудита, онлайн-пользователи и мониторинг системы, профиль.

| Сторона (выберите одно) | Варианты | Порт |
| --- | --- | --- |
| Бэкенд | Java Spring Boot 4.1 / Node NestJS 12 | оба на `localhost:8080` |
| Фронтенд | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## Структура проекта

```
vben/
├── vben-admin-backend/              # Бэкенд
│   ├── docs/api-contract.md         # Контракт API (общий для обеих реализаций)
│   ├── java-backend/                # Реализация на Java (Spring Boot)
│   ├── node-backend/                # Реализация на Node (NestJS + Prisma)
│   └── sql/init.sql                 # База + 20 таблиц + демо-данные (один импорт)
└── vue-vben-admin-v5.7.0/           # Монорепозиторий фронтенда (pnpm workspace)
    ├── apps/                        # 4 UI-приложения: web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # Общие пакеты (UI, hooks, настройки...)
    ├── internal/                    # Конфигурация сборки и линтера
    └── scripts/                     # Служебные скрипты
```

## Технологический стек и требования

| Сторона | Технологии |
| --- | --- |
| Фронтенд | Vue 3.5 · Vite 8 · TypeScript · Pinia · монорепозиторий pnpm |
| UI фронтенда (1 из 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Бэкенд Java | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Бэкенд Node | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| База данных | MySQL 8.x (utf8mb4) |

| Инструмент | Версия | Требуется для |
| --- | --- | --- |
| Node.js | ≥ 22.18 (рекомендуется 24 LTS) | Фронтенд + бэкенд Node |
| pnpm | ≥ 10 (`npm i -g pnpm`) | Фронтенд + бэкенд Node |
| MySQL | 8.x | Оба бэкенда |
| JDK | 25 | Только бэкенд Java |
| Maven | 3.9+ | Только бэкенд Java |

После установки выполните самопроверку и убедитесь, что версии соответствуют требованиям:

```bash
node -v && pnpm -v && mysql --version    # фронтенд + бэкенд Node
java -version && mvn -v                  # бэкенд Java
```

## Быстрый старт

### Шаг 1: инициализация базы данных

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) одним файлом создаёт базу данных (`vben_admin`), все 20 таблиц и демо-данные — общий для обоих бэкендов.

**1.1 Убедитесь, что MySQL запущен**

```bash
Get-Service MySQL*            # Windows (PowerShell от администратора) — Status должен быть Running
mysqladmin -uroot -p status   # macOS / Linux — вывод Uptime означает, что всё в порядке
```

**1.2 Выполните импорт**

Из **корня репозитория** (рекомендуется):

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

Альтернативы:

```sql
-- Интерактивная оболочка MySQL (после `mysql -uroot -p`; в Windows используйте прямые слэши)
SOURCE C:/ваш/путь/vben-admin-backend/sql/init.sql;
```

Либо откройте `init.sql` в графическом инструменте (Navicat / DBeaver / DataGrip) и выполните его целиком.
(PowerShell не поддерживает `<` — используйте один из этих двух способов.)

**1.3 Проверьте импорт**

```sql
USE vben_admin;
SHOW TABLES;                          -- ~20 таблиц (sys_user, sys_menu, sys_role, ...)
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

Если все три запроса совпадают с ожидаемым, база данных готова.

> - Скрипт содержит `CREATE DATABASE IF NOT EXISTS` и `USE vben_admin`, поэтому импорт всегда направляется в `vben_admin`;
> - Создание таблиц идемпотентно, но повторная вставка демо-данных прерывается конфликтами первичных ключей — **выполняйте полный импорт только один раз**;
> - `Access denied` означает неверный пароль; `command not found` — что mysql не в `PATH`; используйте полный путь (например, `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`).

### Шаг 2: запуск бэкенда (Java / Node, выберите одно)

> Оба бэкенда используют порт 8080 — **одновременно может работать только один**. База данных общая, переключение не требует миграции.

#### Вариант A: бэкенд Java (Spring Boot 4.1)

**A-1. Запуск** (при первом запуске загружаются зависимости, это может занять несколько минут):

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. Подтвердите запуск** — успешный старт выглядит так (оставьте терминал открытым; `Ctrl + C` для остановки):

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. Проверьте доступность** — в новом терминале (вывод JSON означает, что всё в порядке):

```bash
curl http://localhost:8080/api/auth/config
# ожидается: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Подключение к базе данных** находится в `src/main/resources/application-dev.yml` и может быть переопределено переменными окружения:

| Переменная | Значение по умолчанию | Описание |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Хост / порт базы данных |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | Пользователь / пароль базы данных |

**Другие ключевые настройки** (`src/main/resources/application.yml`):

| Ключ | Описание |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | Время жизни accessToken (секунды, по умолчанию 7200) |
| `vben.auth.refresh-token-days` | Время жизни refreshToken в днях (по умолчанию 7) |
| `vben.auth.login-methods.*` | Переключатели способов входа (по умолчанию только вход по логину) |
| `vben.auth.sms-mock` / `email-mock` | Мок SMS/почты (коды в ответах; отключите в продакшене) |
| `vben.auth.upload-dir` | Каталог загрузок (по умолчанию `./uploads`) |
| `app.message.mail-enabled` | Уведомления по почте в центре сообщений |
| `app.tenant.enabled` | Переключатель мультитенантности |

> **Частые ошибки**:
> - `Connection refused` рядом с логами базы данных → MySQL остановлен или учётные данные не совпадают;
> - `Port 8080 was already in use` → порт 8080 занят (возможно, бэкендом Node) — сначала остановите его;
> - Ошибки компиляции, связанные с версией JDK → убедитесь, что `java -version` — 25, а `JAVA_HOME` указывает на JDK 25.

#### Вариант B: бэкенд Node (NestJS 12 + Fastify 5 + Prisma 7)

**B-1. Установите зависимости и подготовьте файл окружения**:

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env не версионируется (исключён в .gitignore) — при первом запуске создайте его из шаблона
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. Проверьте подключение к базе**: откройте `.env` и убедитесь, что `DATABASE_URL` совпадает с учётными данными из шага 1 (по умолчанию `root/123456`).

**B-3. Сгенерируйте Prisma Client** (обязательно при первом запуске, иначе старт завершится ошибкой):

```bash
pnpm db:generate
# ожидаемый вывод: ✔ Generated Prisma Client
```

**B-4. Запустите бэкенд**:

```bash
pnpm dev              # режим разработки (горячая перезагрузка tsx watch)
# или pnpm build && pnpm start   # запуск скомпилированного вывода
```

**B-5. Подтвердите запуск** — успешный старт выглядит так (оставьте терминал открытым; `Ctrl + C` для остановки):

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. Проверьте доступность** — в новом терминале (вывод JSON означает, что всё в порядке):

```bash
curl http://localhost:8080/api/auth/config
# ожидается: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Ключевые настройки `.env`** (шаблон: `.env.example`):

| Переменная | Значение по умолчанию (шаблон) | Описание |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | URL базы данных |
| `PORT` | `8080` | Порт сервера (должен совпадать с прокси фронтенда) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | значения для разработки | Секреты подписи JWT, **обязательно замените в продакшене** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Время жизни токенов |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | только `ACCOUNT=true` | Переключатели способов входа; страница входа подстраивается |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | Автосоздание аккаунта при первом входе по телефону/OAuth (в продакшене оставьте `false`) |
| `UPLOAD_DIR` | `./uploads` | Каталог загрузок |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | Мок SMS/почты (коды в ответах; отключите в продакшене) |

Другие команды: `pnpm build` (сборка в `dist/`), `pnpm db:studio` (визуальный браузер данных Prisma).

> **Частые ошибки**:
> - `Cannot find module '@prisma/client'` → пропущен `pnpm db:generate`;
> - `Can't reach database server` → MySQL остановлен или `.env` неверен;
> - `Port 8080 is already in use` → порт 8080 занят (возможно, бэкендом Java) — сначала остановите его;
> - `[ERR_PNPM_IGNORED_BUILDS]` при `pnpm install` → убедитесь, что все записи `allowBuilds` в `pnpm-workspace.yaml` равны `true` (уже настроено в репозитории), и переустановите.

### Шаг 3: запуск фронтенда (1 из 4 UI-приложений)

| Приложение | UI-фреймворк | Порт разработки | Команда запуска |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. Установите зависимости фронтенда** (в первый раз; устанавливает все 4 приложения сразу, сотни МБ загрузки):

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. Запустите выбранное приложение** (например, версию с Ant Design Vue):

```bash
pnpm dev:antd        # эквивалентно pnpm --filter @vben/web-antd dev
```

**F-3. Подтвердите запуск** (при первом запуске прогреваются зависимости; ~20–40 секунд):

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. Откройте браузер и войдите**: перейдите на `http://localhost:5666`; вас перенаправит на страницу входа — пройдите слайдер-капчу и используйте демо-аккаунт (см. шаг 4).

**F-5. Переключение на другой UI (необязательно)**: остановите текущее приложение и замените команду запуска (порты в таблице выше):

```bash
pnpm dev:ele           # Element Plus → http://localhost:5777
pnpm dev:naive         # Naive UI → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next → http://localhost:6001
```

> - **Связь фронтенда и бэкенда настроена автоматически**: `vite.config.ts` каждого приложения содержит прокси `/api/**` → `http://localhost:8080/api/**`. Если бэкенд работает на стандартном порту 8080, настройка фронтенда не требуется; для другого порта измените `proxy.target` в `apps/<ваше-приложение>/vite.config.ts`;
> - **Частые ошибки**: `pnpm install` зависает → используйте зеркало (`pnpm config set registry https://registry.npmmirror.com`) и повторите; API возвращает 500/404 → бэкенд остановлен или порт не совпадает; порт занят → измените `VITE_PORT` в `apps/<ваше-приложение>/.env.development` и перезапустите.

### Шаг 4: вход в систему

Демо-аккаунты (пароль у всех — `123456`):

| Аккаунт | Роль | Стартовая страница | Область доступа |
| --- | --- | --- | --- |
| **vben** | супер-администратор | /analytics | все меню и права на кнопки |
| **admin** | администратор | /workspace | управление системой / мониторинг / инструменты |
| **jack** | пользователь | /analytics | управление пользователями (только чтение) + управление ролями; несанкционированный доступ → 403/404 |

Если вы попали на страницу analytics/workspace, **развёртывание завершено**.

> Вход по телефону / QR-коду / регистрация / OAuth управляются переключателями бэкенда (см. таблицы шага 2) и автоматически появляются на странице входа при включении. В режиме мока коды подтверждения возвращаются прямо в ответах API.

## Развёртывание в продакшене

### Сборка фронтенда

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # эквивалентно pnpm --filter @vben/web-antd build; вывод: apps/web-antd/dist
```

Другие UI: `pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`.

**Пример конфигурации Nginx**:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # укажите каталог dist
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # fallback для SPA
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # бэкенд уже включает префикс /api
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # вложения
    }
}
```

### Сборка бэкенда

```bash
# Java (сначала остановите запущенный процесс, иначе jar будет заблокирован)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Чек-лист безопасности для продакшена

- [ ] Смените пароль базы данных по умолчанию `123456`; отключите или смените пароли демо-аккаунтов
- [ ] Замените `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` в `.env` Node
- [ ] Отключите мок SMS/почты (Java: `vben.auth.sms-mock=false`; Node: те же ключи в `.env`) и подключите реальные сервисы
- [ ] Отключите документацию knife4j / Swagger (Java: `springdoc.api-docs.enabled=false`)
- [ ] Ограничьте способы входа (отключите регистрацию и автосоздание по телефону/OAuth)
- [ ] Включите secure cookies при HTTPS (Java: `vben.auth.cookie-secure=true`; Node: `COOKIE_SECURE=true`)

## Как это устроено

**Модель прав**: RBAC (пользователь → роль → меню/кнопка) с общим набором кодов разрешений на обеих сторонах.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → маршруты фронтенда / боковое меню
                                                              └─ type=button → auth_code (коды кнопок)
```

- **Права на меню**: бэкенд возвращает дерево маршрутов для пользователя (`GET /menu/all`); неавторизованные маршруты не регистрируются на фронтенде (прямой доступ → 404);
- **Права на кнопки**: `auth_code` (например, `AC_100010` = создание пользователя) управляет видимостью кнопок через директиву `v-access` / `hasAccessByCodes` на фронтенде и проверяется через `@SaCheckPermission` (Java) / `@Permissions` + `PermissionGuard` (Node) на бэкенде;
- **Супер-администратор**: роль с `code=super` обладает всеми правами.

**Аутентификация**: при входе выдаются два токена — accessToken (2 ч, localStorage, передаётся как `Authorization: Bearer <token>`) + refreshToken (7 дней, HttpOnly cookie, защита от XSS). Когда accessToken истекает, фронтенд незаметно вызывает `POST /auth/refresh`; выход / принудительный выход отзывает оба токена.

## Документация API

| Бэкенд | URL |
| --- | --- |
| Java (knife4j) | <http://localhost:8080/api/doc.html> |
| Node (Swagger) | <http://localhost:8080/api/docs> |

Для отладки в реальном времени: вызовите `POST /auth/login`, получите accessToken и вставьте `Bearer <accessToken>` в диалог Authorize. Полный контракт API находится в [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## Частые вопросы (FAQ)

**В1: Все запросы падают / вход не отвечает?**
Проверьте по порядку: ① работает ли бэкенд на 8080 (`curl http://localhost:8080/api/auth/config` должен вернуть JSON); ② импортирован ли `init.sql`; ③ верны ли учётные данные базы (см. лог запуска бэкенда); ④ не остались ли старые процессы?

**В2: Порт 8080 занят / как переключить бэкенд?**
Java и Node используют 8080 — они не могут работать одновременно. Для переключения остановите один и запустите другой, затем обновите фронтенд и войдите снова (база общая, миграция не нужна). Для параллельного сравнения: измените `PORT` в `.env` Node (например, 8081) и обновите `proxy.target` в `vite.config.ts` фронтенда.

**В3: На странице входа нет входа по телефону / регистрации / OAuth?**
Способы входа управляются переключателями бэкенда и передаются через `GET /auth/config`: включите их в `vben.auth.login-methods.*` (Java `application.yml`) или `LOGIN_METHODS_*` (Node `.env`).

**В4: Не приходят коды подтверждения?**
В окружении разработки по умолчанию включён мок SMS/почты — коды возвращаются прямо в ответах API. Для продакшена подключите реальные сервисы и отключите мок.

**В5: Загрузка вложения завершается ошибкой размера?**
Бэкенд ограничивает размер файла ≤ 5 МБ (лимит multipart в Java — 10 МБ с бизнес-проверкой 5 МБ). За Nginx также задайте `client_max_body_size 10m;`.

**В6: «Выполнить один раз» у запланированной задачи сообщает об отсутствующем bean/методе?**
Формат цели вызова — `beanName.methodName` (например, `sampleJob.run`), и указанный bean должен существовать в коде бэкенда (Java: `@Component("xxx")`; Node: зарегистрированный метод задачи).

## Лицензия

[MIT](../LICENSE)
