# Veille Technologique Frontend

Application Angular 21 de gestion de tableaux Kanban, développée dans le cadre de la veille technologique M1 — La Plateforme. Le frontend consomme l'API REST via le gateway BFF (kanban-gateway) — aucun JWT n'est manipulé côté client.

## Sommaire

- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commandes](#commandes)
- [Structure du projet](#structure-du-projet)
- [Routes](#routes)
- [Architecture](#architecture)
- [Sécurité](#sécurité)
- [Build et déploiement](#build-et-déploiement)

---

## Technologies

| Dépendance | Version | Usage |
|---|---|---|
| Angular | 21.2.24 | Framework principal |
| Angular Material / CDK | 21.2.14 | Composants UI et drag & drop |
| TypeScript | 5.9.3 | Langage |
| RxJS | 7.8.2 | Flux asynchrones HTTP |
| Tailwind CSS | 4.3.3 | Styles utilitaires |
| Vitest | 4.1.11 | Tests unitaires |
| Oxlint | 1.86.0 | Lint |
| Prettier | 3.9.9 | Formatage |

---

## Prérequis

- Node.js `^20.19.0`, `^22.12.0` ou `^24.0.0`
- npm `10.x`
- Le gateway `kanban-gateway` doit tourner sur `http://localhost:8090`

---

## Installation

```bash
git clone https://github.com/lucas-martinie-de-maisonneuve/veille-techno-frontend
cd veille-techno-frontend
npm ci
```

---

## Configuration

Les URLs d'API sont définies dans `src/environments/` :

**`src/environments/environment.ts`** (développement) :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8090',
};
```

**`src/environments/environment.prod.ts`** (production) :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-domaine.com',
};
```

> ⚠️ En production, remplacer l'URL par une URL HTTPS et servir le frontend en HTTPS.

---

## Commandes

```bash
npm start          # Lance ng serve — http://localhost:4200
npm run build      # Build de production dans dist/
npm run watch      # Build de développement avec rechargement
npm test           # Tests unitaires via Vitest
npm run lint       # Vérifie src/ avec Oxlint
npm run format     # Formate les fichiers TypeScript sous src/
npm run format:check  # Vérifie le formatage
```

---

## Structure du projet

```
src/
  app/
    core/
      guards/           authGuard, noAuthGuard, adminGuard
      interceptors/     auth-interceptor (withCredentials sur toutes les requêtes)
      layout/
        header/         Header component — navigation, profil, logout
      services/
        auth.ts         AuthService — session, login, logout, currentUser signal
        toast.ts        ToastService — notifications succès/erreur
      profile-dialog/   Dialog de modification du profil utilisateur
    features/
      auth/
        login/          Page de connexion avec animation collapseOut
        register/       Page d'inscription avec animation expandIn
      board/
        board/          Board component — gestion des listes, drag & drop colonnes
        list-column/    ListColumn component — cartes, drag & drop, titre inline
        card-dialog/    CardDialog component — vue détaillée Jira-like
      admin/
        users/          Page d'administration — liste, recherche, pagination, édition
    shared/
      components/
        confirm-dialog/ Dialog de confirmation réutilisable
      models/           user.model.ts, list.model.ts, card.model.ts
      services/
        list.ts         ListService — CRUD listes
        card.ts         CardService — CRUD cartes
  environments/
    environment.ts      Configuration développement
    environment.prod.ts Configuration production
  styles.scss           Styles globaux, variables CSS, animations
```

---

## Routes

| Route | Guard | Description |
|---|---|---|
| `/login` | `noAuthGuard` | Connexion — redirige vers `/board` si déjà connecté |
| `/register` | `noAuthGuard` | Inscription — redirige vers `/board` si déjà connecté |
| `/board` | `authGuard` | Tableau principal |
| `/admin/users` | `adminGuard` | Gestion des utilisateurs (admin uniquement) |
| `/` | — | Redirige vers `/board` |
| `/**` | — | Redirige vers `/board` |

Les composants sont chargés à la demande (`loadComponent`) — lazy loading par route.

---

## Architecture

### Flux d'authentification

```
Angular (4200) → kanban-gateway (8090) → veille-techno-backend (3000)
```

- Angular envoie toutes les requêtes au **gateway** avec `withCredentials: true`
- Le gateway gère la session Redis et le cookie `connect.sid` httpOnly
- **Le JWT ne transite jamais par le navigateur** — Angular ne le voit jamais

### Signals et Zoneless

L'application utilise `provideZonelessChangeDetection()` — pas de Zone.js. La réactivité repose sur les **signals Angular** :

```typescript
currentUser = signal<User | null>(null);
cards = signal<Card[]>([]);
loading = signal(true);
```

### Drag & Drop

- **Colonnes** : `CdkDropList` horizontal sur `board-columns`, `cdkDrag` sur chaque `.board-column`
- **Cartes** : `CdkDropList` vertical sur chaque `list-column`, connectées entre elles via `[cdkDropListConnectedTo]`
- Positions persistées via `PATCH /lists/:id` et `PATCH /cards/:id`

### Guards

```typescript
authGuard    // Vérifie la session via GET /users/me
noAuthGuard  // Redirige vers /board si déjà connecté
adminGuard   // Vérifie la session ET role === 'admin'
```

---

## Sécurité

- `withCredentials: true` sur toutes les requêtes HTTP via `auth-interceptor`
- Aucun token stocké en `localStorage` ou `sessionStorage`
- Cookie `connect.sid` httpOnly géré par le navigateur automatiquement
- Validations côté client sur tous les formulaires (email, minLength, required)
- `adminGuard` protège la route `/admin/users` côté client — **la sécurité réelle est assurée par l'API** (vérification du rôle sur chaque endpoint)

---

## Build et déploiement

```bash
npm run build
```

Le build de production est dans `dist/`. Le serveur web doit réécrire toutes les routes vers `index.html` (SPA routing).

Budgets de taille configurés dans `angular.json` :
- Bundle initial : avertissement à 500 kB, erreur à 1 MB
- Style composant : avertissement à 4 kB, erreur à 8 kB

### Dépôts liés

| Repo | Description |
|---|---|
| [veille-techno-backend](https://github.com/lucas-martinie-de-maisonneuve/veille-techno-backend) | API REST NestJS |
| [kanban-gateway](https://github.com/lucas-martinie-de-maisonneuve/kanban-gateway) | Gateway BFF NestJS — session Redis |
