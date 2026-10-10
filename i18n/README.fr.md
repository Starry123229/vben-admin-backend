<div align="center">

# Vben Admin — Système d'administration

<p>Framework d'administration open source (Vue 3 Admin Template / Dashboard) : solution full-stack basée sur Vben Admin 5.7 — front-end Vue 3 + Vite, doubles back-ends Java Spring Boot 4 / Node.js NestJS 12, RBAC, double jeton JWT, MySQL. Prêt à l'emploi, sous licence MIT, utilisation commerciale gratuite</p>

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vitejs.dev)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot%204.1-6db33f.svg)](https://spring.io)
[![Node](https://img.shields.io/badge/Node-NestJS%2012-40598f.svg)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-9.x-4479a1.svg)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#licence)
[![GitHub Stars](https://img.shields.io/github/stars/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Starry123229/vben-admin-backend?style=social)](https://github.com/Starry123229/vben-admin-backend/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Starry123229/vben-admin-backend)](https://github.com/Starry123229/vben-admin-backend/issues)

[简体中文](../README.md) | [繁體中文](./README.zh-TW.md) | [English](./README.en.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | **Français** | [Deutsch](./README.de.md) | [Español](./README.es.md) | [Русский](./README.ru.md)

</div>

---

## Structure du projet

```
vben/
├── vben-admin-backend/              # Back-end
│   ├── docs/api-contract.md         # Contrat d'API (référence commune)
│   ├── java-backend/                # Implémentation Java (Spring Boot)
│   ├── node-backend/                # Implémentation Node (NestJS + Prisma)
│   └── sql/init.sql                 # Base + 20 tables + données de démo (import unique)
└── vue-vben-admin-v5.7.0/           # Monorepo front-end (pnpm workspace)
    ├── apps/                        # 4 applications UI
    ├── packages/                    # Paquets partagés
    └── internal/                    # Configurations de build et de lint
```

## Stack technique

| Côté | Technologies |
| --- | --- |
| Front-end | Vue 3.5 · Vite 8 · TypeScript · Pinia · monorepo pnpm |
| UI front-end (1 sur 4) | Ant Design Vue 4 / Ant Design Vue Next / Element Plus / Naive UI |
| Back-end Java | Spring Boot 4.1 (JDK 25) · Sa-Token 1.45 · MyBatis-Plus 3.5.17 |
| Back-end Node | NestJS 12 · Fastify 5 · Prisma 7 · JWT |
| Base de données | MySQL 9.x (utf8mb4) |

## Démarrage rapide

### 1. Initialiser la base de données

```bash
# Vérifier que MySQL est démarré, puis importer
mysql -uroot -p < vben-admin-backend/sql/init.sql
```

> `init.sql` crée la base (`vben_admin`), les 20 tables et les données de démo en un seul fichier — partagé par les deux back-ends.

### 2. Démarrer le back-end (Java / Node, au choix)

```bash
# Option A : back-end Java
cd vben-admin-backend/java-backend
mvn spring-boot:run

# Option B : back-end Node
cd vben-admin-backend/node-backend
pnpm install
cp .env.example .env          # Windows : Copy-Item .env.example .env
pnpm db:generate
pnpm dev
```

> Les deux back-ends partagent le port 8080 — un seul peut tourner à la fois. Identifiants BD par défaut : `root/123456`. Voir les fichiers de configuration pour modifier.

### 3. Démarrer le front-end (1 application sur 4)

```bash
cd vue-vben-admin-v5.7.0
pnpm install
pnpm dev:antd        # Ant Design Vue  → http://localhost:5666
# pnpm dev:ele       # Element Plus     → http://localhost:5777
# pnpm dev:naive     # Naive UI         → http://localhost:5888
# pnpm dev:antdv-next # Ant Design Vue Next → http://localhost:6001
```

### 4. Se connecter

Comptes de démo (mot de passe `123456` pour tous) :

| Compte | Rôle | Portée |
| --- | --- | --- |
| **vben** | super administrateur | tous les menus et permissions de boutons |
| **admin** | administrateur | gestion système / supervision / outils |
| **jack** | utilisateur | gestion des utilisateurs en lecture seule + gestion des rôles |

## Déploiement en production

### Compilation du front-end

```bash
cd vue-vben-admin-v5.7.0
pnpm build:antd      # sortie : apps/web-antd/dist
```

### Compilation du back-end

```bash
# Java
cd vben-admin-backend/java-backend
mvn clean package -DskipTests
java -jar target/vben-backend-0.0.1-SNAPSHOT.jar

# Node
cd vben-admin-backend/node-backend
pnpm build && pnpm start
```

### Exemple de configuration Nginx

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

## Fonctionnement

**Modèle de permissions** : RBAC (utilisateur → rôle → menu/bouton) avec un jeu de codes partagé des deux côtés.

```
sys_user ──< sys_user_role >── sys_role ──< sys_role_menu >── sys_menu
                                                              ├─ type=menu   → routes front-end / menu latéral
                                                              └─ type=button → auth_code (codes de boutons)
```

**Flux d'authentification** :

```
Connexion → émission de deux jetons
  ├─ accessToken (2 h, localStorage, envoyé via Authorization: Bearer)
  └─ refreshToken (7 jours, cookie HttpOnly, résistant au XSS)
      └─ accessToken expiré → le front-end appelle silencieusement POST /auth/refresh
      └─ déconnexion / déconnexion forcée → les deux jetons sont révoqués
```

**Permissions de menu et de bouton** :

- **Permissions de menu** : le back-end renvoie un arbre de routes par utilisateur (`GET /menu/all`) ; les routes non autorisées ne sont jamais enregistrées côté front-end.
- **Permissions de bouton** : `auth_code` (ex. `AC_100010`) contrôle la visibilité des boutons via la directive `v-access` et est appliqué par `@SaCheckPermission` (Java) / `@Permissions` (Node) côté back-end.
- **Super administrateur** : un rôle avec `code=super` possède toutes les permissions.

## Documentation API

| Back-end | URL |
| --- | --- |
| Java (knife4j) | http://localhost:8080/api/doc.html |
| Node (Swagger) | http://localhost:8080/api/docs |

Contrat d'API complet : [`vben-admin-backend/docs/api-contract.md`](../vben-admin-backend/docs/api-contract.md).

## ❓ Questions fréquentes

**1. Comment basculer entre les back-ends Java et Node ?**
Les deux back-ends implémentent le même contrat d'API et partagent la même base de données ainsi que le port 8080 — arrêtez l'un, démarrez l'autre. Aucune modification du front-end n'est requise.

**2. Quels sont les identifiants de connexion par défaut ?**
Voir « Démarrage rapide → Se connecter » ci-dessus. Tous les comptes de démo utilisent le mot de passe `123456`.

**3. Mot de passe oublié / réinitialiser les données de démo ?**
Relancez `mysql -uroot -p < vben-admin-backend/sql/init.sql` pour restaurer toutes les données de démo (attention : les données existantes seront effacées).

**4. PostgreSQL / Oracle est-il pris en charge ?**
Le script SQL est actuellement en dialecte MySQL (utf8mb4). Côté Java (MyBatis-Plus) comme côté Node (Prisma), les bases pour changer de base de données existent — les PR sont les bienvenues.

**5. Le port est déjà utilisé — comment le modifier ?**
Le back-end utilise par défaut le port `8080` ; les quatre applications front-end utilisent `5666 / 5777 / 5888 / 6001`. Modifiez-les dans les fichiers de configuration de chaque partie.

**6. Puis-je l'utiliser commercialement ?**
Oui. La licence MIT autorise un usage commercial gratuit — conservez simplement la mention de copyright.

## 💬 Communauté et retours

- 🐛 Rapports de bugs / suggestions : [Issues](https://github.com/Starry123229/vben-admin-backend/issues)
- 💡 Questions / partage d'expérience : [Discussions](https://github.com/Starry123229/vben-admin-backend/discussions)

## Licence

[MIT](../LICENSE)
