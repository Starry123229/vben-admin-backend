<div align="center">

# Vben Admin — Verwaltungssystem

**Enterprise-Verwaltungssystem mit entkoppeltem Frontend / Backend, gebaut mit Vue 3 + Vben Admin 5.7**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#lizenz)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md) | **Deutsch** | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## Einführung

- **Frontend**: basiert auf dem Vben Admin 5.7 Monorepo mit **4 UI-Anwendungen**; der Geschäftscode ist identisch — wählen Sie eine aus;
- **Backend**: zwei vollständig gleichwertige Implementierungen — Java (Spring Boot 4.1) und Node.js (NestJS 12) — die dieselbe MySQL-Datenbank und denselben API-Vertrag ([`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)) nutzen. Wählen Sie eine aus;
- Alle Endpunkte verwenden das globale Präfix `/api`, und der Frontend-Entwicklungsserver bringt einen vorkonfigurierten Proxy mit — **keine Konfiguration für die lokale Entwicklung**;
- Integrierte Module: Authentifizierung, Benutzer / Rollen / Abteilungen / Menüs, Datenwörterbuch, Parameterverwaltung, geplante Aufgaben, Mitteilungen und Nachrichtenzentrum, Anhänge, Workflow, Betriebs-/Anmelde-/Audit-Protokolle, Online-Benutzer und Systemüberwachung, Profil.

| Seite (eine wählen) | Optionen | Port |
| --- | --- | --- |
| Backend | Java Spring Boot 4.1 / Node NestJS 12 | beide auf `localhost:8080` |
| Frontend | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## Projektstruktur

```
vben/
├── vben-admin-backend/              # Backend
│   ├── docs/api-contract.md         # API-Vertrag (gemeinsame Referenz)
│   ├── java-backend/                # Java-Implementierung (Spring Boot)
│   ├── node-backend/                # Node-Implementierung (NestJS + Prisma)
│   └── sql/init.sql                 # Datenbank + 20 Tabellen + Demo-Daten (Einzelimport)
└── vue-vben-admin-v5.7.0/           # Frontend-Monorepo (pnpm workspace)
    ├── apps/                        # 4 UI-Apps: web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # Gemeinsame Pakete (UI, Hooks, Einstellungen ...)
    ├── internal/                    # Build- und Lint-Konfiguration
    └── scripts/                     # Skript-Werkzeuge
```

## Tech-Stack und Voraussetzungen

| Seite | Technologien |
| --- | --- |
| Frontend | Vue 3.5 · Vite 8 · TypeScript · Pinia · pnpm-Monorepo |
| Frontend-UI (1 von 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Java-Backend | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Node-Backend | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| Datenbank | MySQL 8.x (utf8mb4) |

| Werkzeug | Version | Erforderlich für |
| --- | --- | --- |
| Node.js | ≥ 22.18 (24 LTS empfohlen) | Frontend + Node-Backend |
| pnpm | ≥ 10 (`npm i -g pnpm`) | Frontend + Node-Backend |
| MySQL | 8.x | Beide Backends |
| JDK | 25 | Nur Java-Backend |
| Maven | 3.9+ | Nur Java-Backend |

Führen Sie nach der Installation den Selbsttest aus und stellen Sie sicher, dass die Versionen den Anforderungen entsprechen:

```bash
node -v && pnpm -v && mysql --version    # Frontend + Node-Backend
java -version && mvn -v                  # Java-Backend
```

## Schnellstart

### Schritt 1: Datenbank initialisieren

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) erstellt mit einer einzigen Datei die Datenbank (`vben_admin`), alle 20 Tabellen und die Demo-Daten — gemeinsam genutzt von beiden Backends.

**1.1 Prüfen, ob MySQL läuft**

```bash
Get-Service MySQL*            # Windows (PowerShell als Administrator) — Status sollte Running sein
mysqladmin -uroot -p status   # macOS / Linux — Ausgabe von Uptime bedeutet OK
```

**1.2 Import ausführen**

Vom **Repository-Stammverzeichnis** aus (empfohlen):

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

Alternativen:

```sql
-- Interaktive MySQL-Shell (nach `mysql -uroot -p`; unter Windows Schrägstriche verwenden)
SOURCE C:/Ihr/Pfad/vben-admin-backend/sql/init.sql;
```

Oder öffnen Sie `init.sql` in einem GUI-Tool (Navicat / DBeaver / DataGrip) und führen Sie es vollständig aus.
(PowerShell unterstützt `<` nicht — verwenden Sie eine dieser beiden Methoden.)

**1.3 Import überprüfen**

```sql
USE vben_admin;
SHOW TABLES;                          -- ~20 Tabellen (sys_user, sys_menu, sys_role, ...)
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

Wenn alle drei Abfragen übereinstimmen, ist die Datenbank bereit.

> - Das Skript enthält `CREATE DATABASE IF NOT EXISTS` und `USE vben_admin` — der Import zielt also immer auf `vben_admin`;
> - Die Tabellenerstellung ist idempotent, aber erneutes Einfügen der Demo-Daten bricht mit Primärschlüsselkonflikten ab — **führen Sie den vollständigen Import nur einmal aus**;
> - `Access denied` bedeutet falsches Passwort; `command not found` bedeutet, dass mysql nicht im `PATH` liegt — verwenden Sie den vollständigen Pfad (z. B. `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`).

### Schritt 2: Backend starten (Java / Node, eine Wahl)

> Beide Backends teilen sich Port 8080 — **es kann nur eines gleichzeitig laufen**. Die Datenbank wird gemeinsam genutzt, ein Wechsel erfordert keine Migration.

#### Option A: Java-Backend (Spring Boot 4.1)

**A-1. Starten** (der erste Lauf lädt Abhängigkeiten und kann einige Minuten dauern):

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. Start bestätigen** — ein erfolgreicher Start sieht so aus (Terminal geöffnet lassen; `Ctrl + C` zum Beenden):

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. Konnektivität prüfen** — in einem neuen Terminal (JSON-Ausgabe bedeutet OK):

```bash
curl http://localhost:8080/api/auth/config
# erwartet: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Die Datenbankverbindung** befindet sich in `src/main/resources/application-dev.yml` und kann per Umgebungsvariablen überschrieben werden:

| Variable | Standard | Beschreibung |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Datenbank-Host / -Port |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | Datenbank-Benutzer / -Passwort |

**Weitere wichtige Einstellungen** (`src/main/resources/application.yml`):

| Schlüssel | Beschreibung |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | Lebensdauer des accessToken (Sekunden, Standard 7200) |
| `vben.auth.refresh-token-days` | Lebensdauer des refreshToken in Tagen (Standard 7) |
| `vben.auth.login-methods.*` | Schalter für Anmeldemethoden (standardmäßig nur Konto-Anmeldung) |
| `vben.auth.sms-mock` / `email-mock` | SMS-/E-Mail-Mock (Codes in Antworten; in Produktion deaktivieren) |
| `vben.auth.upload-dir` | Upload-Verzeichnis (Standard `./uploads`) |
| `app.message.mail-enabled` | E-Mail-Benachrichtigung des Nachrichtenzentrums |
| `app.tenant.enabled` | Multi-Tenant-Schalter |

> **Häufige Fehler**:
> - `Connection refused` bei Datenbank-Protokollen → MySQL ist nicht gestartet oder die Zugangsdaten stimmen nicht;
> - `Port 8080 was already in use` → ein anderer Prozess (vielleicht das Node-Backend) belegt 8080 — zuerst beenden;
> - Kompilierfehler zur JDK-Version → prüfen Sie, ob `java -version` 25 ist und `JAVA_HOME` auf JDK 25 zeigt.

#### Option B: Node-Backend (NestJS 12 + Fastify 5 + Prisma 7)

**B-1. Abhängigkeiten installieren und Umgebungsdatei vorbereiten**:

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env ist nicht versioniert (von .gitignore ausgeschlossen) — beim ersten Start aus der Vorlage erstellen
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. Datenbankverbindung prüfen**: Öffnen Sie `.env` und stellen Sie sicher, dass `DATABASE_URL` zu den Zugangsdaten aus Schritt 1 passt (Standard `root/123456`).

**B-3. Prisma Client generieren** (beim ersten Start erforderlich, sonst schlägt der Start fehl):

```bash
pnpm db:generate
# erwartete Ausgabe: ✔ Generated Prisma Client
```

**B-4. Backend starten**:

```bash
pnpm dev              # Entwicklungsmodus (tsx watch Hot Reload)
# oder pnpm build && pnpm start   # kompilierte Ausgabe ausführen
```

**B-5. Start bestätigen** — ein erfolgreicher Start sieht so aus (Terminal geöffnet lassen; `Ctrl + C` zum Beenden):

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. Konnektivität prüfen** — in einem neuen Terminal (JSON-Ausgabe bedeutet OK):

```bash
curl http://localhost:8080/api/auth/config
# erwartet: {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Wichtige `.env`-Einstellungen** (Vorlage: `.env.example`):

| Variable | Standard (Vorlage) | Beschreibung |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | Datenbank-URL |
| `PORT` | `8080` | Server-Port (muss zum Frontend-Proxy passen) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Dev-Platzhalter | JWT-Signaturschlüssel, **in Produktion ändern** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Token-Lebensdauern |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | nur `ACCOUNT=true` | Anmelde-Schalter; die Login-Seite passt sich an |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | Automatische Kontoerstellung beim ersten Telefon-/OAuth-Login (in Produktion `false` lassen) |
| `UPLOAD_DIR` | `./uploads` | Upload-Verzeichnis |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | SMS-/E-Mail-Mock (Codes in Antworten; in Produktion deaktivieren) |

Weitere Befehle: `pnpm build` (nach `dist/` kompilieren), `pnpm db:studio` (visueller Prisma-Datenbrowser).

> **Häufige Fehler**:
> - `Cannot find module '@prisma/client'` → `pnpm db:generate` wurde übersprungen;
> - `Can't reach database server` → MySQL ist nicht gestartet oder `.env` ist falsch;
> - `Port 8080 is already in use` → ein anderer Prozess (vielleicht das Java-Backend) belegt 8080 — zuerst beenden;
> - `[ERR_PNPM_IGNORED_BUILDS]` bei `pnpm install` → prüfen Sie, ob alle `allowBuilds`-Einträge in `pnpm-workspace.yaml` auf `true` stehen (im Repo vorkonfiguriert), und installieren Sie erneut.

### Schritt 3: Frontend starten (1 von 4 UI-Apps)

| App | UI-Framework | Dev-Port | Startbefehl |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. Frontend-Abhängigkeiten installieren** (einmalig; installiert alle 4 Apps auf einmal, mehrere hundert MB Download):

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. Gewählte App starten** (Beispiel: Ant-Design-Vue-Version):

```bash
pnpm dev:antd        # entspricht pnpm --filter @vben/web-antd dev
```

**F-3. Start bestätigen** (der erste Start wärmt Abhängigkeiten vor; ~20–40 Sekunden):

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. Browser öffnen und anmelden**: Rufen Sie `http://localhost:5666` auf; Sie werden zur Login-Seite weitergeleitet — lösen Sie das Slider-Captcha und verwenden Sie ein Demo-Konto (siehe Schritt 4).

**F-5. Zu einer anderen UI wechseln (optional)**: Stoppen Sie die aktuelle App und wechseln Sie den Startbefehl (Ports siehe Tabelle oben):

```bash
pnpm dev:ele           # Element Plus → http://localhost:5777
pnpm dev:naive         # Naive UI → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next → http://localhost:6001
```

> - **Frontend ↔ Backend sind automatisch verbunden**: Das `vite.config.ts` jeder App enthält einen Proxy `/api/**` → `http://localhost:8080/api/**`. Läuft das Backend auf dem Standardport 8080, ist keine Frontend-Konfiguration nötig; für einen anderen Port aktualisieren Sie `proxy.target` in `apps/<Ihre-App>/vite.config.ts`;
> - **Häufige Fehler**: `pnpm install` hängt → Mirror verwenden (`pnpm config set registry https://registry.npmmirror.com`) und erneut versuchen; API-Aufrufe liefern 500/404 → Backend ist aus oder der Port weicht ab; Port belegt → `VITE_PORT` in `apps/<Ihre-App>/.env.development` ändern und neu starten.

### Schritt 4: Anmelden

Demo-Konten (Passwort für alle `123456`):

| Konto | Rolle | Startseite | Umfang |
| --- | --- | --- | --- |
| **vben** | Super-Administrator | /analytics | alle Menüs und Button-Berechtigungen |
| **admin** | Administrator | /workspace | Systemverwaltung / Überwachung / Werkzeuge |
| **jack** | Benutzer | /analytics | Benutzerverwaltung (nur Lesen) + Rollenverwaltung; unbefugter Zugriff → 403/404 |

Wenn Sie auf der Analytics-/Workspace-Seite landen, ist das **Deployment abgeschlossen**.

> Telefon-Login / QR / Registrierung / OAuth-Einträge werden durch Backend-Schalter gesteuert (siehe Tabellen in Schritt 2) und erscheinen bei Aktivierung automatisch auf der Login-Seite. Im Mock-Modus werden Bestätigungscodes direkt in API-Antworten zurückgegeben.

## Produktions-Deployment

### Frontend-Build

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # entspricht pnpm --filter @vben/web-antd build; Ausgabe: apps/web-antd/dist
```

Andere UIs: `pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`.

**Nginx-Beispielkonfiguration**:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # auf das dist-Verzeichnis zeigen
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA-Fallback
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # das Backend enthält bereits das /api-Präfix
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # Anhänge
    }
}
```

### Backend-Build

```bash
# Java (zuerst den laufenden Prozess stoppen, sonst ist das JAR gesperrt)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Sicherheits-Checkliste für die Produktion

- [ ] Standard-Datenbankpasswort `123456` ändern; Demo-Konten deaktivieren oder Passwörter ändern
- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` im Node-`.env` ändern
- [ ] SMS-/E-Mail-Mock deaktivieren (Java: `vben.auth.sms-mock=false`; Node: gleiche Schlüssel in `.env`) und echte Anbieter anbinden
- [ ] knife4j-/Swagger-Dokumentation deaktivieren (Java: `springdoc.api-docs.enabled=false`)
- [ ] Anmeldemethoden einschränken (Registrierung und automatische Telefon-/OAuth-Kontoerstellung deaktivieren)
- [ ] Sichere Cookies hinter HTTPS aktivieren (Java: `vben.auth.cookie-secure=true`; Node: `COOKIE_SECURE=true`)

## Funktionsweise

**Berechtigungsmodell**: RBAC (Benutzer → Rolle → Menü/Button) mit einem gemeinsamen Satz von Berechtigungscodes auf beiden Seiten.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → Frontend-Routen / Seitenmenü
                                                              └─ type=button → auth_code (Button-Codes)
```

- **Menü-Berechtigungen**: Das Backend liefert einen benutzerspezifischen Routenbaum (`GET /menu/all`); nicht autorisierte Routen werden im Frontend nie registriert (direkter Zugriff → 404);
- **Button-Berechtigungen**: `auth_code` (z. B. `AC_100010` = Benutzer erstellen) steuert die Sichtbarkeit von Buttons über die Direktive `v-access` / `hasAccessByCodes` im Frontend und wird im Backend durch `@SaCheckPermission` (Java) / `@Permissions` + `PermissionGuard` (Node) durchgesetzt;
- **Super-Administrator**: Eine Rolle mit `code=super` besitzt alle Berechtigungen.

**Authentifizierung**: Die Anmeldung stellt zwei Token aus — accessToken (2 Std., localStorage, gesendet als `Authorization: Bearer <token>`) + refreshToken (7 Tage, HttpOnly-Cookie, XSS-resistent). Wenn der accessToken abläuft, ruft das Frontend still `POST /auth/refresh` auf; Abmeldung / erzwungene Abmeldung widerruft beide Token.

## API-Dokumentation

| Backend | URL |
| --- | --- |
| Java (knife4j) | <http://localhost:8080/api/doc.html> |
| Node (Swagger) | <http://localhost:8080/api/docs> |

Zum Live-Debugging: Rufen Sie `POST /auth/login` auf, um einen accessToken zu erhalten, und fügen Sie `Bearer <accessToken>` in den Authorize-Dialog ein. Der vollständige API-Vertrag liegt unter [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## FAQ

**F1: Alle Anfragen schlagen fehl / die Anmeldung reagiert nicht?**
Der Reihe nach prüfen: ① Läuft das Backend auf 8080 (`curl http://localhost:8080/api/auth/config` sollte JSON liefern); ② wurde `init.sql` importiert; ③ stimmen die Datenbank-Zugangsdaten (Startprotokoll prüfen); ④ laufen noch alte Prozesse?

**F2: Port 8080 ist belegt / wie wechsle ich das Backend?**
Java und Node teilen sich 8080 — sie können nicht gleichzeitig laufen. Zum Wechseln eines stoppen, das andere starten, dann das Frontend aktualisieren und erneut anmelden (gemeinsame Datenbank, keine Migration nötig). Für einen Parallelvergleich: `PORT` im Node-`.env` ändern (z. B. 8081) und `proxy.target` im Frontend-`vite.config.ts` anpassen.

**F3: Ich sehe keine Telefon-/Registrierungs-/OAuth-Einträge auf der Login-Seite?**
Anmeldemethoden werden durch Backend-Schalter gesteuert und über `GET /auth/config` übermittelt: Aktivieren Sie sie in `vben.auth.login-methods.*` (Java `application.yml`) oder `LOGIN_METHODS_*` (Node `.env`).

**F4: Ich erhalte keine Bestätigungscodes?**
Entwicklungsumgebungen aktivieren standardmäßig SMS-/E-Mail-Mock — Codes werden direkt in API-Antworten zurückgegeben. Binden Sie für die Produktion echte Anbieter an und deaktivieren Sie die Mocks.

**F5: Der Anhang-Upload schlägt mit einem Größenfehler fehl?**
Das Backend begrenzt eine Datei auf ≤ 5 MB (Java-Multipart-Limit 10 MB mit 5-MB-Geschäftsprüfung). Hinter Nginx setzen Sie zusätzlich `client_max_body_size 10m;`.

**F6: „Einmal ausführen" bei einer geplanten Aufgabe meldet eine fehlende Bean/Methode?**
Das Aufrufziel hat das Format `beanName.methodName` (z. B. `sampleJob.run`), und die referenzierte Bean muss im Backend-Code existieren (Java: `@Component("xxx")`; Node: registrierte Job-Methode).

## Lizenz

[MIT](../LICENSE)
