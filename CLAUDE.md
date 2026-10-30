# CLAUDE.md — Shopee Clone API

NestJS REST API for a Shopee-like e-commerce platform.
Stack: NestJS 11 + TypeORM + PostgreSQL + Swagger + Jest.
MVP features: Auth (JWT), Users, Products (options, SKUs, media), Cart, Orders.

---

## Guiding Principle: Readability First

Code is read far more often than it is written. Every rule below serves that goal.

- When a guideline would make code harder to follow, choose the readable version and say why in the PR
- Prefer the simplest design that handles today's requirements. Add an abstraction when a second real use case appears, not before
- A reader should be able to go from controller → service → repository in a few jumps, without chasing tokens and wrappers

---

## Architecture

```
src/
├── modules/              # auth, users, products, options, media, cart, orders
│   └── <feature>/
│       ├── domain/           # TypeORM entities, value objects, domain rules
│       ├── application/      # services (use cases), DTOs, repository interfaces
│       ├── infrastructure/   # repository implementations, strategies, guards
│       └── <feature>.module.ts
├── common/               # decorators, filters, interceptors, pipes, value objects
├── config/               # database, jwt, swagger
└── main.ts
```

Dependency direction: **controller → service → repository interface ← repository implementation**.

- Controllers: HTTP only (params, DTOs, Swagger). No business logic
- Services: business rules. Never touch `Repository<T>` or the HTTP request directly
- Repositories: data access only. No business decisions

---

## Business Invariants (must follow)

These protect money and data. They override every style guideline.

1. **Never trust the client for money.** Prices, discounts, shipping fees and totals are computed on the server from the database. A client-sent value may only be compared, never used
2. **Multi-write operations run in one transaction.** Use `@Transactional()` from `typeorm-transactional` whenever a use case writes more than one row or table
3. **Stock changes are atomic.** Decrement with a single conditional `UPDATE … SET stock = stock - :q WHERE stock >= :q` and check affected rows. Never read stock, compare in code, then write
4. **Status changes go through an explicit transition table** (see `orders/domain/order-status.ts`) that states who may make each transition
5. **Authorize by ownership and role.** Every query for user-owned data filters by the current user id

---

## Design Guidelines

### Repositories

- **One interface and one DI token per aggregate**: `IProductRepository` / `PRODUCT_REPOSITORY`
- Create a narrower interface only when **another module** needs a small subset, e.g. `IProductSkuStockRepository` used by orders
- Services inject the token: `@Inject(PRODUCT_REPOSITORY)`, never `@InjectRepository(ProductEntity)`
- Do not split read/write (Query/Command) interfaces unless they are backed by different data sources

### Services and Methods

- One service per use-case area. Split a service when it mixes unrelated responsibilities, not because of line count
- Soft limits: methods around 20 lines, classes around 150 lines. Exceeding them is a prompt to look, not an error
- Prefer guard clauses and early returns over `else`; avoid nesting deeper than two levels
- Use full words; no abbreviations (`quantity`, not `qty`)
- Extract a private method when it gives a step a meaningful name, not to satisfy a line limit

### Value Objects

- Use them where they enforce a rule: `Money`, `Quantity`, `Email`
- Do not wrap primitives that carry no validation or behaviour (ids, names, flags)
- Wrap an array in a collection class only when it has real behaviour

---

## Naming Conventions

| Layer                | Convention                                 | Example                                   |
| -------------------- | ------------------------------------------ | ----------------------------------------- |
| Module               | `<Feature>Module`                          | `ProductsModule`                          |
| Controller           | `<Feature>Controller`                      | `ProductController`                       |
| Service              | `<Feature>Service` or a use-case noun      | `ProductService`, `OrderStockReservation` |
| Repository interface | `I<Feature>Repository`                     | `IProductRepository`                      |
| Repository token     | `<FEATURE>_REPOSITORY`                     | `PRODUCT_REPOSITORY`                      |
| Repository impl      | `<Feature>Repository`                      | `ProductRepository`                       |
| Entity               | `<Feature>Entity`                          | `ProductEntity`                           |
| DTO (input)          | `Create<Feature>Dto`, `Update<Feature>Dto` | `CreateProductDto`                        |
| DTO (output)         | `<Feature>Response`                        | `ProductResponse`                         |
| Value object         | domain noun                                | `Money`, `Email`                          |

- Avoid vague suffixes: `Manager`, `Handler`, `Processor`, `Utils`, `Helper`, `Data`, `Info`
- Use business language (order, SKU, stock, checkout) over technical jargon

---

## Error Handling

- Services and value objects throw NestJS HTTP exceptions directly: `NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`, `UnauthorizedException`
- Use `ConflictException` (409) for business conflicts such as insufficient stock
- The global filter (`common/filters/http-exception.filter.ts`) formats every error as:
  ```json
  { "status": 404, "message": "Order 99 not found", "data": null }
  ```
- Successful responses are wrapped by `TransformResponseInterceptor` as `{ status, message, data }`; set the message with `@ResponseMessage()`

---

## Comments

Explain **why**, never what. If a comment restates the code, rename things instead.

```typescript
// GOOD: explains a non-obvious rule
// Conditional UPDATE is atomic in Postgres, so concurrent orders cannot both take the last unit

// BAD: restates the code
// Decrease stock by quantity
```

---

## Database (TypeORM + PostgreSQL)

- Entities live in each module's `domain/` folder
- Primary keys: `@PrimaryGeneratedColumn('increment', { type: 'bigint' })`
- Timestamps: `@CreateDateColumn({ name: 'created_at' })`, `@UpdateDateColumn({ name: 'updated_at' })`
- **`bigint` columns come back from Postgres as strings.** For new non-key numbers (quantity, stock, status) use `int`, or add a column transformer. Never compare a `bigint` column with `===` against a number without converting
- **Money:** store VND as an integer (`int`/`bigint` with a transformer). Do not use `double precision` for new money columns
- Schema changes require a migration in `src/database/migrations/`. `synchronize` is allowed only for `NODE_ENV=development`
- Seeds go in `src/database/seeds/`

---

## Auth

- Global JWT guard; opt out with `@Public()`
- Access token lifetime from `JWT_EXPIRES_IN` (15m), refresh token from `JWT_REFRESH_EXPIRES_IN` (7d)
- Passwords hashed with bcrypt, 12 salt rounds
- Read the current user with `@CurrentUser('userId')`

---

## API & Swagger

- All routes prefixed with `/api/v1`; Swagger UI at `/api/docs`
- Controllers: `@ApiTags`, plus `@ApiBearerAuth` when protected
- Endpoints: `@ApiOperation` and `@ApiResponse` for the success case and each error the service can throw
- DTO fields: `@ApiProperty` with an `example`
- The global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted`: unknown fields are rejected with 400

---

## Testing

- **Unit** (`*.spec.ts` next to the file): business logic with repositories mocked at the interface
- **Integration / E2E** (`test/*.e2e-spec.ts`): real Postgres, Supertest for HTTP
- Structure every test as Arrange / Act / Assert
- Name tests as sentences: `should <expected behaviour> when <condition>`
- Test behaviour, not implementation details
- Every business invariant above needs a test that would fail if the rule were broken
- When a service uses `@Transactional()`, mock it in unit tests:
  ```typescript
  jest.mock('typeorm-transactional', () => ({
    Transactional: () => (_t: object, _k: string, d: PropertyDescriptor) => d,
  }));
  ```
- Coverage targets: statements ≥ 80%, branches ≥ 70%

---

## Docker & Environment

- `Dockerfile`: multi-stage (`builder` → `development` → `production`)
- `docker-compose.yml`: app + Postgres
- Required variables are documented in `.env.example`. Never commit `.env` or hardcode secrets

---

## Git & Pull Requests

- Branches: `feat/<feature>`, `fix/<bug>`, `refactor/<area>`, `docs/<topic>`, `chore/<task>`
- Commits follow Conventional Commits: `fix(orders): reserve stock atomically`
- Every change goes through a PR. Do not push directly to `main`
- A PR must pass `yarn lint`, `yarn test` and `yarn build`

---

## Commands

```bash
yarn start:dev            # watch mode
yarn lint                 # eslint --fix
yarn test                 # unit tests
yarn test:e2e             # e2e (needs Postgres)
yarn test:cov             # coverage
yarn build

yarn migration:generate -- src/database/migrations/<Name>
yarn migration:run
yarn migration:revert

docker-compose up -d
docker-compose down
```

---

## Known Gaps (as of 2026-10-14)

The codebase does not yet meet every rule above. Do not assume these exist; fix them in dedicated PRs.

- No migrations yet: `src/database/` does not exist
- Money columns use `double precision`; several numeric columns use `bigint` without a transformer
- Refresh tokens are returned in the response body (not an httpOnly cookie) and are not stored, so they cannot be revoked
- `orderCode` uses `Date.now()` and can collide
- The jest config key is misspelled `coverageThresholds`, so coverage targets are not enforced; there is no CI pipeline yet
- CORS is fully open; no helmet or rate limiting
