# Shopee Clone API

REST API for a Shopee-like e-commerce platform.

**Stack:** NestJS 11 · TypeORM · PostgreSQL · Swagger · Jest

## Features

- **Auth** — JWT access token (15m) + refresh token (7d, httpOnly cookie)
- **Users** — profile management
- **Products** — catalog with product options and media
- **Cart** — add, update, remove items
- **Orders** — checkout with server-side price verification

## Getting started

### Prerequisites

- Node.js 20+
- Yarn
- Docker (for PostgreSQL)

### Setup

```bash
yarn install
cp .env.example .env              # then fill in the JWT secrets
docker compose up -d postgres     # PostgreSQL only; the app runs on your machine
yarn start:dev                    # NODE_ENV=development syncs the schema
```

`docker compose up -d` without a service name also starts the `app` container on port 3000, which clashes with `yarn start:dev`.

If a locally installed PostgreSQL already uses port 5432, either stop it or set `DB_PORT` and `DB_PORT_EXPOSED` to `5433` in `.env`.

### Running e2e tests

`yarn test:e2e` uses a separate database, `DB_NAME_TEST` (default `shopee_clone_test`), and drops its schema on every run. Docker creates it the first time the volume is created. For an existing volume, create it once:

```bash
docker exec shopee-clone-db createdb -U postgres shopee_clone_test
```

The API runs at `http://localhost:3000/api/v1`.
Swagger UI is available at `http://localhost:3000/api/docs`.

## Environment variables

| Variable                                    | Description                         |
| ------------------------------------------- | ----------------------------------- |
| `NODE_ENV`, `PORT`                          | Runtime mode and HTTP port          |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection |
| `DB_PORT_EXPOSED`                           | Host port mapped by docker-compose  |
| `DB_NAME_TEST`                              | Database used by `yarn test:e2e`    |
| `JWT_SECRET`, `JWT_EXPIRES_IN`              | Access token signing                |
| `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` | Refresh token signing            |

See [.env.example](.env.example).

## Scripts

```bash
yarn start:dev        # watch mode
yarn build            # compile
yarn start:prod       # run compiled build
yarn lint             # eslint
yarn format           # prettier

yarn test             # unit tests
yarn test:e2e         # end-to-end tests
yarn test:cov         # coverage

yarn migration:generate -- src/database/migrations/<name>
yarn migration:run
yarn migration:revert
```

## Project structure

```
src/
├── modules/                # auth, users, products, options, media, cart, orders
│   └── <feature>/
│       ├── domain/         # entities, value objects
│       ├── application/    # services, DTOs, interfaces
│       ├── infrastructure/ # repositories
│       └── <feature>.module.ts
├── common/                 # guards, interceptors, filters, decorators
├── config/                 # database, jwt, swagger
└── main.ts
```

Each feature is vertically sliced. Services depend on repository interfaces
(split into Query/Command) via DI tokens. See [CLAUDE.md](CLAUDE.md) for the
full coding conventions.
