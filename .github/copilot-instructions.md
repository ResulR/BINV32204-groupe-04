# Gesta — instructions pour Copilot

## Commandes

Toutes les commandes se lancent depuis la racine du dépôt (`projet/`).

```bash
npm ci
npm run setup
npm run dev
```

- `npm run setup` crée `backend/.env` et initialise la base de démonstration.
- `npm run db:init` applique les migrations et complète une base vide avec les données de démo.
- `npm run db:reset` recrée la base ; arrêter `npm run dev` avant, notamment sous Windows.
- `npm run lint` lance Oxlint sur les deux workspaces et refuse les avertissements.
- `npm run typecheck` vérifie TypeScript sur le backend et le frontend.
- `npm test` lance tous les tests Vitest.
- `npm run build` compile le backend et le frontend.
- `npm run check` enchaîne lint, typecheck, tests et build.

Pour cibler un test, utiliser le workspace concerné :

```bash
npm run test -w backend -- tests/auth.test.ts
npm run test -w frontend -- tests/App.test.tsx
npm run test -w backend -- tests/auth.test.ts -t "nom du test"
```

Le projet requiert Node.js `>=22.14.0`. L'API écoute sur `http://localhost:3000` et
Vite sur `http://localhost:5173`.

## Architecture

Le dépôt est un monorepo npm à deux workspaces :

- `backend/` : API Express en TypeScript et SQLite via `better-sqlite3`.
- `frontend/` : application React/Vite en TypeScript.
- `docs/` : cahier des charges, architecture et données de démonstration.

Le backend suit le flux :

```text
main.ts → app.ts → middlewares → controllers → services → repositories → SQLite
                                             ↕
                                          mappers
```

`main.ts` charge la configuration, initialise la base et démarre le serveur. `app.ts`
assemble les dépendances et les routes. Les contrôleurs valident les entrées et produisent
les réponses HTTP ; les services portent les règles métier ; les repositories contiennent
les requêtes SQL ; les mappers convertissent les lignes SQL en objets métier et DTO.
Les services ne reçoivent jamais `Request` ou `Response`.

Le frontend suit le modèle :

```text
pages → hooks → services/utils → models
  ↓
components
```

`App.tsx` est le seul endroit qui appelle `useAuth`. Les pages reçoivent la session et la
déconnexion par props. Les services frontend appellent `/api/...` ; le proxy Vite retire
`/api` avant de transmettre à l'API backend.

## Conventions spécifiques

- Les factories (`create...Repository`, `create...Service`, `create...Router`) assemblent
  les dépendances et permettent aux tests de construire une application complète avec une
  base SQLite en mémoire.
- Les erreurs applicatives sont levées avec `new HttpError(status, code, message)` puis
  sérialisées par `errorHandler` en `{ "error": { "code", "message" } }`.
- L'authentification est vérifiée côté backend : `authenticate` relit l'utilisateur, ses
  rôles et ses entreprises en base à chaque requête ; `authorize(...)` produit les 403.
  Le jeton est envoyé tel quel dans `Authorization`, sans préfixe `Bearer`.
- Les règles d'accès doivent rester dans `services/permissions.ts` et ne doivent pas être
  remplacées par un simple masquage dans l'interface.
- Les imports relatifs du backend utilisent l'extension `.ts`; TypeScript la réécrit en
  `.js` lors de la compilation.
- Les statuts en base sont des codes anglais (`PUBLISHED`) ; les libellés français sont
  présentés par le frontend.
- Toute évolution SQLite ajoute un nouveau fichier `backend/src/db/migrations/NNN_nom.sql`
  appliqué dans l'ordre ; ne jamais modifier une migration déjà appliquée.
- Les tests backend utilisent `backend/tests/helpers/testApp.ts` et une base SQLite en
  mémoire, jamais la base de développement. Les tests frontend utilisent Testing Library
  et `frontend/tests/helpers/fetchMock.ts`.
- Pour une nouvelle route ou un changement de réponse, mettre à jour
  `backend/API.md` et les requêtes correspondantes dans `backend/http/*.http`.

Consulter [docs/architecture.md](../docs/architecture.md) pour le parcours détaillé et
[backend/API.md](../backend/API.md) pour le contrat HTTP.
