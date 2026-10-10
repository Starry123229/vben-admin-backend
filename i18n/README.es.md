<div align="center">

# Vben Admin — Sistema de administración

<p>Framework de administración de código abierto (Vue 3 Admin Template / Dashboard): solución full-stack basada en Vben Admin 5.7 — front-end con Vue 3 + Vite, back-ends duales Java Spring Boot 4 / Node.js NestJS 12, RBAC, token dual JWT, MySQL. Listo para usar, licencia MIT, uso comercial gratuito</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#licencia)
[![GitHub Stars](https://img.shields.io/github/stars/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Starry123229/vben-admin-backend)](https://github.com/Starry123229/vben-admin-backend/issues)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | [Deutsch](./README.de.md) | **Español** | [Русский](./README.ru.md)

</div>

---

## Estructura del proyecto

```
vben/
├── vben-admin-backend/              # Back-end
│   ├── docs/api-contract.md         # Contrato de API (referencia común)
│   ├── java-backend/                # Implementación Java (Spring Boot)
│   ├── node-backend/                # Implementación Node (NestJS + Prisma)
│   └── sql/init.sql                 # Base de datos + 20 tablas + datos de demo (importación única)
└── vue-vben-admin-v5.7.0/           # Monorepo del front-end (pnpm workspace)
    ├── apps/                        # 4 aplicaciones UI
    ├── packages/                    # Paquetes compartidos
    └── internal/                    # Configuración de compilación y lint
```

## Stack tecnológico

| Lado | Tecnologías |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · monorepo pnpm |
| UI del front-end (1 de 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Back-end Java | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Back-end Node | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| Base de datos | MySQL 9.x (utf8mb4) |

## Inicio rápido

### 1. Inicializar la base de datos

```bash
# Compruebe que MySQL está en ejecución, luego importe
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` crea la base de datos (`vben_admin`), las 20 tablas y los datos de demo en un solo archivo — compartido por ambos back-ends.

### 2. Iniciar el back-end (Java / Node, elija uno)

```bash
# Opción A: back-end Java
cd vben-admin-backend/java-backend
mvn spring-boot:run

# Opción B: back-end Node
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> Ambos back-ends comparten el puerto 8080 — solo uno puede ejecutarse a la vez. Credenciales de BD por defecto: `root/123456`. Vea los archivos de configuración para cambiar.

### 3. Iniciar el front-end (1 de 4 aplicaciones)

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. Iniciar sesión

Cuentas de demo (contraseña `123456` para todas):

| Cuenta | Rol | Alcance |
| --- | --- | --- |
| **vben** | superadministrador | todos los menús y permisos de botones |
| **admin** | administrador | gestión del sistema / supervisión / herramientas |
| **jack** | usuario | gestión de usuarios (solo lectura) + gestión de roles |

## Despliegue en producción

### Compilación del front-end

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # salida: apps/web-antd/dist
```

### Compilación del back-end

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Ejemplo de configuración de Nginx

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

## Cómo funciona

**Modelo de permisos**: RBAC (usuario → rol → menú/botón) con un conjunto compartido de códigos de permiso en ambos lados.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → rutas del front-end / menú lateral
                                                              └─ type=button → auth_code (códigos de botones)
```

**Flujo de autenticación**:

```
Inicio de sesión → emitir doble token
  ├─ accessToken (2 h, localStorage, enviado como Authorization: Bearer)
  └─ refreshToken (7 días, cookie HttpOnly, resistente a XSS)
      └─ accessToken expira → el front-end llama silenciosamente a POST /auth/refresh
      └─ cerrar sesión / forzar cierre → ambos tokens revocados
```

**Permisos de menú y botón**:

- **Permisos de menú**: el back-end devuelve un árbol de rutas por usuario (`GET /menu/all`); las rutas no autorizadas nunca se registran en el front-end.
- **Permisos de botón**: `auth_code` (p. ej. `AC_100010`) controla la visibilidad de los botones mediante la directiva `v-access` y se aplica con `@SaCheckPermission` (Java) / `@Permissions` (Node) en el back-end.
- **Superadministrador**: un rol con `code=super` posee todos los permisos.

## Documentación de la API

| Back-end | URL |
| --- | --- |
| Java (knife4j) | http://localhost:8080/api/doc.html |
| Node (Swagger) | http://localhost:8080/api/docs |

Contrato completo de API: [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## ❓ Preguntas frecuentes

**1. ¿Cómo cambiar entre los back-ends Java y Node?**
Ambos back-ends implementan el mismo contrato de API y comparten la misma base de datos y el puerto 8080 — detenga uno e inicie el otro. No se requieren cambios en el front-end.

**2. ¿Cuáles son las credenciales de acceso predeterminadas?**
Vea «Inicio rápido → Iniciar sesión» arriba. Todas las cuentas de demostración usan la contraseña `123456`.

**3. ¿Olvidó la contraseña / quiere restablecer los datos de demostración?**
Vuelva a ejecutar `mysql -uroot -p < vben-admin-backend/sql/init.sql` para restaurar todos los datos de demostración (atención: se borrarán los datos existentes).

**4. ¿Admite PostgreSQL / Oracle?**
El script SQL está actualmente en dialecto MySQL (utf8mb4). El lado Java (MyBatis-Plus) y el lado Node (Prisma) ofrecen la base para cambiar de base de datos — los PR son bienvenidos.

**5. El puerto ya está en uso — ¿cómo lo cambio?**
El back-end usa por defecto el puerto `8080`; las cuatro aplicaciones front-end usan `5666 / 5777 / 5888 / 6001`. Cámbielos en los archivos de configuración de cada parte.

**6. ¿Puedo usarlo comercialmente?**
Sí. La licencia MIT permite el uso comercial gratuito — solo conserve el aviso de copyright.

## 💬 Comunidad y comentarios

- 🐛 Informes de errores / sugerencias: [Issues](https://github.com/Starry123229/vben-admin-backend/issues)
- 💡 Preguntas / intercambio de experiencias: [Discussions](https://github.com/Starry123229/vben-admin-backend/discussions)

## Licencia

[MIT](../LICENSE)
