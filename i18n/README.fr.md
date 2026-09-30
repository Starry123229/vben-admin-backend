<div align="center">

# Vben Admin — Système d'administration

**Système d'administration d'entreprise découplé front-end / back-end, construit avec Vue 3 + Vben Admin 5.7**

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#licence)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | **Français** | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## Introduction

- **Front-end** : basé sur le monorepo Vben Admin 5.7, il embarque **4 applications UI** ; le code métier est identique — choisissez-en une ;
- **Back-end** : deux implémentations entièrement équivalentes — Java (Spring Boot 4.1) et Node.js (NestJS 12) — partageant la même base de données MySQL et le même contrat d'API ([`docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md)). Choisissez-en une ;
- Toutes les API partagent le préfixe global `/api`, et le serveur de développement front-end est livré avec un proxy préconfiguré — **aucune configuration pour le développement local** ;
- Modules intégrés : authentification, utilisateurs / rôles / services / menus, dictionnaire de données, gestion des paramètres, tâches planifiées, annonces et centre de messages, pièces jointes, workflow, journaux d'opérations / connexions / audit, utilisateurs en ligne et supervision système, profil.

| Côté (choisir un) | Options | Port |
| --- | --- | --- |
| Back-end | Java Spring Boot 4.1 / Node NestJS 12 | les deux sur `localhost:8080` |
| Front-end | `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` | 5666 / 6001 / 5777 / 5888 |

## Structure du projet

```
vben/
├── vben-admin-backend/              # Back-end
│   ├── docs/api-contract.md         # Contrat d'API (référence commune)
│   ├── java-backend/                # Implémentation Java (Spring Boot)
│   ├── node-backend/                # Implémentation Node (NestJS + Prisma)
│   └── sql/init.sql                 # Base + 20 tables + données de démo (import unique)
└── vue-vben-admin-v5.7.0/           # Monorepo front-end (pnpm workspace)
    ├── apps/                        # 4 applications UI : web-antd / web-antdv-next / web-ele / web-naive
    ├── packages/                    # Paquets partagés (UI, hooks, préférences...)
    ├── internal/                    # Configurations de build et de lint
    └── scripts/                     # Scripts utilitaires
```

## Stack technique et prérequis

| Côté | Technologies |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · monorepo pnpm |
| UI front-end (1 sur 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Back-end Java | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 · knife4j 5.0 |
| Back-end Node | NestJS 12 · Fastify 5 · Prisma 7 · JWT · Swagger |
| Base de données | MySQL 8.x (utf8mb4) |

| Outil | Version | Requis pour |
| --- | --- | --- |
| Node.js | ≥ 22.18 (24 LTS recommandé) | Front-end + back-end Node |
| pnpm | ≥ 10 (`npm i -g pnpm`) | Front-end + back-end Node |
| MySQL | 8.x | Les deux back-ends |
| JDK | 25 | Back-end Java uniquement |
| Maven | 3.9+ | Back-end Java uniquement |

Une fois installés, lancez l'auto-vérification et assurez-vous que les versions respectent les prérequis :

```bash
node -v && pnpm -v && mysql --version    # front-end + back-end Node
java -version && mvn -v                  # back-end Java
```

## Démarrage rapide

### Étape 1 : initialiser la base de données

[`vben-admin-backend/sql/init.sql`](../vben-admin-backend/sql/init.sql) crée la base (`vben_admin`), les 20 tables et les données de démo en un seul fichier — partagé par les deux back-ends.

**1.1 Vérifier que MySQL est démarré**

```bash
Get-Service MySQL*            # Windows (PowerShell administrateur) — Status doit être Running
mysqladmin -uroot -p status   # macOS / Linux — l'affichage d'Uptime signifie OK
```

**1.2 Exécuter l'import**

Depuis la **racine du dépôt** (recommandé) :

```bash
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

Autres méthodes :

```sql
-- Shell interactif MySQL (après `mysql -uroot -p` ; utilisez des slashs sous Windows)
SOURCE C:/votre/chemin/vben-admin-backend/sql/init.sql;
```

Ou ouvrez `init.sql` dans un outil graphique (Navicat / DBeaver / DataGrip) et exécutez-le en entier.
(PowerShell ne prend pas en charge `<` — utilisez l'une de ces deux méthodes.)

**1.3 Vérifier l'import**

```sql
USE vben_admin;
SHOW TABLES;                          -- ~20 tables (sys_user, sys_menu, sys_role, ...)
SELECT COUNT(*) FROM sys_menu;        -- 20
SELECT username FROM sys_user;        -- vben / admin / jack
```

Si les trois requêtes correspondent, la base est prête.

> - Le script contient `CREATE DATABASE IF NOT EXISTS` et `USE vben_admin` : l'import cible donc toujours `vben_admin` ;
> - La création des tables est idempotente, mais réinsérer les données de démo échoue sur des conflits de clé primaire — **n'exécutez l'import complet qu'une seule fois** ;
> - `Access denied` = mauvais mot de passe ; `command not found` = mysql n'est pas dans le `PATH` — utilisez le chemin complet (ex. `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`).

### Étape 2 : démarrer le back-end (Java / Node, au choix)

> Les deux back-ends partagent le port 8080 — **un seul peut tourner à la fois**. La base de données est partagée : le basculement ne nécessite aucune migration.

#### Option A : back-end Java (Spring Boot 4.1)

**A-1. Démarrer** (le premier lancement télécharge les dépendances et peut prendre quelques minutes) :

```bash
cd vben-admin-backend/java-backend
mvn spring-boot:run
```

**A-2. Confirmer le démarrage** — un succès ressemble à ceci (gardez le terminal ouvert ; `Ctrl + C` pour arrêter) :

```
Tomcat started on port 8080 (http) with context path '/api'
Started BackendApplication in x.xxx seconds
```

**A-3. Vérifier la connectivité** — dans un nouveau terminal (une sortie JSON signifie OK) :

```bash
curl http://localhost:8080/api/auth/config
# attendu : {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**La connexion à la base de données** se trouve dans `src/main/resources/application-dev.yml` et peut être surchargée par des variables d'environnement :

| Variable | Défaut | Description |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Hôte / port de la base |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `123456` | Utilisateur / mot de passe de la base |

**Autres réglages clés** (`src/main/resources/application.yml`) :

| Clé | Description |
| --- | --- |
| `server.port` / `context-path` | `8080` / `/api` |
| `sa-token.timeout` | Durée de vie de l'accessToken (secondes, 7200 par défaut) |
| `vben.auth.refresh-token-days` | Durée de vie du refreshToken en jours (7 par défaut) |
| `vben.auth.login-methods.*` | Interrupteurs des méthodes de connexion (compte uniquement par défaut) |
| `vben.auth.sms-mock` / `email-mock` | Simulation SMS/e-mail (codes renvoyés dans les réponses ; à désactiver en production) |
| `vben.auth.upload-dir` | Répertoire de téléversement (`./uploads` par défaut) |
| `app.message.mail-enabled` | Interrupteur des notifications e-mail du centre de messages |
| `app.tenant.enabled` | Interrupteur multi-tenant |

> **Échecs courants** :
> - `Connection refused` près des journaux de base de données → MySQL est arrêté ou les identifiants ne correspondent pas ;
> - `Port 8080 was already in use` → un autre processus (peut-être le back-end Node) occupe 8080 — arrêtez-le d'abord ;
> - Erreurs de compilation liées à la version du JDK → vérifiez que `java -version` est 25 et que `JAVA_HOME` pointe vers le JDK 25.

#### Option B : back-end Node (NestJS 12 + Fastify 5 + Prisma 7)

**B-1. Installer les dépendances et préparer le fichier d'environnement** :

```bash
cd vben-admin-backend/node-backend
pnpm install

# .env n'est pas versionné (ignoré par .gitignore) — créez-le depuis le modèle au premier lancement
cp .env.example .env            # macOS / Linux / Git Bash
Copy-Item .env.example .env     # Windows PowerShell
```

**B-2. Vérifier la connexion à la base** : ouvrez `.env` et assurez-vous que `DATABASE_URL` correspond aux identifiants de l'étape 1 (`root/123456` par défaut).

**B-3. Générer le client Prisma** (obligatoire au premier lancement, sinon le démarrage échoue) :

```bash
pnpm db:generate
# sortie attendue : ✔ Generated Prisma Client
```

**B-4. Démarrer le back-end** :

```bash
pnpm dev              # mode développement (rechargement à chaud tsx watch)
# ou pnpm build && pnpm start   # exécuter la sortie compilée
```

**B-5. Confirmer le démarrage** — un succès ressemble à ceci (gardez le terminal ouvert ; `Ctrl + C` pour arrêter) :

```
数据库连接成功
Nest application successfully started
服务启动: http://localhost:8080
API 文档: http://localhost:8080/api/docs
```

**B-6. Vérifier la connectivité** — dans un nouveau terminal (une sortie JSON signifie OK) :

```bash
curl http://localhost:8080/api/auth/config
# attendu : {"code":0,"data":{"account":true,...},"error":null,"message":"ok"}
```

**Réglages clés de `.env`** (modèle : `.env.example`) :

| Variable | Défaut (modèle) | Description |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://root:123456@localhost:3306/vben_admin` | URL de la base de données |
| `PORT` | `8080` | Port du serveur (doit correspondre au proxy front-end) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | valeurs de dev | Secrets de signature JWT, **à changer en production** |
| `ACCESS_TOKEN_EXPIRES` / `REFRESH_TOKEN_DAYS` | `2h` / `7` | Durées de vie des jetons |
| `LOGIN_METHODS_ACCOUNT/PHONE/QRCODE/REGISTER/OAUTH` | seul `ACCOUNT=true` | Interrupteurs de connexion ; la page de connexion s'y adapte |
| `PHONE_AUTO_REGISTER` / `OAUTH_AUTO_REGISTER` | `false` | Création automatique du compte lors de la première connexion téléphone/OAuth (garder `false` en production) |
| `UPLOAD_DIR` | `./uploads` | Répertoire de téléversement |
| `SMS_MOCK` / `EMAIL_MOCK` | `true` | Simulation SMS/e-mail (codes renvoyés ; à désactiver en production) |

Autres commandes : `pnpm build` (compiler vers `dist/`), `pnpm db:studio` (explorateur de données visuel Prisma).

> **Échecs courants** :
> - `Cannot find module '@prisma/client'` → vous avez sauté `pnpm db:generate` ;
> - `Can't reach database server` → MySQL est arrêté ou `.env` est incorrect ;
> - `Port 8080 is already in use` → un autre processus (peut-être le back-end Java) occupe 8080 — arrêtez-le d'abord ;
> - `[ERR_PNPM_IGNORED_BUILDS]` lors de `pnpm install` → vérifiez que toutes les entrées `allowBuilds` de `pnpm-workspace.yaml` sont à `true` (préconfiguré dans le dépôt), puis réinstallez.

### Étape 3 : démarrer le front-end (1 application UI sur 4)

| Application | Framework UI | Port de dev | Commande de démarrage |
| --- | --- | --- | --- |
| `web-antd` | Ant Design Vue 4 | 5666 | `pnpm dev:antd` |
| `web-antdv-next` | Ant Design Vue Next | 6001 | `pnpm dev:antdv-next` |
| `web-ele` | Element Plus | 5777 | `pnpm dev:ele` |
| `web-naive` | Naive UI | 5888 | `pnpm dev:naive` |

**F-1. Installer les dépendances front-end** (première fois ; installe les 4 applications d'un coup, plusieurs centaines de Mo à télécharger) :

```bash
cd vue-vben-admin-v5.7.0
pnpm install
```

**F-2. Démarrer l'application choisie** (version Ant Design Vue, par exemple) :

```bash
pnpm dev:antd        # équivaut à pnpm --filter @vben/web-antd dev
```

**F-3. Confirmer le démarrage** (le premier lancement préchauffe les dépendances ; ~20–40 secondes) :

```
VITE v8.0.13  ready in xxxx ms

  ➜  Local:   http://localhost:5666/
  ➜  Network: http://192.168.x.x:5666/
```

**F-4. Ouvrir le navigateur et se connecter** : visitez `http://localhost:5666` ; vous êtes redirigé vers la page de connexion — complétez le captcha à glissière et utilisez un compte de démo (voir étape 4).

**F-5. Passer à une autre UI (facultatif)** : arrêtez l'application en cours et changez la commande (ports dans le tableau ci-dessus) :

```bash
pnpm dev:ele           # Element Plus → http://localhost:5777
pnpm dev:naive         # Naive UI → http://localhost:5888
pnpm dev:antdv-next    # Ant Design Vue Next → http://localhost:6001
```

> - **La liaison front-end ↔ back-end est automatique** : le `vite.config.ts` de chaque application inclut un proxy `/api/**` → `http://localhost:8080/api/**`. Avec le back-end sur le port 8080 par défaut, aucune configuration front-end n'est nécessaire ; pour un autre port, mettez à jour `proxy.target` dans `apps/<votre-app>/vite.config.ts` ;
> - **Échecs courants** : `pnpm install` bloque → utilisez un miroir (`pnpm config set registry https://registry.npmmirror.com`) puis réessayez ; les appels API renvoient 500/404 → le back-end est arrêté ou le port diffère ; port occupé → modifiez `VITE_PORT` dans `apps/<votre-app>/.env.development` et redémarrez.

### Étape 4 : se connecter

Comptes de démo (mot de passe `123456` pour tous) :

| Compte | Rôle | Page d'accueil | Portée |
| --- | --- | --- | --- |
| **vben** | super administrateur | /analytics | tous les menus et permissions de boutons |
| **admin** | administrateur | /workspace | gestion système / supervision / outils |
| **jack** | utilisateur | /analytics | gestion des utilisateurs en lecture seule + gestion des rôles ; accès non autorisé → 403/404 |

Atterrir sur la page analytics/workspace signifie que le **déploiement est terminé**.

> Les entrées connexion par téléphone / QR / inscription / OAuth sont contrôlées par les interrupteurs du back-end (voir les tableaux de l'étape 2) et apparaissent automatiquement sur la page de connexion lorsqu'elles sont activées. En mode simulation, les codes de vérification sont renvoyés directement dans les réponses API.

## Déploiement en production

### Compilation du front-end

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm build:antd      # équivaut à pnpm --filter @vben/web-antd build ; sortie : apps/web-antd/dist
```

Autres UI : `pnpm build:ele` / `pnpm build:naive` / `pnpm build:antdv-next`.

**Exemple de configuration Nginx** :

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vben-dist;             # pointer vers le répertoire dist
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # repli SPA
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;  # le back-end inclut déjà le préfixe /api
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10m;          # pièces jointes
    }
}
```

### Compilation du back-end

```bash
# Java (arrêtez d'abord le processus en cours, sinon le jar est verrouillé)
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Checklist de sécurité pour la production

- [ ] Changer le mot de passe par défaut `123456` de la base ; désactiver ou changer les comptes de démo
- [ ] Changer `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` dans le `.env` Node
- [ ] Désactiver la simulation SMS/EMAIL (Java : `vben.auth.sms-mock=false` ; Node : mêmes clés dans `.env`) et brancher de vrais fournisseurs
- [ ] Désactiver la documentation knife4j / Swagger (Java : `springdoc.api-docs.enabled=false`)
- [ ] Restreindre les méthodes de connexion (désactiver l'inscription et la création automatique téléphone/OAuth)
- [ ] Activer les cookies sécurisés derrière HTTPS (Java : `vben.auth.cookie-secure=true` ; Node : `COOKIE_SECURE=true`)

## Fonctionnement

**Modèle de permissions** : RBAC (utilisateur → rôle → menu/bouton) avec un jeu de codes partagé des deux côtés.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → routes front-end / menu latéral
                                                              └─ type=button → auth_code (codes de boutons)
```

- **Permissions de menu** : le back-end renvoie un arbre de routes par utilisateur (`GET /menu/all`) ; les routes non autorisées ne sont jamais enregistrées côté front-end (accès direct → 404) ;
- **Permissions de bouton** : `auth_code` (ex. `AC_100010` = créer un utilisateur) contrôle la visibilité des boutons via la directive `v-access` / `hasAccessByCodes` côté front-end, et est appliqué par `@SaCheckPermission` (Java) / `@Permissions` + `PermissionGuard` (Node) côté back-end ;
- **Super administrateur** : un rôle avec `code=super` possède toutes les permissions.

**Authentification** : la connexion émet deux jetons — accessToken (2 h, localStorage, envoyé via `Authorization: Bearer <token>`) + refreshToken (7 jours, cookie HttpOnly, résistant au XSS). À l'expiration de l'accessToken, le front-end appelle silencieusement `POST /auth/refresh` ; la déconnexion / déconnexion forcée révoque les deux jetons.

## Documentation API

| Back-end | URL |
| --- | --- |
| Java (knife4j) | <http://localhost:8080/api/doc.html> |
| Node (Swagger) | <http://localhost:8080/api/docs> |

Pour le débogage en direct : appelez `POST /auth/login` pour obtenir un accessToken, puis collez `Bearer <accessToken>` dans la boîte de dialogue Authorize. Le contrat d'API complet se trouve dans [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## FAQ

**Q1 : toutes les requêtes échouent / la connexion ne répond pas ?**
Vérifiez dans l'ordre : ① le back-end tourne-t-il sur 8080 (`curl http://localhost:8080/api/auth/config` doit renvoyer du JSON) ; ② `init.sql` a-t-il été importé ; ③ les identifiants de la base sont-ils corrects (voir les journaux de démarrage) ; ④ des processus obsolètes traînent-ils ?

**Q2 : le port 8080 est déjà utilisé / comment basculer entre les back-ends ?**
Java et Node partagent 8080 — ils ne peuvent pas tourner simultanément. Pour basculer, arrêtez l'un et démarrez l'autre, puis rafraîchissez le front-end et reconnectez-vous (base partagée, aucune migration). Pour les comparer côte à côte : changez `PORT` dans le `.env` Node (ex. 8081) et mettez à jour `proxy.target` dans le `vite.config.ts` du front-end.

**Q3 : je ne vois pas les entrées connexion téléphone / inscription / OAuth ?**
Les méthodes de connexion sont contrôlées par les interrupteurs du back-end et transmises via `GET /auth/config` : activez-les dans `vben.auth.login-methods.*` (Java `application.yml`) ou `LOGIN_METHODS_*` (Node `.env`).

**Q4 : je ne reçois jamais les codes de vérification ?**
Les environnements de développement activent la simulation SMS/e-mail par défaut — les codes sont renvoyés directement dans les réponses API. Branchez de vrais fournisseurs et désactivez les simulations en production.

**Q5 : le téléversement de pièces jointes échoue avec une erreur de taille ?**
Le back-end limite un fichier à ≤ 5 Mo (plafond multipart Java de 10 Mo avec un contrôle métier de 5 Mo). Derrière Nginx, définissez aussi `client_max_body_size 10m;`.

**Q6 : « Exécuter une fois » sur une tâche planifiée signale un bean/méthode introuvable ?**
Le format de la cible d'invocation est `beanName.methodName` (ex. `sampleJob.run`) et le bean référencé doit exister dans le code du back-end (Java : `@Component("xxx")` ; Node : méthode de tâche enregistrée).

## Licence

[MIT](../LICENSE)
