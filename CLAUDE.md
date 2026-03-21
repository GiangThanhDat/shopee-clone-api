# CLAUDE.md — Shopee Clone API

## Project Overview

NestJS REST API for a Shopee-like e-commerce platform. Stack: NestJS 11 + TypeORM + PostgreSQL + Swagger + Jest.

MVP features: Auth (JWT), Products, Cart, Orders, User Profile.

---

## Architecture

```
src/
├── modules/          # Feature modules (auth, users, products, cart, orders)
│   └── <feature>/
│       ├── domain/           # Entities, value objects, domain interfaces
│       ├── application/      # Use-case services, DTOs, interfaces
│       ├── infrastructure/   # Repositories, external integrations
│       └── <feature>.module.ts
├── common/           # Shared guards, interceptors, filters, decorators, pipes
├── config/           # Configuration (database, jwt, swagger)
└── main.ts
```

Each feature is **vertically sliced** — domain, application, and infrastructure layers live together inside their module folder.

---

## SOLID Principles

### Single Responsibility Principle

- Each class/service has **one reason to change**
- Services handle business logic only — never touch HTTP, never touch DB directly
- Controllers handle HTTP only — no business logic
- Repositories handle data access only

### Open/Closed Principle

- Extend behavior through interfaces and composition, not by modifying existing classes
- Use NestJS interceptors, guards, and pipes to extend cross-cutting concerns

### Liskov Substitution Principle

- Subtypes must be substitutable for their base types
- Repository interfaces must be honoured by all implementations

### Interface Segregation Principle

- Define narrow interfaces for each use case — no fat interfaces
- Separate read (IProductQueryRepository) from write (IProductCommandRepository)

### Dependency Inversion Principle

- Services depend on interfaces/tokens, not concrete implementations
- Use NestJS DI tokens: `@Inject(PRODUCT_REPOSITORY)` not `@InjectRepository(ProductEntity)`

---

## Object Calisthenics (Hard Rules)

1. **One level of indentation per method** — extract if you need to indent deeper
2. **No `else` keyword** — use early returns / guard clauses
3. **Wrap primitives** — `UserId`, `Email`, `Money`, `OrderCode` as value objects (no raw strings/numbers crossing domain boundaries)
4. **First-class collections** — wrap arrays in domain collection classes when they carry behaviour
5. **One dot per line** — respect Law of Demeter; no `a.b.c.d`
6. **No abbreviations** — full words; if a name is getting too long the class is doing too much
7. **Small entities** — classes ≤ 50 lines, methods ≤ 10 lines
8. **Max 2 instance variables per class** — more means multiple responsibilities
9. **Tell, don't ask** — avoid getters that expose internals; push behaviour into objects

---

## Naming Conventions

| Layer                 | Convention                                 | Example                       |
| --------------------- | ------------------------------------------ | ----------------------------- |
| Module                | `<Feature>Module`                          | `ProductModule`               |
| Controller            | `<Feature>Controller`                      | `ProductController`           |
| Service (application) | `<Feature>Service`                         | `ProductService`              |
| Repository interface  | `I<Feature>Repository`                     | `IProductRepository`          |
| Repository impl       | `<Feature>Repository`                      | `ProductRepository`           |
| Entity                | `<Feature>Entity`                          | `ProductEntity`               |
| DTO (input)           | `Create<Feature>Dto`, `Update<Feature>Dto` | `CreateProductDto`            |
| DTO (output)          | `<Feature>Response`                        | `ProductResponse`             |
| Value Object          | noun                                       | `Email`, `Money`, `ProductId` |

- Avoid vague suffixes: `Manager`, `Handler`, `Processor`, `Utils`, `Helper`, `Data`, `Info`
- Domain language first — use names from the business domain, not technical jargon

---

## Testing Rules

### Strategy

- **Unit tests** — pure business logic, no DB/HTTP (mock at the interface boundary)
- **Integration tests** — repository layer against a real test DB (use `@nestjs/testing` + test containers or a dedicated test DB)
- **E2E tests** — full HTTP round-trip via Supertest

### Structure (Arrange-Act-Assert)

```typescript
describe('ProductService', () => {
  describe('createProduct', () => {
    it('should return created product when valid data provided', async () => {
      // Arrange
      const dto = CreateProductDtoFactory.make();
      mockRepo.save.mockResolvedValue(ProductFactory.make(dto));

      // Act
      const result = await service.createProduct(dto);

      // Assert
      expect(result.name).toBe(dto.name);
    });
  });
});
```

### Rules

- Test file co-located: `product.service.spec.ts` next to `product.service.ts`
- E2E tests in `test/` folder
- Test names must read like sentences: `should <expected behaviour> when <condition>`
- Never test implementation details — test behaviour
- Coverage thresholds (enforced in CI): statements ≥ 80%, branches ≥ 70%

---

## API & Swagger

- All routes prefixed with `/api/v1`
- Every controller decorated with `@ApiTags` and `@ApiBearerAuth` (if protected)
- Every DTO decorated with `@ApiProperty` with `example` values
- Every endpoint decorated with `@ApiOperation`, `@ApiResponse` for success and error cases
- Swagger UI available at `/api/docs` in development

---

## Database (TypeORM + PostgreSQL)

- Entity files in `domain/` folder of each module
- Use `BIGINT` PKs with `@PrimaryGeneratedColumn('increment')`
- Timestamps: `created_at`, `updated_at` via `@CreateDateColumn` / `@UpdateDateColumn`
- Migrations required for all schema changes — never use `synchronize: true` in production
- Migration files in `src/database/migrations/`
- Seed files in `src/database/seeds/`

---

## Auth

- JWT access token (short-lived, 15m)
- JWT refresh token (long-lived, 7d) stored as httpOnly cookie
- `@Public()` decorator to opt-out of global JWT guard
- Passwords hashed with bcrypt (salt rounds: 12)

---

## Error Handling

- Use NestJS built-in HTTP exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`
- Domain errors thrown from services, translated to HTTP exceptions in controllers or via exception filter
- Global exception filter for consistent error response shape:
  ```json
  { "statusCode": 404, "message": "Product not found", "error": "Not Found" }
  ```

---

## Comments

Only explain **WHY**, never what or how. The code should be self-documenting.

```typescript
// GOOD: explain non-obvious business rule
// Discount only applies to verified users per marketing campaign #123
if (user.isVerified && cart.total > 100_000) { ... }

// BAD: restates the code
// Check if user is verified and cart total is greater than 100000
```

---

## Docker

- `Dockerfile` — multi-stage build (builder → runner)
- `docker-compose.yml` — app + postgres + (optional) redis
- `docker-compose.override.yml` — local dev overrides (hot-reload mounts)
- Never hardcode secrets — use environment variables via `.env`

---

## Environment Variables

Required variables documented in `.env.example`. Never commit `.env` files.

---

## Git Conventions

- Branch: `feat/<feature>`, `fix/<bug>`, `refactor/<area>`, `chore/<task>`
- Commits follow Conventional Commits: `feat(product): add filter by category`
- PRs must include passing tests and no lint errors

---

## Commands

```bash
# Development
yarn start:dev

# Tests
yarn test              # unit
yarn test:e2e          # end-to-end
yarn test:cov          # with coverage

# Database
yarn migration:generate -- src/database/migrations/<name>
yarn migration:run
yarn migration:revert

# Docker
docker-compose up -d
docker-compose down
```
