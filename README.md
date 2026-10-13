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
cp .env.example .env        # then fill in the JWT secrets
docker-compose up -d        # start PostgreSQL
yarn migration:run
yarn start:dev
```

The API runs at `http://localhost:3000/api/v1`.
Swagger UI is available at `http://localhost:3000/api/docs`.

## Environment variables

| Variable                                    | Description                         |
| ------------------------------------------- | ----------------------------------- |
| `NODE_ENV`, `PORT`                          | Runtime mode and HTTP port          |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection |
| `DB_PORT_EXPOSED`                           | Host port mapped by docker-compose  |
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
