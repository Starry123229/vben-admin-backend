<div align="center">

# Vben Admin — Verwaltungssystem

<p>Open-Source-Admin-Framework (Vue 3 Admin Template / Dashboard): Full-Stack-Lösung auf Basis von Vben Admin 5.7 — Frontend mit Vue 3 + Vite, Java Spring Boot 4 / Node.js NestJS 12 als duale Backends, RBAC, JWT-Dual-Token, MySQL. Sofort einsatzbereit, MIT-Lizenz, kommerzielle Nutzung kostenlos</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#lizenz)
[![GitHub Stars](https://img.shields.io/github/stars/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Starry123229/vben-admin-backend)](https://github.com/Starry123229/vben-admin-backend/issues)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | **Deutsch** | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## Projektstruktur

```
vben/
├── vben-admin-backend/              # Backend
│   ├── docs/api-contract.md         # API-Vertrag (gemeinsame Referenz)
│   ├── java-backend/                # Java-Implementierung (Spring Boot)
│   ├── node-backend/                # Node-Implementierung (NestJS + Prisma)
│   └── sql/init.sql                 # Datenbank + 20 Tabellen + Demo-Daten (Einzelimport)
└── vue-vben-admin-v5.7.0/           # Frontend-Monorepo (pnpm workspace)
    ├── apps/                        # 4 UI-Apps
    ├── packages/                    # Gemeinsame Pakete
    └── internal/                    # Build- und Lint-Konfiguration
```

## Tech-Stack

| Seite | Technologien |
| --- | --- |
| Frontend | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm-Monorepo |
| Frontend-UI (1 von 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java-Backend | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Node-Backend | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| Datenbank | MySQL 9.x (utf8mb4) |

## Schnellstart

### 1. Datenbank initialisieren

```bash
# Prüfen, ob MySQL läuft, dann importieren
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` erstellt mit einer Datei die Datenbank (`vben_admin`), alle 20 Tabellen und Demo-Daten — gemeinsam genutzt von beiden Backends.

### 2. Backend starten (Java / Node, eine Wahl)

```bash
# Option A: Java-Backend
cd vben-admin-backend/java-backend
mvn spring-boot:run

# Option B: Node-Backend
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> Beide Backends teilen sich Port 8080 — nur eines kann gleichzeitig laufen. Standard-Datenbankzugang: `root/123456`. Siehe Konfigurationsdateien zum Ändern.

### 3. Frontend starten (1 von 4 UI-Apps)

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. Anmelden

Demo-Konten (Passwort für alle `123456`):

| Konto | Rolle | Umfang |
| --- | --- | --- |
| **vben** | Super-Administrator | alle Menüs und Button-Berechtigungen |
| **admin** | Administrator | Systemverwaltung / Überwachung / Werkzeuge |
| **jack** | Benutzer | Benutzerverwaltung (nur Lesen) + Rollenverwaltung |

## Produktions-Deployment

### Frontend-Build

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # Ausgabe: apps/web-antd/dist
```

### Backend-Build

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Nginx-Beispielkonfiguration

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

## Funktionsweise

**Berechtigungsmodell**: RBAC (Benutzer → Rolle → Menü/Button) mit einem gemeinsamen Satz von Berechtigungscodes auf beiden Seiten.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → Frontend-Routen / Seitenmenü
                                                              └─ type=button → auth_code (Button-Codes)
```

**Authentifizierungsablauf**:

```
Anmeldung → Dual-Token ausstellen
  ├─ accessToken (2 Std., localStorage, als Authorization: Bearer gesendet)
  └─ refreshToken (7 Tage, HttpOnly-Cookie, XSS-resistent)
      └─ accessToken abgelaufen → Frontend ruft still POST /auth/refresh auf
      └─ Abmeldung / erzwungene Abmeldung → beide Token widerrufen
```

**Menü- und Button-Berechtigungen**:

- **Menü-Berechtigungen**: Das Backend liefert einen benutzerspezifischen Routenbaum (`GET /menu/all`); nicht autorisierte Routen werden im Frontend nie registriert.
- **Button-Berechtigungen**: `auth_code` (z. B. `AC_100010`) steuert die Sichtbarkeit von Buttons über die `v-access`-Direktive und wird im Backend durch `@SaCheckPermission` (Java) / `@Permissions` (Node) durchgesetzt.
- **Super-Administrator**: Eine Rolle mit `code=super` besitzt alle Berechtigungen.

## API-Dokumentation

| Backend | URL |
| --- | --- |
| Java (knife4j) | http://localhost:8080/api/doc.html |
| Node (Swagger) | http://localhost:8080/api/docs |

Vollständiger API-Vertrag: [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## ❓ Häufige Fragen

**1. Wie wechsle ich zwischen dem Java- und dem Node-Backend?**
Beide Backends implementieren denselben API-Vertrag und teilen sich dieselbe Datenbank sowie Port 8080 — einfach eines stoppen und das andere starten. Änderungen am Frontend sind nicht erforderlich.

**2. Wie lauten die Standard-Anmeldedaten?**
Siehe oben „Schnellstart → Anmelden". Alle Demo-Konten verwenden das Passwort `123456`.

**3. Passwort vergessen / Demo-Daten zurücksetzen?**
Führen Sie `mysql -uroot -p < vben-admin-backend/sql/init.sql` erneut aus, um alle Demo-Daten wiederherzustellen (Achtung: vorhandene Daten werden gelöscht).

**4. Werden PostgreSQL / Oracle unterstützt?**
Das SQL-Skript ist derzeit in MySQL-Dialekt (utf8mb4). Java-Seite (MyBatis-Plus) und Node-Seite (Prisma) bieten die Grundlage für einen Datenbankwechsel — PRs sind willkommen.

**5. Der Port ist belegt — wie ändere ich ihn?**
Das Backend nutzt standardmäßig Port `8080`; die vier Frontend-Apps verwenden `5666 / 5777 / 5888 / 6001`. Ändern Sie dies in den jeweiligen Konfigurationsdateien.

**6. Kann ich es kommerziell nutzen?**
Ja. Die MIT-Lizenz erlaubt die kostenlose kommerzielle Nutzung — bitte den Copyright-Hinweis beibehalten.

## 💬 Austausch & Feedback

- 🐛 Fehlermeldungen / Vorschläge: [Issues](https://github.com/Starry123229/vben-admin-backend/issues)
- 💡 Fragen / Erfahrungsaustausch: [Discussions](https://github.com/Starry123229/vben-admin-backend/discussions)

## Lizenz

[MIT](../LICENSE)
