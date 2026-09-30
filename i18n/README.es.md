<div align="center">

# Vben Admin — Sistema de administración

**Sistema de administración empresarial con front-end / back-end desacoplados, construido con Vue 3 + Vben Admin 5.7**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#licencia)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | **Español** | [Русский](./README.ru.md)

</div>

---

## Introducción

- **Front-end**: basado en el monorepo Vben Admin 5.7 con **4 aplicaciones de UI**; el código de negocio es idéntico — elija una;
- **Back-end**: dos implementaciones totalmente equivalentes — Java (Spring Boot 4.1) y Node.js (NestJS 12) — que comparten la misma base de datos MySQL y el mismo contrato de API ([`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)). Elija una;
- Todas las API usan el prefijo global `/api`, y el servidor de desarrollo del front-end incluye un proxy preconfigurado — **cero configuración para el desarrollo local**;
- Módulos integrados: autenticación, usuarios / roles / departamentos / menús, diccionario de datos, gestión de parámetros, tareas programadas, avisos y centro de mensajes, archivos adjuntos, flujo de trabajo, registros de operaciones / inicios de sesión / auditoría, usuarios en línea y supervisión del sistema, perfil.

| Lado (elija uno) | Opciones | Puerto |
| --- | --- | --- |
| Back-end | Java Spring Boot 4.1 / Node NestJS 12 | ambos en `localhost:8080` |
| Front-end | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## Estructura del proyecto

```
vben/
├── vben-admin-backend/              # Back-end
│   ├── docs/api-contract.md         # Contrato de API (referencia común)
│   ├── java-backend/                # Implementación Java (Spring Boot)
│   ├── node-backend/                # Implementación Node (NestJS + Prisma)
│   └── sql/init.sql                 # Base de datos + 20 tablas + datos de demo (importación única)
└── vue-vben-admin-v5.7.0/           # Monorepo del front-end (pnpm workspace)
    ├── apps/                        # 4 aplicaciones UI: web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # Paquetes compartidos (UI, hooks, preferencias...)
    ├── internal/                    # Configuración de compilación y lint
    └── scripts/                     # Herramientas de script
```

## Stack tecnológico y requisitos previos

| Lado | Tecnologías |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · monorepo pnpm |
| UI del front-end (1 de 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Back-end Java | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Back-end Node | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| Base de datos | MySQL 8.x (utf8mb4) |

| Herramienta | Versión | Necesaria para |
| --- | --- | --- |
| Node.js | ≥ 22.18 (se recomienda 24 LTS) | Front-end + back-end Node |
| pnpm | ≥ 10 (`npm i -g pnpm`) | Front-end + back-end Node |
| MySQL | 8.x | Ambos back-ends |
| JDK | 25 | Solo back-end Java |
| Maven | 3.9+ | Solo back-end Java |

Una vez instaladas, ejecute la autocomprobación y asegúrese de que las versiones cumplen los requisitos:

```bash
node -v && pnpm -v && mysql --version    # front-end + back-end Node
java -version && mvn -v                  # back-end Java
```

## Inicio rápido

### Paso 1: inicializar la base de datos

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) crea la base de datos (`vben_admin`), las 20 tablas y los datos de demo en un solo archivo — compartido por ambos back-ends.

**1.1 Compruebe que MySQL está en ejecución**

```bash
Get-Service MySQL*            # Windows (PowerShell como administrador) — Status debe ser Running
mysqladmin -uroot -p status   # macOS / Linux — si muestra Uptime, todo correcto
```

**1.2 Ejecute la importación**

Desde la **raíz del repositorio** (recomendado):

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

Alternativas:

```sql
-- Shell interactiva de MySQL (tras `mysql -uroot -p`; en Windows use barras normales)
SOURCE C:/su/ruta/vben-admin-backend/sql/init.sql;
```

O abra `init.sql` en una herramienta gráfica (Navicat / DBeaver / DataGrip) y ejecútelo por completo.
(PowerShell no admite `<` — use una de estas dos opciones.)

**1.3 Verifique la importación**

```sql
USE vben_admin;
SHOW TABLES;                          -- ~20 tablas (sys_user, sys_menu, sys_role, ...)
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

Si las tres consultas coinciden, la base de datos está lista.

> - El script incluye `CREATE DATABASE IF NOT EXISTS` y `USE vben_admin`, por lo que la importación siempre apunta a `vben_admin`;
> - La creación de tablas es idempotente, pero reinsertar los datos de demo aborta por conflictos de clave primaria — **ejecute la importación completa solo una vez**;
> - `Access denied` significa contraseña incorrecta; `command not found` significa que mysql no está en el `PATH` — use la ruta completa (p. ej. `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`).

### Paso 2: iniciar el back-end (Java / Node, elija uno)

> Ambos back-ends comparten el puerto 8080 — **solo uno puede ejecutarse a la vez**. La base de datos es compartida: cambiar de back-end no requiere migración.

#### Opción A: back-end Java (Spring Boot 4.1)

**A-1. Iniciar** (la primera ejecución descarga dependencias y puede tardar varios minutos):

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. Confirme el arranque** — el éxito se ve así (mantenga el terminal abierto; `Ctrl + C` para detener):

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. Verifique la conectividad** — en un terminal nuevo (una salida JSON significa OK):

```bash
curl http://localhost:8080/api/auth/config
# esperado: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**La conexión a la base de datos** está en `src/main/resources/application-dev.yml` y puede sobrescribirse con variables de entorno:

| Variable | Valor predeterminado | Descripción |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Host / puerto de la base de datos |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | Usuario / contraseña de la base de datos |

**Otras opciones clave** (`src/main/resources/application.yml`):

| Clave | Descripción |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | Vida útil del accessToken (segundos, 7200 por defecto) |
| `vben.auth.refresh-token-days` | Vida útil del refreshToken en días (7 por defecto) |
| `vben.auth.login-methods.*` | Interruptores de métodos de inicio de sesión (solo cuenta por defecto) |
| `vben.auth.sms-mock` / `email-mock` | Simulación de SMS/correo (códigos en las respuestas; desactivar en producción) |
| `vben.auth.upload-dir` | Directorio de subidas (`./uploads` por defecto) |
| `app.message.mail-enabled` | Interruptor de notificaciones por correo del centro de mensajes |
| `app.tenant.enabled` | Interruptor multi-tenant |

> **Fallos comunes**:
> - `Connection refused` junto a registros de base de datos → MySQL está detenido o las credenciales no coinciden;
> - `Port 8080 was already in use` → otro proceso (quizá el back-end Node) ocupa 8080 — deténgalo primero;
> - Errores de compilación sobre la versión del JDK → compruebe que `java -version` es 25 y que `JAVA_HOME` apunta al JDK 25.

#### Opción B: back-end Node (NestJS 12 + Fastify 5 + Prisma 7)

**B-1. Instale dependencias y prepare el archivo de entorno**:

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env no está versionado (ignorado por .gitignore) — créelo desde la plantilla la primera vez
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. Compruebe la conexión a la base de datos**: abra `.env` y asegúrese de que `DATABASE_URL` coincide con las credenciales del paso 1 (por defecto `root/123456`).

**B-3. Genere el cliente Prisma** (obligatorio la primera vez; de lo contrario el arranque falla):

```bash
pnpm db:generate
# salida esperada: ✔ Generated Prisma Client
```

**B-4. Inicie el back-end**:

```bash
pnpm dev              # modo desarrollo (recarga en caliente con tsx watch)
# o pnpm build && pnpm start   # ejecutar la salida compilada
```

**B-5. Confirme el arranque** — el éxito se ve así (mantenga el terminal abierto; `Ctrl + C` para detener):

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. Verifique la conectividad** — en un terminal nuevo (una salida JSON significa OK):

```bash
curl http://localhost:8080/api/auth/config
# esperado: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Opciones clave de `.env`** (plantilla: `.env.example`):

| Variable | Valor predeterminado (plantilla) | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | URL de la base de datos |
| `PORT` | `8080` | Puerto del servidor (debe coincidir con el proxy del front-end) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | valores de desarrollo | Secretos de firma JWT, **cámbielos en producción** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Vidas útiles de los tokens |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | solo `ACCOUNT=true` | Interruptores de inicio de sesión; la página de login se adapta |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | Creación automática de cuenta en el primer login por teléfono/OAuth (mantener `false` en producción) |
| `UPLOAD_DIR` | `./uploads` | Directorio de subidas |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | Simulación de SMS/correo (códigos en las respuestas; desactivar en producción) |

Otros comandos: `pnpm build` (compilar a `dist/`), `pnpm db:studio` (explorador de datos visual de Prisma).

> **Fallos comunes**:
> - `Cannot find module '@prisma/client'` → omitió `pnpm db:generate`;
> - `Can't reach database server` → MySQL está detenido o `.env` es incorrecto;
> - `Port 8080 is already in use` → otro proceso (quizá el back-end Java) ocupa 8080 — deténgalo primero;
> - `[ERR_PNPM_IGNORED_BUILDS]` en `pnpm install` → compruebe que todas las entradas `allowBuilds` de `pnpm-workspace.yaml` están en `true` (ya configurado en el repositorio) y reinstale.

### Paso 3: iniciar el front-end (1 de 4 aplicaciones UI)

| Aplicación | Framework UI | Puerto de desarrollo | Comando de inicio |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. Instale las dependencias del front-end** (la primera vez; instala las 4 aplicaciones de una vez, cientos de MB de descarga):

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. Inicie la aplicación elegida** (versión Ant Design Vue, por ejemplo):

```bash
pnpm dev:antd        # equivale a pnpm --filter @vben/web-antd dev
```

**F-3. Confirme el arranque** (el primer arranque precalienta dependencias; ~20–40 segundos):

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. Abra el navegador e inicie sesión**: visite `http://localhost:5666`; se le redirige a la página de inicio de sesión — complete el captcha deslizante y use una cuenta de demo (ver paso 4).

**F-5. Cambie a otra UI (opcional)**: detenga la actual y cambie el comando de inicio (puertos en la tabla anterior):

```bash
pnpm dev:ele           # Element Plus → http://localhost:5777
pnpm dev:naive         # Naive UI → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next → http://localhost:6001
```

> - **La conexión front-end ↔ back-end es automática**: el `vite.config.ts` de cada aplicación incluye un proxy `/api/**` → `http://localhost:8080/api/**`. Con el back-end en el puerto 8080 predeterminado, no se necesita configuración en el front-end; para otro puerto, actualice `proxy.target` en `apps/<su-app>/vite.config.ts`;
> - **Fallos comunes**: `pnpm install` se cuelga → use un espejo (`pnpm config set registry https://registry.npmmirror.com`) y reintente; las llamadas API devuelven 500/404 → el back-end está caído o el puerto difiere; puerto ocupado → cambie `VITE_PORT` en `apps/<su-app>/.env.development` y reinicie.

### Paso 4: iniciar sesión

Cuentas de demo (contraseña `123456` para todas):

| Cuenta | Rol | Página inicial | Alcance |
| --- | --- | --- | --- |
| **vben** | superadministrador | /analytics | todos los menús y permisos de botones |
| **admin** | administrador | /workspace | gestión del sistema / supervisión / herramientas |
| **jack** | usuario | /analytics | gestión de usuarios (solo lectura) + gestión de roles; acceso no autorizado → 403/404 |

Llegar a la página de analytics/workspace significa que el **despliegue está completo**.

> Las entradas de inicio de sesión por teléfono / QR / registro / OAuth se controlan con interruptores del back-end (ver tablas del paso 2) y aparecen automáticamente en la página de login al activarlas. En modo de simulación, los códigos de verificación se devuelven directamente en las respuestas de la API.

## Despliegue en producción

### Compilación del front-end

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # equivale a pnpm --filter @vben/web-antd build; salida: apps/web-antd/dist
```

Otras UI: `pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`.

**Ejemplo de configuración de Nginx**:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # apunte al directorio dist
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # fallback de SPA
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # el back-end ya incluye el prefijo /api
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # archivos adjuntos
    }
}
```

### Compilación del back-end

```bash
# Java (detenga primero el proceso en ejecución; de lo contrario el jar queda bloqueado)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Lista de verificación de seguridad para producción

- [ ] Cambie la contraseña predeterminada de la base de datos `123456`; desactive o cambie las cuentas de demo
- [ ] Cambie `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` en el `.env` de Node
- [ ] Desactive la simulación de SMS/correo (Java: `vben.auth.sms-mock=false`; Node: las mismas claves en `.env`) y conecte proveedores reales
- [ ] Desactive la documentación de knife4j / Swagger (Java: `springdoc.api-docs.enabled=false`)
- [ ] Restrinja los métodos de inicio de sesión (desactive el registro y la creación automática por teléfono/OAuth)
- [ ] Active cookies seguras tras HTTPS (Java: `vben.auth.cookie-secure=true`; Node: `COOKIE_SECURE=true`)

## Cómo funciona

**Modelo de permisos**: RBAC (usuario → rol → menú/botón) con un conjunto compartido de códigos de permiso en ambos lados.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → rutas del front-end / menú lateral
                                                              └─ type=button → auth_code (códigos de botón)
```

- **Permisos de menú**: el back-end devuelve un árbol de rutas por usuario (`GET /menu/all`); las rutas no autorizadas nunca se registran en el front-end (el acceso directo devuelve 404);
- **Permisos de botón**: `auth_code` (p. ej. `AC_100010` = crear usuario) controla la visibilidad de los botones mediante la directiva `v-access` / `hasAccessByCodes` en el front-end, y se aplica con `@SaCheckPermission` (Java) / `@Permissions` + `PermissionGuard` (Node) en el back-end;
- **Superadministrador**: un rol con `code=super` posee todos los permisos.

**Autenticación**: el inicio de sesión emite dos tokens — accessToken (2 h, localStorage, enviado como `Authorization: Bearer <token>`) + refreshToken (7 días, cookie HttpOnly, resistente a XSS). Cuando el accessToken expira, el front-end llama silenciosamente a `POST /auth/refresh`; cerrar sesión / forzar el cierre revoca ambos tokens.

## Documentación de la API

| Back-end | URL |
| --- | --- |
| Java (knife4j) | <http://localhost:8080/api/doc.html> |
| Node (Swagger) | <http://localhost:8080/api/docs> |

Para depuración en vivo: llame a `POST /auth/login` para obtener un accessToken y pegue `Bearer <accessToken>` en el diálogo Authorize. El contrato completo de la API está en [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## Preguntas frecuentes (FAQ)

**P1: ¿Todas las peticiones fallan / el inicio de sesión no responde?**
Compruebe en orden: ① si el back-end se ejecuta en 8080 (`curl http://localhost:8080/api/auth/config` debe devolver JSON); ② si se importó `init.sql`; ③ si las credenciales de la base de datos son correctas (revise el log de arranque); ④ si quedan procesos antiguos.

**P2: ¿El puerto 8080 está ocupado / cómo cambio de back-end?**
Java y Node comparten 8080 — no pueden ejecutarse a la vez. Para cambiar, detenga uno e inicie el otro, actualice el front-end y vuelva a iniciar sesión (base de datos compartida, sin migración). Para compararlos en paralelo: cambie `PORT` en el `.env` de Node (p. ej. 8081) y actualice `proxy.target` en el `vite.config.ts` del front-end.

**P3: ¿No veo las entradas de login por teléfono / registro / OAuth?**
Los métodos de inicio de sesión se controlan con interruptores del back-end y se entregan vía `GET /auth/config`: actívelos en `vben.auth.login-methods.*` (Java `application.yml`) o `LOGIN_METHODS_*` (Node `.env`).

**P4: ¿Nunca recibo códigos de verificación?**
Los entornos de desarrollo activan la simulación de SMS/correo por defecto — los códigos se devuelven directamente en las respuestas de la API. Conecte proveedores reales y desactive las simulaciones en producción.

**P5: ¿La subida de archivos adjuntos falla con un error de tamaño?**
El back-end limita cada archivo a ≤ 5 MB (el límite multipart de Java es 10 MB con una comprobación de negocio de 5 MB). Tras Nginx, configure también `client_max_body_size 10m;`.

**P6: ¿«Ejecutar una vez» en una tarea programada indica un bean/método no encontrado?**
El formato del objetivo de invocación es `beanName.methodName` (p. ej. `sampleJob.run`) y el bean referenciado debe existir en el código del back-end (Java: `@Component("xxx")`; Node: método de tarea registrado).

## Licencia

[MIT](../LICENSE)
