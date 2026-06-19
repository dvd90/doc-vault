# CLAUDE.md — DocVault Master Plan

> This file is the single source of truth for every Claude Code session.
> Read it fully at the start of every session before touching any code.

---

## How to use this file

**Starting a session:**

```
Read CLAUDE.md fully. We are on Phase X, task Y.Z.
Follow TDD strictly — write the failing test first, then the minimum implementation to make it pass.
```

**Moving to the next task:**

```
All tests pass. Mark task Y.Z complete in CLAUDE.md and move to Y.Z+1.
Write the failing test first. Do not skip ahead.
```

**When a test fails unexpectedly:**

```
Test [name] is failing with [error].
Read CLAUDE.md and fix only what is needed to make this test pass without breaking others.
Do not refactor anything not directly related to this failure.
```

**Progress tracking:** Update the `[ ]` checkboxes in this file as tasks complete.

---

## TDD rules — enforced on every task

These are non-negotiable. Follow them in every session without exception.

1. **Red first.** Write a failing test before any implementation code. If the test passes before you write implementation, the test is wrong — fix it.
2. **One test at a time.** Write one failing test, make it green, then move to the next. Never write 5 tests and implement them all at once.
3. **Minimum implementation.** Make the test pass with the simplest possible code. Do not add code that no test covers.
4. **Refactor only on green.** Only clean up code when all tests are passing. Never refactor on red.
5. **Tests live next to source.** `src/routes/clients.ts` → `src/routes/clients.test.ts`. No separate `__tests__` directories in the API (except the shared `test/` helpers folder).
6. **Integration tests use a real test DB.** No mocking Prisma in integration tests. Use `DATABASE_URL_TEST` pointing to the Docker `postgres-test` container. Factories create real records, `beforeEach` wipes them.
7. **Mock only external services.** Mock: S3 (aws-sdk-client-mock), Resend, Stripe (where needed in unit tests). Never mock: Prisma, Express middleware, your own services in integration tests.
8. **Factory functions over fixtures.** Use `createTestFirm()`, `createTestClient()` etc. Never use static JSON fixture files.
9. **No `any` types.** TypeScript strict mode is on. If you find yourself writing `as any`, stop and type it properly.
10. **Coverage gates enforced.** `npm run test:coverage` must pass: Lines ≥ 80%, Functions ≥ 80%, Branches ≥ 70%. A phase is not complete until coverage passes.

---

## Project overview

|                   |                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------- |
| **Product**       | SaaS for accountants to collect documents from clients                                       |
| **Core loop**     | Accountant creates checklist → sends magic link → client uploads files → accountant notified |
| **Client login?** | No. Clients access their portal via a unique token URL only.                                 |
| **Auth**          | Accountants log in via Google OAuth. JWT stored in HttpOnly cookie.                          |
| **Billing**       | Stripe. $49/mo. 14-day free trial. Statuses: trial → active → cancelled.                     |

---

## Stack

```
apps/api    Express 4 · TypeScript 5 (strict) · Prisma 5 · PostgreSQL 16
            Passport.js (Google OAuth 2.0) · jsonwebtoken · Zod
            AWS SDK v3 (S3) · Resend · Stripe
            Vitest · Supertest · aws-sdk-client-mock

apps/web    Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui

e2e/        Playwright
```

---

## Repository structure

```
docvault/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts               # Singleton PrismaClient
│   │   │   │   ├── prisma.test.ts
│   │   │   │   ├── s3.ts                   # AWS S3 client singleton
│   │   │   │   ├── stripe.ts               # Stripe client singleton
│   │   │   │   └── resend.ts               # Resend client singleton
│   │   │   ├── middleware/
│   │   │   │   ├── requireAuth.ts + requireAuth.test.ts
│   │   │   │   ├── requireSub.ts  + requireSub.test.ts
│   │   │   │   ├── validate.ts    + validate.test.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts        + auth.test.ts
│   │   │   │   ├── clients.ts     + clients.test.ts
│   │   │   │   ├── templates.ts   + templates.test.ts
│   │   │   │   ├── portal.ts      + portal.test.ts
│   │   │   │   ├── billing.ts     + billing.test.ts
│   │   │   │   ├── dashboard.ts   + dashboard.test.ts
│   │   │   │   ├── firms.ts       + firms.test.ts
│   │   │   │   └── internal.ts    + internal.test.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts         + auth.service.test.ts
│   │   │   │   ├── client.service.ts       + client.service.test.ts
│   │   │   │   ├── checklist.service.ts    + checklist.service.test.ts
│   │   │   │   ├── upload.service.ts       + upload.service.test.ts
│   │   │   │   ├── portal.service.ts       + portal.service.test.ts
│   │   │   │   ├── notification.service.ts + notification.service.test.ts
│   │   │   │   ├── reminder.service.ts     + reminder.service.test.ts
│   │   │   │   └── billing.service.ts      + billing.service.test.ts
│   │   │   ├── schemas/
│   │   │   │   ├── client.schema.ts   + client.schema.test.ts
│   │   │   │   ├── template.schema.ts + template.schema.test.ts
│   │   │   │   └── firm.schema.ts     + firm.schema.test.ts
│   │   │   ├── errors/
│   │   │   │   └── AppError.ts
│   │   │   ├── types/
│   │   │   │   └── express.d.ts
│   │   │   ├── test/
│   │   │   │   ├── setup.ts        # beforeEach wipe, afterAll disconnect
│   │   │   │   ├── factories.ts    # createTestFirm(), createTestClient(), etc.
│   │   │   │   └── helpers.ts      # api, signTestJwt(), makeAuthedRequest()
│   │   │   ├── app.ts              # Express app (no listen)
│   │   │   └── server.ts           # listen() entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── .env.example
│   │   ├── .env.test.example
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/
│       ├── app/
│       │   ├── (auth)/login/page.tsx
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── clients/page.tsx
│       │   │   ├── clients/[id]/page.tsx
│       │   │   └── settings/page.tsx
│       │   └── portal/[token]/page.tsx
│       ├── components/
│       │   ├── ui/
│       │   ├── clients/
│       │   ├── checklists/
│       │   └── portal/
│       ├── lib/
│       │   ├── api.ts
│       │   └── auth.ts
│       ├── .env.example
│       └── tsconfig.json
├── e2e/
│   ├── auth.spec.ts
│   ├── clients.spec.ts
│   ├── portal.spec.ts
│   └── playwright.config.ts
├── docker-compose.yml
├── tsconfig.base.json
├── package.json
├── README.md
└── CLAUDE.md
```

---

## Configuration files

### `package.json` (root)

```json
{
  "name": "docvault",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=apps/api\" \"npm run dev --workspace=apps/web\"",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces --if-present",
    "test:e2e": "playwright test",
    "lint": "npm run lint --workspaces --if-present"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "@playwright/test": "^1.44.0",
    "typescript": "^5.4.0"
  }
}
```

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

### `apps/api/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `apps/api/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    env: loadEnv('test', process.cwd(), ''),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test/**', 'src/types/**', 'src/server.ts', 'prisma/**'],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
}))
```

### `apps/api/package.json`

```json
{
  "name": "@docvault/api",
  "version": "0.1.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:migrate": "prisma migrate dev",
    "db:migrate:test": "dotenv -e .env.test -- prisma migrate deploy",
    "db:reset:test": "dotenv -e .env.test -- prisma migrate reset --force",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "@prisma/client": "^5.15.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "express": "^4.19.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "pino": "^9.2.0",
    "pino-http": "^10.2.0",
    "resend": "^3.3.0",
    "stripe": "^15.12.0",
    "zod": "^3.23.0",
    "uuid": "^10.0.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.14.0",
    "@types/passport": "^1.0.16",
    "@types/passport-google-oauth20": "^2.0.16",
    "@types/supertest": "^6.0.2",
    "@types/uuid": "^10.0.0",
    "@vitest/coverage-v8": "^1.6.0",
    "aws-sdk-client-mock": "^4.0.0",
    "dotenv-cli": "^7.4.2",
    "pino-pretty": "^11.2.0",
    "prisma": "^5.15.0",
    "supertest": "^7.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.3.0",
    "vitest": "^1.6.0"
  }
}
```

### `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: docvault
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: docvault_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5433:5432'

  adminer:
    image: adminer:latest
    ports:
      - '8080:8080'

volumes:
  postgres_data:
```

### `apps/api/.env.example`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/docvault
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
JWT_SECRET=
JWT_EXPIRY=30d
STRIPE_SECRET_KEY=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_
STRIPE_PRICE_ID=price_
STRIPE_TRIAL_DAYS=14
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1
AWS_S3_BUCKET=docvault-dev
RESEND_API_KEY=re_
FRONTEND_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
CRON_SECRET=
```

### `apps/api/.env.test.example`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/docvault_test
JWT_SECRET=test-secret-not-for-production
NODE_ENV=test
AWS_S3_BUCKET=docvault-test
CRON_SECRET=test-cron-secret
```

---

## Prisma schema

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  googleId  String   @unique @map("google_id")
  email     String   @unique
  name      String
  avatarUrl String?  @map("avatar_url")
  firmId    String   @map("firm_id")
  firm      Firm     @relation(fields: [firmId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  @@map("users")
}

model Firm {
  id                 String              @id @default(uuid())
  name               String
  logoUrl            String?             @map("logo_url")
  accentColor        String              @default("#185FA5") @map("accent_color")
  stripeCustomerId   String?             @unique @map("stripe_customer_id")
  subscriptionStatus String              @default("trial") @map("subscription_status")
  trialEndsAt        DateTime?           @map("trial_ends_at")
  users              User[]
  clients            Client[]
  templates          ChecklistTemplate[]
  createdAt          DateTime            @default(now()) @map("created_at")
  @@map("firms")
}

model Client {
  id          String          @id @default(uuid())
  firmId      String          @map("firm_id")
  firm        Firm            @relation(fields: [firmId], references: [id])
  name        String
  email       String
  taxYear     String          @map("tax_year")
  portalToken String          @unique @default(uuid()) @map("portal_token")
  status      String          @default("not_started")
  archived    Boolean         @default(false)
  items       ChecklistItem[]
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  @@map("clients")
}

model ChecklistTemplate {
  id        String                  @id @default(uuid())
  firmId    String                  @map("firm_id")
  firm      Firm                    @relation(fields: [firmId], references: [id])
  name      String
  items     ChecklistTemplateItem[]
  createdAt DateTime                @default(now()) @map("created_at")
  @@map("checklist_templates")
}

model ChecklistTemplateItem {
  id          String            @id @default(uuid())
  templateId  String            @map("template_id")
  template    ChecklistTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  label       String
  description String?
  required    Boolean           @default(true)
  sortOrder   Int               @default(0) @map("sort_order")
  @@map("checklist_template_items")
}

model ChecklistItem {
  id          String    @id @default(uuid())
  clientId    String    @map("client_id")
  client      Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  label       String
  description String?
  required    Boolean   @default(true)
  sortOrder   Int       @default(0) @map("sort_order")
  completedAt DateTime? @map("completed_at")
  uploads     Upload[]
  @@map("checklist_items")
}

model Upload {
  id              String        @id @default(uuid())
  checklistItemId String        @map("checklist_item_id")
  checklistItem   ChecklistItem @relation(fields: [checklistItemId], references: [id], onDelete: Cascade)
  storagePath     String        @map("storage_path")
  filename        String
  fileSize        Int           @map("file_size")
  mimeType        String        @map("mime_type")
  uploadedAt      DateTime      @default(now()) @map("uploaded_at")
  @@map("uploads")
}
```

---

## Test infrastructure

### `apps/api/src/test/setup.ts`

```typescript
import { prisma } from '../lib/prisma'

beforeEach(async () => {
  await prisma.upload.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.checklistTemplateItem.deleteMany()
  await prisma.checklistTemplate.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
  await prisma.firm.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

### `apps/api/src/test/factories.ts`

```typescript
import { prisma } from '../lib/prisma'
import { v4 as uuid } from 'uuid'

export async function createTestFirm(overrides: Record<string, unknown> = {}) {
  return prisma.firm.create({
    data: {
      name: 'Test Accounting Ltd',
      subscriptionStatus: 'active',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ...overrides,
    },
  })
}

export async function createTestUser(firmId: string, overrides: Record<string, unknown> = {}) {
  return prisma.user.create({
    data: {
      googleId: `google-${uuid()}`,
      email: `user-${uuid()}@test.com`,
      name: 'Test User',
      firmId,
      ...overrides,
    },
  })
}

export async function createTestClient(firmId: string, overrides: Record<string, unknown> = {}) {
  return prisma.client.create({
    data: {
      firmId,
      name: 'Alice Smith',
      email: `alice-${uuid()}@example.com`,
      taxYear: '2024-25',
      ...overrides,
    },
  })
}

export async function createTestChecklistItem(
  clientId: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.checklistItem.create({
    data: {
      clientId,
      label: 'P60 from employer',
      required: true,
      sortOrder: 0,
      ...overrides,
    },
  })
}

export async function createTestTemplate(firmId: string, overrides: Record<string, unknown> = {}) {
  return prisma.checklistTemplate.create({
    data: {
      firmId,
      name: 'Self Assessment Pack',
      items: {
        create: [
          { label: 'P60 from employer', sortOrder: 0, required: true },
          { label: '3 months bank statements', sortOrder: 1, required: true },
          { label: 'Mortgage interest cert', sortOrder: 2, required: false },
        ],
      },
      ...overrides,
    },
    include: { items: true },
  })
}

export async function createTestUpload(
  checklistItemId: string,
  overrides: Record<string, unknown> = {},
) {
  return prisma.upload.create({
    data: {
      checklistItemId,
      storagePath: `uploads/firm/client/${uuid()}.pdf`,
      filename: 'p60.pdf',
      fileSize: 102400,
      mimeType: 'application/pdf',
      ...overrides,
    },
  })
}
```

### `apps/api/src/test/helpers.ts`

```typescript
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { app } from '../app'

export const api = supertest(app)

export function signTestJwt(userId: string, firmId: string): string {
  return jwt.sign({ userId, firmId }, process.env.JWT_SECRET ?? 'test-secret', { expiresIn: '1h' })
}

export function makeAuthedRequest(userId: string, firmId: string) {
  const token = signTestJwt(userId, firmId)
  const cookie = `token=${token}`
  return {
    get: (url: string) => api.get(url).set('Cookie', cookie),
    post: (url: string) => api.post(url).set('Cookie', cookie),
    patch: (url: string) => api.patch(url).set('Cookie', cookie),
    delete: (url: string) => api.delete(url).set('Cookie', cookie),
  }
}
```

### `apps/api/src/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class PaymentRequiredError extends AppError {
  constructor() {
    super('Active subscription required', 402, 'PAYMENT_REQUIRED')
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}
```

### `apps/api/src/types/express.d.ts`

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; firmId: string }
    }
  }
}
export {}
```

---

## API route reference

| Method | Path                          | Auth        | Phase | Description                                 |
| ------ | ----------------------------- | ----------- | ----- | ------------------------------------------- |
| GET    | /health                       | None        | 1     | Uptime check                                |
| GET    | /auth/google                  | None        | 1     | Initiate Google OAuth                       |
| GET    | /auth/google/callback         | None        | 1     | OAuth callback, sets JWT cookie             |
| GET    | /auth/me                      | JWT         | 1     | Current user + firm                         |
| POST   | /auth/logout                  | JWT         | 1     | Clear JWT cookie                            |
| POST   | /billing/checkout             | JWT         | 1     | Create Stripe Checkout session              |
| POST   | /billing/webhook              | Stripe-sig  | 1     | Stripe event handler (raw body)             |
| POST   | /billing/portal               | JWT+Sub     | 1     | Stripe customer portal URL                  |
| POST   | /clients                      | JWT+Sub     | 1     | Create client                               |
| GET    | /clients                      | JWT+Sub     | 1     | List non-archived clients                   |
| GET    | /clients/:id                  | JWT+Sub     | 1     | Client + checklist items                    |
| PATCH  | /clients/:id                  | JWT+Sub     | 1     | Update client                               |
| DELETE | /clients/:id                  | JWT+Sub     | 1     | Soft-delete (set archived=true)             |
| GET    | /templates                    | JWT+Sub     | 2     | List firm templates                         |
| POST   | /templates                    | JWT+Sub     | 2     | Create template with items                  |
| PATCH  | /templates/:id                | JWT+Sub     | 2     | Update template                             |
| DELETE | /templates/:id                | JWT+Sub     | 2     | Delete template                             |
| POST   | /clients/:id/apply-template   | JWT+Sub     | 2     | Copy template items to client               |
| POST   | /clients/:id/invite           | JWT+Sub     | 2     | Send portal invite email                    |
| POST   | /clients/:id/remind           | JWT+Sub     | 3     | Manual reminder email to client             |
| GET    | /portal/:token                | None        | 2     | Public portal — client data + firm branding |
| POST   | /portal/:token/upload/:itemId | None        | 2     | Client file upload                          |
| GET    | /dashboard/stats              | JWT+Sub     | 3     | Overview counts                             |
| PATCH  | /firms/me                     | JWT+Sub     | 3     | Update firm name / accent colour            |
| POST   | /firms/me/logo                | JWT+Sub     | 3     | Upload firm logo to S3                      |
| POST   | /internal/reminders/send      | CRON_SECRET | 3     | Trigger daily reminder job                  |

---

# PHASE 1 — Foundation & auth

**Goal:** Monorepo running, Postgres migrated, Google OAuth working, JWT sessions, client CRUD, Stripe billing wired.
**Estimated hours:** ~8 hrs
**Done when:** All checkboxes ticked AND `npm run test:coverage` passes all thresholds.

---

## Task 1.1 — Bootstrap monorepo and tooling

**Create these files (no tests yet — this task IS the scaffold):**

- `package.json` (root)
- `tsconfig.base.json`
- `docker-compose.yml`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/vitest.config.ts`
- `apps/api/.env.example`
- `apps/api/.env.test.example`
- `apps/api/src/app.ts` — Express app with: `helmet()`, `cors()`, `cookieParser()`, `pinoHttp()`, `express.json()`. Export `app` without calling `listen`.
- `apps/api/src/server.ts` — imports `app`, calls `app.listen(PORT)`.

**First test — write it, watch it fail, then implement:**

```typescript
// apps/api/src/app.test.ts
import { api } from './test/helpers'

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await api.get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
```

**Implementation:** add `app.get('/health', (_req, res) => res.json({ status: 'ok' }))` in `app.ts`.

**Verify:** `npm test` → 1 passing.

- [ ] Task 1.1 complete

---

## Task 1.2 — Prisma + database

**Create:**

- `apps/api/prisma/schema.prisma` (full schema above)
- `apps/api/src/lib/prisma.ts` — singleton `PrismaClient`
- `apps/api/src/test/setup.ts`
- `apps/api/src/test/factories.ts`
- `apps/api/src/test/helpers.ts`
- `apps/api/src/errors/AppError.ts`
- `apps/api/src/types/express.d.ts`

**Run:**

```bash
cd apps/api
npm run db:migrate          # name the migration "init"
npm run db:migrate:test
```

**Tests — write each one, watch it fail, implement, then next:**

```typescript
// apps/api/src/lib/prisma.test.ts
import { prisma } from './prisma'
import { createTestFirm, createTestUser } from '../test/factories'

describe('database connectivity', () => {
  it('can create and read a firm', async () => {
    const firm = await createTestFirm({ name: 'ACME Accounting' })
    const found = await prisma.firm.findUniqueOrThrow({ where: { id: firm.id } })
    expect(found.name).toBe('ACME Accounting')
    expect(found.subscriptionStatus).toBe('active')
  })

  it('user and firm are linked', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id, { name: 'Jane CPA' })
    const found = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { firm: true },
    })
    expect(found.firm.id).toBe(firm.id)
    expect(found.name).toBe('Jane CPA')
  })

  it('portalToken is auto-generated on client creation', async () => {
    const firm = await createTestFirm()
    const client = await prisma.client.create({
      data: { firmId: firm.id, name: 'Bob', email: 'bob@test.com', taxYear: '2024-25' },
    })
    expect(client.portalToken).toBeDefined()
    expect(client.portalToken.length).toBeGreaterThan(10)
  })

  it('two clients get different portalTokens', async () => {
    const firm = await createTestFirm()
    const c1 = await prisma.client.create({
      data: { firmId: firm.id, name: 'A', email: 'a@t.com', taxYear: '2024-25' },
    })
    const c2 = await prisma.client.create({
      data: { firmId: firm.id, name: 'B', email: 'b@t.com', taxYear: '2024-25' },
    })
    expect(c1.portalToken).not.toBe(c2.portalToken)
  })
})
```

- [ ] Task 1.2 complete

---

## Task 1.3 — Middleware

### Task 1.3a — validate middleware

```typescript
// apps/api/src/middleware/validate.test.ts
import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'
import { validate } from './validate'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

function run(
  body: unknown,
): Promise<{ status?: number; body?: unknown; next: boolean; reqBody?: unknown }> {
  return new Promise((resolve) => {
    const req = { body } as Request
    const res = {
      status: (code: number) => ({
        json: (data: unknown) => resolve({ status: code, body: data, next: false }),
      }),
    } as unknown as Response
    const next = () => resolve({ next: true, reqBody: req.body })
    validate(schema)(req, res, next as NextFunction)
  })
}

describe('validate middleware', () => {
  it('calls next() when body is valid', async () => {
    const result = await run({ name: 'Jane', email: 'jane@test.com' })
    expect(result.next).toBe(true)
  })

  it('returns 400 when body is invalid', async () => {
    const result = await run({ name: '', email: 'not-email' })
    expect(result.status).toBe(400)
    expect(result.body).toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('returns 400 when required fields are missing', async () => {
    const result = await run({})
    expect(result.status).toBe(400)
  })

  it('strips unknown fields from req.body', async () => {
    const result = await run({ name: 'Jane', email: 'jane@test.com', injected: 'bad' })
    expect((result.reqBody as any)?.injected).toBeUndefined()
  })
})
```

- [ ] Task 1.3a complete

### Task 1.3b — requireAuth middleware

Add a test-only route in `app.ts` (guard with `NODE_ENV === 'test'`):
`app.get('/test/protected', requireAuth, (req, res) => res.json(req.user))`

```typescript
// apps/api/src/middleware/requireAuth.test.ts
import { api, signTestJwt } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'
import jwt from 'jsonwebtoken'

describe('requireAuth', () => {
  it('returns 401 when no cookie', async () => {
    expect((await api.get('/test/protected')).status).toBe(401)
  })

  it('returns 401 for invalid JWT', async () => {
    const res = await api.get('/test/protected').set('Cookie', 'token=bad.jwt')
    expect(res.status).toBe(401)
  })

  it('returns 401 for expired JWT', async () => {
    const expired = jwt.sign({ userId: 'u', firmId: 'f' }, process.env.JWT_SECRET!, {
      expiresIn: '-1s',
    })
    const res = await api.get('/test/protected').set('Cookie', `token=${expired}`)
    expect(res.status).toBe(401)
  })

  it('attaches user and calls next for valid JWT', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const token = signTestJwt(user.id, firm.id)
    const res = await api.get('/test/protected').set('Cookie', `token=${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ userId: user.id, firmId: firm.id })
  })

  it('clears cookie when JWT is invalid', async () => {
    const res = await api.get('/test/protected').set('Cookie', 'token=bad')
    const setCookie = res.headers['set-cookie']?.[0] ?? ''
    expect(setCookie).toContain('token=;')
  })
})
```

- [ ] Task 1.3b complete

### Task 1.3c — requireSub middleware

Add test route (NODE_ENV guard): `app.get('/test/subscribed', requireAuth, requireSub, (req, res) => res.json({ ok: true }))`

```typescript
// apps/api/src/middleware/requireSub.test.ts
import { createTestFirm, createTestUser } from '../test/factories'
import { makeAuthedRequest } from '../test/helpers'

describe('requireSub', () => {
  it('returns 402 when subscription is cancelled', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'cancelled' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(402)
  })

  it('returns 402 when subscription is past_due', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'past_due' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(402)
  })

  it('allows through when active', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'active' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(200)
  })

  it('allows through when trial', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'trial' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(200)
  })

  it('returns 401 when firmId in JWT does not exist', async () => {
    const res = await makeAuthedRequest('any-user', 'nonexistent-firm').get('/test/subscribed')
    expect(res.status).toBe(401)
  })
})
```

- [ ] Task 1.3c complete

---

## Task 1.4 — Auth service + routes

### Task 1.4a — AuthService

```typescript
// apps/api/src/services/auth.service.test.ts
import { AuthService } from './auth.service'
import { prisma } from '../lib/prisma'
import { createTestFirm, createTestUser } from '../test/factories'

const googleProfile = {
  id: 'google-123',
  displayName: 'Jane Smith',
  emails: [{ value: 'jane@example.com' }],
  photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
}

describe('AuthService.findOrCreateUser', () => {
  it('creates new user and firm on first login', async () => {
    const user = await AuthService.findOrCreateUser(googleProfile as any)
    expect(user.googleId).toBe('google-123')
    expect(user.email).toBe('jane@example.com')
    expect(user.firm).toBeDefined()
  })

  it('returns existing user on repeat login', async () => {
    const firm = await createTestFirm()
    const existing = await createTestUser(firm.id, { googleId: 'google-123' })
    const user = await AuthService.findOrCreateUser(googleProfile as any)
    expect(user.id).toBe(existing.id)
    expect(await prisma.user.count()).toBe(1)
  })

  it('updates name and avatar if changed', async () => {
    const firm = await createTestFirm()
    await createTestUser(firm.id, {
      googleId: 'google-123',
      name: 'Old Name',
      avatarUrl: 'https://old.url',
    })
    const user = await AuthService.findOrCreateUser(googleProfile as any)
    expect(user.name).toBe('Jane Smith')
    expect(user.avatarUrl).toBe('https://lh3.googleusercontent.com/photo.jpg')
  })

  it('does not create a second firm on repeat login', async () => {
    const firm = await createTestFirm()
    await createTestUser(firm.id, { googleId: 'google-123' })
    await AuthService.findOrCreateUser(googleProfile as any)
    expect(await prisma.firm.count()).toBe(1)
  })
})
```

- [ ] Task 1.4a complete

### Task 1.4b — Auth routes

```typescript
// apps/api/src/routes/auth.test.ts
import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'

describe('GET /auth/me', () => {
  it('returns 401 when not authenticated', async () => {
    expect((await api.get('/auth/me')).status).toBe(401)
  })

  it('returns current user and firm', async () => {
    const firm = await createTestFirm({ name: 'ACME CPA' })
    const user = await createTestUser(firm.id, { name: 'Bob Accountant' })
    const res = await makeAuthedRequest(user.id, firm.id).get('/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user.name).toBe('Bob Accountant')
    expect(res.body.firm.name).toBe('ACME CPA')
  })
})

describe('POST /auth/logout', () => {
  it('returns 200', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).post('/auth/logout')).status).toBe(200)
  })

  it('clears the token cookie', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).post('/auth/logout')
    expect(res.headers['set-cookie']?.[0]).toContain('token=;')
  })
})
```

- [ ] Task 1.4b complete

---

## Task 1.5 — Client schemas, service, routes

### Task 1.5a — Zod schemas

```typescript
// apps/api/src/schemas/client.schema.test.ts
import { createClientSchema, updateClientSchema } from './client.schema'

describe('createClientSchema', () => {
  it('accepts valid data', () => {
    expect(
      createClientSchema.safeParse({
        name: 'Alice',
        email: 'alice@example.com',
        taxYear: '2024-25',
      }).success,
    ).toBe(true)
  })
  it('rejects missing name', () => {
    expect(createClientSchema.safeParse({ email: 'a@b.com', taxYear: '2024-25' }).success).toBe(
      false,
    )
  })
  it('rejects invalid email', () => {
    expect(
      createClientSchema.safeParse({ name: 'Alice', email: 'not-email', taxYear: '2024-25' })
        .success,
    ).toBe(false)
  })
  it('rejects empty taxYear', () => {
    expect(
      createClientSchema.safeParse({ name: 'Alice', email: 'a@b.com', taxYear: '' }).success,
    ).toBe(false)
  })
})

describe('updateClientSchema', () => {
  it('accepts partial update', () => {
    expect(updateClientSchema.safeParse({ name: 'New' }).success).toBe(true)
  })
  it('rejects empty object', () => {
    expect(updateClientSchema.safeParse({}).success).toBe(false)
  })
})
```

- [ ] Task 1.5a complete

### Task 1.5b — ClientService

```typescript
// apps/api/src/services/client.service.test.ts
import { ClientService } from './client.service'
import { prisma } from '../lib/prisma'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'
import { NotFoundError } from '../errors/AppError'

describe('ClientService', () => {
  describe('create', () => {
    it('creates client scoped to firm', async () => {
      const firm = await createTestFirm()
      const client = await ClientService.create(firm.id, {
        name: 'Alice',
        email: 'a@t.com',
        taxYear: '2024-25',
      })
      expect(client.firmId).toBe(firm.id)
    })
    it('sets status to not_started', async () => {
      const firm = await createTestFirm()
      const client = await ClientService.create(firm.id, {
        name: 'A',
        email: 'a@t.com',
        taxYear: '2024-25',
      })
      expect(client.status).toBe('not_started')
    })
    it('auto-generates unique portalTokens', async () => {
      const firm = await createTestFirm()
      const c1 = await ClientService.create(firm.id, {
        name: 'A',
        email: 'a@t.com',
        taxYear: '2024-25',
      })
      const c2 = await ClientService.create(firm.id, {
        name: 'B',
        email: 'b@t.com',
        taxYear: '2024-25',
      })
      expect(c1.portalToken).not.toBe(c2.portalToken)
    })
  })

  describe('findAll', () => {
    it('returns only non-archived clients for the firm', async () => {
      const firm = await createTestFirm()
      await createTestClient(firm.id, { name: 'Active' })
      await createTestClient(firm.id, { archived: true })
      const result = await ClientService.findAll(firm.id)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Active')
    })
    it('excludes clients from other firms', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      await createTestClient(firmA.id)
      await createTestClient(firmB.id)
      expect(await ClientService.findAll(firmA.id)).toHaveLength(1)
    })
    it('returns empty array when no clients', async () => {
      const firm = await createTestFirm()
      expect(await ClientService.findAll(firm.id)).toEqual([])
    })
  })

  describe('findById', () => {
    it('returns client with checklist items', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await createTestChecklistItem(client.id, { label: 'P60' })
      const found = await ClientService.findById(firm.id, client.id)
      expect(found.items).toHaveLength(1)
      expect(found.items[0].label).toBe('P60')
    })
    it('throws NotFoundError for wrong firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const client = await createTestClient(firmA.id)
      await expect(ClientService.findById(firmB.id, client.id)).rejects.toThrow(NotFoundError)
    })
    it('throws NotFoundError for unknown id', async () => {
      const firm = await createTestFirm()
      await expect(ClientService.findById(firm.id, 'does-not-exist')).rejects.toThrow(NotFoundError)
    })
  })

  describe('update', () => {
    it('updates allowed fields', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id, { name: 'Old' })
      const updated = await ClientService.update(firm.id, client.id, { name: 'New' })
      expect(updated.name).toBe('New')
    })
    it('throws NotFoundError for wrong firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const client = await createTestClient(firmA.id)
      await expect(ClientService.update(firmB.id, client.id, { name: 'X' })).rejects.toThrow(
        NotFoundError,
      )
    })
  })

  describe('archive', () => {
    it('sets archived=true without hard deleting', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await ClientService.archive(firm.id, client.id)
      const still = await prisma.client.findUnique({ where: { id: client.id } })
      expect(still).not.toBeNull()
      expect(still!.archived).toBe(true)
    })
  })
})
```

- [ ] Task 1.5b complete

### Task 1.5c — Client routes (integration)

```typescript
// apps/api/src/routes/clients.test.ts
import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser, createTestClient } from '../test/factories'

describe('POST /clients', () => {
  it('returns 401 when unauthenticated', async () => {
    expect(
      (await api.post('/clients').send({ name: 'A', email: 'a@b.com', taxYear: '2024-25' })).status,
    ).toBe(401)
  })
  it('returns 400 for invalid body', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (await makeAuthedRequest(user.id, firm.id).post('/clients').send({ name: '' })).status,
    ).toBe(400)
  })
  it('creates client and returns 201', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients')
      .send({ name: 'Alice', email: 'alice@test.com', taxYear: '2024-25' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Alice')
    expect(res.body.portalToken).toBeDefined()
  })
  it('scopes client to authenticated firm', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients')
      .send({ name: 'Alice', email: 'alice@test.com', taxYear: '2024-25' })
    expect(res.body.firmId).toBe(firm.id)
  })
})

describe('GET /clients', () => {
  it('returns only non-archived clients for this firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const user = await createTestUser(firmA.id)
    await createTestClient(firmA.id, { name: 'Active' })
    await createTestClient(firmA.id, { archived: true })
    await createTestClient(firmB.id)
    const res = await makeAuthedRequest(user.id, firmA.id).get('/clients')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Active')
  })
  it('returns empty array when no clients', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).get('/clients')
    expect(res.body).toEqual([])
  })
})

describe('GET /clients/:id', () => {
  it('returns 404 for client in another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const userB = await createTestUser(firmB.id)
    const client = await createTestClient(firmA.id)
    expect((await makeAuthedRequest(userB.id, firmB.id).get(`/clients/${client.id}`)).status).toBe(
      404,
    )
  })
  it('returns client with items', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).get(`/clients/${client.id}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
})

describe('PATCH /clients/:id', () => {
  it('updates and returns client', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id, { name: 'Old' })
    const res = await makeAuthedRequest(user.id, firm.id)
      .patch(`/clients/${client.id}`)
      .send({ name: 'New' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New')
  })
  it('returns 404 for unknown id', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (
        await makeAuthedRequest(user.id, firm.id)
          .patch('/clients/does-not-exist')
          .send({ name: 'X' })
      ).status,
    ).toBe(404)
  })
})

describe('DELETE /clients/:id', () => {
  it('returns 204 and soft-deletes', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).delete(`/clients/${client.id}`)).status).toBe(
      204,
    )
  })
})
```

- [ ] Task 1.5c complete

---

## Task 1.6 — Stripe billing

### Task 1.6a — BillingService (unit, mock Stripe)

```typescript
// apps/api/src/services/billing.service.test.ts
import { vi } from 'vitest'

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }) },
    },
    customers: { create: vi.fn().mockResolvedValue({ id: 'cus_test' }) },
    billingPortal: {
      sessions: { create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }) },
    },
  },
}))

import { BillingService } from './billing.service'
import { createTestFirm } from '../test/factories'
import { prisma } from '../lib/prisma'

describe('BillingService', () => {
  describe('createCheckoutSession', () => {
    it('returns a Stripe checkout URL', async () => {
      const firm = await createTestFirm()
      const url = await BillingService.createCheckoutSession(firm.id, 'owner@firm.com')
      expect(url).toBe('https://checkout.stripe.com/test')
    })
    it('includes trial period in session params', async () => {
      const { stripe } = await import('../lib/stripe')
      const firm = await createTestFirm()
      await BillingService.createCheckoutSession(firm.id, 'owner@firm.com')
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_data: expect.objectContaining({ trial_period_days: 14 }),
        }),
      )
    })
  })

  describe('handleWebhookEvent', () => {
    it('sets subscriptionStatus to active on subscription.updated', async () => {
      const firm = await createTestFirm({ stripeCustomerId: 'cus_abc' })
      await BillingService.handleWebhookEvent('customer.subscription.updated', {
        customer: 'cus_abc',
        status: 'active',
      })
      const updated = await prisma.firm.findUniqueOrThrow({ where: { id: firm.id } })
      expect(updated.subscriptionStatus).toBe('active')
    })
    it('sets subscriptionStatus to cancelled on subscription.deleted', async () => {
      const firm = await createTestFirm({
        stripeCustomerId: 'cus_abc',
        subscriptionStatus: 'active',
      })
      await BillingService.handleWebhookEvent('customer.subscription.deleted', {
        customer: 'cus_abc',
        status: 'cancelled',
      })
      const updated = await prisma.firm.findUniqueOrThrow({ where: { id: firm.id } })
      expect(updated.subscriptionStatus).toBe('cancelled')
    })
    it('ignores unknown event types without throwing', async () => {
      await expect(BillingService.handleWebhookEvent('invoice.paid', {})).resolves.not.toThrow()
    })
  })
})
```

- [ ] Task 1.6a complete

### Task 1.6b — Billing routes

```typescript
// apps/api/src/routes/billing.test.ts
import { vi } from 'vitest'

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: vi.fn().mockResolvedValue({ url: 'https://stripe.com/pay' }) },
    },
    webhooks: { constructEvent: vi.fn() },
  },
}))

import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'

describe('POST /billing/checkout', () => {
  it('returns 401 when unauthenticated', async () => {
    expect((await api.post('/billing/checkout')).status).toBe(401)
  })
  it('returns checkout URL', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).post('/billing/checkout')
    expect(res.status).toBe(200)
    expect(res.body.url).toContain('stripe.com')
  })
})

describe('POST /billing/webhook', () => {
  it('returns 400 when Stripe signature header is missing', async () => {
    expect((await api.post('/billing/webhook').send('{}')).status).toBe(400)
  })
})
```

**Important:** The `/billing/webhook` route must use `express.raw({ type: 'application/json' })` as its body parser — not `express.json()`. Stripe signature verification will fail otherwise. Mount it before the global `express.json()` middleware.

- [ ] Task 1.6b complete

---

**PHASE 1 DONE WHEN:**

- [ ] All task checkboxes above ticked
- [ ] `npm test` — all tests green
- [ ] `npm run test:coverage` — Lines ≥ 80%, Functions ≥ 80%, Branches ≥ 70%
- [ ] Google sign-in works end-to-end in browser
- [ ] Client CRUD verified via manual curl or Insomnia

---

# PHASE 2 — Checklists, portal, file uploads

**Goal:** Templates, client portal (public, no auth), S3 uploads, email notifications.
**Estimated hours:** ~8 hrs
**Done when:** All checkboxes ticked AND coverage gates pass.

---

## Task 2.1 — Checklist templates

### Task 2.1a — Template schema

```typescript
// apps/api/src/schemas/template.schema.test.ts
import { createTemplateSchema } from './template.schema'

describe('createTemplateSchema', () => {
  it('accepts valid template with items', () => {
    expect(
      createTemplateSchema.safeParse({
        name: 'SA Pack',
        items: [{ label: 'P60', required: true, sortOrder: 0 }],
      }).success,
    ).toBe(true)
  })
  it('rejects empty items array', () => {
    expect(createTemplateSchema.safeParse({ name: 'Pack', items: [] }).success).toBe(false)
  })
  it('rejects blank name', () => {
    expect(createTemplateSchema.safeParse({ name: '', items: [{ label: 'P60' }] }).success).toBe(
      false,
    )
  })
  it('rejects item with blank label', () => {
    expect(createTemplateSchema.safeParse({ name: 'Pack', items: [{ label: '' }] }).success).toBe(
      false,
    )
  })
})
```

- [ ] Task 2.1a complete

### Task 2.1b — ChecklistService

```typescript
// apps/api/src/services/checklist.service.test.ts
import { ChecklistService } from './checklist.service'
import { prisma } from '../lib/prisma'
import {
  createTestFirm,
  createTestClient,
  createTestTemplate,
  createTestChecklistItem,
} from '../test/factories'
import { NotFoundError } from '../errors/AppError'

describe('ChecklistService', () => {
  describe('createTemplate', () => {
    it('creates template with items in correct sort order', async () => {
      const firm = await createTestFirm()
      const tmpl = await ChecklistService.createTemplate(firm.id, {
        name: 'SA Pack',
        items: [
          { label: 'P60', required: true, sortOrder: 0 },
          { label: 'Bank', required: true, sortOrder: 1 },
        ],
      })
      expect(tmpl.items).toHaveLength(2)
      expect(tmpl.items[0].label).toBe('P60')
      expect(tmpl.items[1].label).toBe('Bank')
    })
    it('scopes template to firm', async () => {
      const firm = await createTestFirm()
      const tmpl = await ChecklistService.createTemplate(firm.id, {
        name: 'Pack',
        items: [{ label: 'P60', required: true, sortOrder: 0 }],
      })
      expect(tmpl.firmId).toBe(firm.id)
    })
  })

  describe('applyTemplateToClient', () => {
    it('copies template items onto client as ChecklistItems', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const tmpl = await createTestTemplate(firm.id)
      await ChecklistService.applyTemplateToClient(firm.id, client.id, tmpl.id)
      const updated = await prisma.client.findUniqueOrThrow({
        where: { id: client.id },
        include: { items: true },
      })
      expect(updated.items.length).toBe(tmpl.items.length)
    })
    it('preserves sort order from template', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const tmpl = await createTestTemplate(firm.id)
      await ChecklistService.applyTemplateToClient(firm.id, client.id, tmpl.id)
      const updated = await prisma.client.findUniqueOrThrow({
        where: { id: client.id },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      })
      expect(updated.items[0].sortOrder).toBe(0)
    })
    it('throws NotFoundError when template belongs to another firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const client = await createTestClient(firmA.id)
      const tmpl = await createTestTemplate(firmB.id)
      await expect(
        ChecklistService.applyTemplateToClient(firmA.id, client.id, tmpl.id),
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('getClientProgress', () => {
    it('returns total, completed, percentage', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await createTestChecklistItem(client.id, { required: true, completedAt: new Date() })
      await createTestChecklistItem(client.id, { required: true })
      const p = await ChecklistService.getClientProgress(client.id)
      expect(p.total).toBe(2)
      expect(p.completed).toBe(1)
      expect(p.percentage).toBe(50)
    })
    it('optional items do not count toward percentage', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await createTestChecklistItem(client.id, { required: true, completedAt: new Date() })
      await createTestChecklistItem(client.id, { required: false })
      const p = await ChecklistService.getClientProgress(client.id)
      expect(p.percentage).toBe(100)
    })
  })
})
```

- [ ] Task 2.1b complete

### Task 2.1c — Template routes

```typescript
// apps/api/src/routes/templates.test.ts
import { makeAuthedRequest } from '../test/helpers'
import {
  createTestFirm,
  createTestUser,
  createTestTemplate,
  createTestClient,
} from '../test/factories'

describe('POST /templates', () => {
  it('creates template with nested items and returns 201', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/templates')
      .send({
        name: 'SA Pack',
        items: [{ label: 'P60', required: true, sortOrder: 0 }],
      })
    expect(res.status).toBe(201)
    expect(res.body.items).toHaveLength(1)
  })
  it('returns 400 for empty items', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (
        await makeAuthedRequest(user.id, firm.id)
          .post('/templates')
          .send({ name: 'Pack', items: [] })
      ).status,
    ).toBe(400)
  })
})

describe('GET /templates', () => {
  it('returns only this firms templates', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const user = await createTestUser(firmA.id)
    await createTestTemplate(firmA.id)
    await createTestTemplate(firmB.id)
    const res = await makeAuthedRequest(user.id, firmA.id).get('/templates')
    expect(res.body).toHaveLength(1)
  })
})

describe('POST /clients/:id/apply-template', () => {
  it('applies template and returns updated client with items', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const tmpl = await createTestTemplate(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/apply-template`)
      .send({ templateId: tmpl.id })
    expect(res.status).toBe(200)
    expect(res.body.items.length).toBeGreaterThan(0)
  })
  it('returns 404 when template belongs to another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const user = await createTestUser(firmA.id)
    const client = await createTestClient(firmA.id)
    const tmpl = await createTestTemplate(firmB.id)
    expect(
      (
        await makeAuthedRequest(user.id, firmA.id)
          .post(`/clients/${client.id}/apply-template`)
          .send({ templateId: tmpl.id })
      ).status,
    ).toBe(404)
  })
})
```

- [ ] Task 2.1c complete

---

## Task 2.2 — Upload service (S3)

```typescript
// apps/api/src/services/upload.service.test.ts
import { mockClient } from 'aws-sdk-client-mock'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { UploadService } from './upload.service'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'
import { prisma } from '../lib/prisma'

const s3Mock = mockClient(S3Client)
beforeEach(() => s3Mock.reset())

const filePayload = (firmId: string, clientId: string, itemId: string) => ({
  checklistItemId: itemId,
  firmId,
  clientId,
  buffer: Buffer.from('PDF content'),
  filename: 'p60.pdf',
  mimeType: 'application/pdf',
  fileSize: 11,
})

describe('UploadService', () => {
  describe('uploadFile', () => {
    it('saves Upload record in DB after successful S3 put', async () => {
      s3Mock.on(PutObjectCommand).resolves({})
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const item = await createTestChecklistItem(client.id)
      const upload = await UploadService.uploadFile(filePayload(firm.id, client.id, item.id))
      expect(upload.filename).toBe('p60.pdf')
      expect(await prisma.upload.count()).toBe(1)
    })

    it('S3 key matches pattern uploads/{firmId}/{clientId}/{itemId}/*.pdf', async () => {
      s3Mock.on(PutObjectCommand).resolves({})
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const item = await createTestChecklistItem(client.id)
      await UploadService.uploadFile(filePayload(firm.id, client.id, item.id))
      const key = s3Mock.commandCalls(PutObjectCommand)[0].args[0].input.Key!
      expect(key).toMatch(
        new RegExp(`^uploads/${firm.id}/${client.id}/${item.id}/[a-z0-9-]+\\.pdf$`),
      )
    })

    it('does not save to DB when S3 throws', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('S3 down'))
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const item = await createTestChecklistItem(client.id)
      await expect(
        UploadService.uploadFile(filePayload(firm.id, client.id, item.id)),
      ).rejects.toThrow('S3 down')
      expect(await prisma.upload.count()).toBe(0)
    })
  })
})
```

- [ ] Task 2.2 complete

---

## Task 2.3 — Notification service

```typescript
// apps/api/src/services/notification.service.test.ts
import { vi } from 'vitest'

vi.mock('../lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({ id: 'email-123' }) } },
}))

import { NotificationService } from './notification.service'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'

describe('NotificationService', () => {
  describe('sendPortalInvite', () => {
    it('sends email to client address', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm({ name: 'ACME CPA' })
      const client = await createTestClient(firm.id, { email: 'bob@client.com' })
      await NotificationService.sendPortalInvite(client.id)
      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'bob@client.com' }),
      )
    })
    it('email body contains the portalToken', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await NotificationService.sendPortalInvite(client.id)
      const call = (resend.emails.send as any).mock.calls.at(-1)[0]
      expect(call.html).toContain(client.portalToken)
    })
    it('subject contains firm name', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm({ name: 'Smith CPA' })
      const client = await createTestClient(firm.id)
      await NotificationService.sendPortalInvite(client.id)
      const call = (resend.emails.send as any).mock.calls.at(-1)[0]
      expect(call.subject).toContain('Smith CPA')
    })
  })

  describe('sendUploadReceived', () => {
    it('sends notification to accountant mentioning client and item label', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id, { name: 'Alice' })
      const item = await createTestChecklistItem(client.id, { label: 'P60' })
      await NotificationService.sendUploadReceived(item.id)
      const call = (resend.emails.send as any).mock.calls.at(-1)[0]
      expect(call.subject).toContain('Alice')
    })
  })

  describe('sendChecklistComplete', () => {
    it('sends completion notification to accountant', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id, { name: 'Bob' })
      await NotificationService.sendChecklistComplete(client.id)
      const call = (resend.emails.send as any).mock.calls.at(-1)[0]
      expect(call.subject).toContain('Bob')
    })
  })
})
```

- [ ] Task 2.3 complete

---

## Task 2.4 — Portal routes

```typescript
// apps/api/src/routes/portal.test.ts
import { vi } from 'vitest'

vi.mock('../services/notification.service', () => ({
  NotificationService: {
    sendUploadReceived: vi.fn().mockResolvedValue(undefined),
    sendChecklistComplete: vi.fn().mockResolvedValue(undefined),
  },
}))
vi.mock('../services/upload.service', () => ({
  UploadService: {
    uploadFile: vi
      .fn()
      .mockResolvedValue({ id: 'upload-1', filename: 'p60.pdf', storagePath: 's3://test' }),
  },
}))

import { api } from '../test/helpers'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'

describe('GET /portal/:token', () => {
  it('returns 404 for unknown token', async () => {
    expect((await api.get('/portal/unknown-token')).status).toBe(404)
  })
  it('returns client, firm branding, and items without auth', async () => {
    const firm = await createTestFirm({ name: 'CPA Ltd', accentColor: '#ff0000' })
    const client = await createTestClient(firm.id, { name: 'Alice' })
    await createTestChecklistItem(client.id, { label: 'P60' })
    const res = await api.get(`/portal/${client.portalToken}`)
    expect(res.status).toBe(200)
    expect(res.body.client.name).toBe('Alice')
    expect(res.body.firm.accentColor).toBe('#ff0000')
    expect(res.body.items[0].label).toBe('P60')
  })
  it('returns 404 for archived client', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id, { archived: true })
    expect((await api.get(`/portal/${client.portalToken}`)).status).toBe(404)
  })
})

describe('POST /portal/:token/upload/:itemId', () => {
  it('returns 400 when no file attached', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    expect((await api.post(`/portal/${client.portalToken}/upload/${item.id}`)).status).toBe(400)
  })
  it('returns 400 for disallowed file type', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const res = await api
      .post(`/portal/${client.portalToken}/upload/${item.id}`)
      .attach('file', Buffer.from('data'), {
        filename: 'virus.exe',
        contentType: 'application/exe',
      })
    expect(res.status).toBe(400)
  })
  it('marks item complete and returns updated item on success', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const res = await api
      .post(`/portal/${client.portalToken}/upload/${item.id}`)
      .attach('file', Buffer.from('%PDF-1.4'), {
        filename: 'p60.pdf',
        contentType: 'application/pdf',
      })
    expect(res.status).toBe(200)
    expect(res.body.item.completedAt).toBeDefined()
  })
})
```

- [ ] Task 2.4 complete

---

**PHASE 2 DONE WHEN:**

- [ ] All task checkboxes above ticked
- [ ] `npm test` — all tests green
- [ ] `npm run test:coverage` — all thresholds pass
- [ ] Portal loads at `/portal/:token` in browser without login
- [ ] File upload to S3 verified (use a real test bucket or localstack)
- [ ] Invite email arrives in a real inbox (use Resend test mode)

---

# PHASE 3 — Dashboard, reminders, branding, launch

**Goal:** Dashboard stats, automated reminders, firm branding, e2e tests, production deploy.
**Estimated hours:** ~6 hrs
**Done when:** All checkboxes ticked, e2e passes, production smoke test passes.

---

## Task 3.1 — Reminder service + cron route

```typescript
// apps/api/src/services/reminder.service.test.ts
import { vi } from 'vitest'
vi.mock('./notification.service', () => ({
  NotificationService: { sendReminderToClient: vi.fn().mockResolvedValue(undefined) },
}))

import { ReminderService } from './reminder.service'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

describe('ReminderService', () => {
  describe('getOverdueClients', () => {
    it('returns incomplete clients created more than 7 days ago', async () => {
      const firm = await createTestFirm()
      const old = await createTestClient(firm.id, { createdAt: daysAgo(8), status: 'in_progress' })
      await createTestChecklistItem(old.id)
      const recent = await createTestClient(firm.id, { status: 'in_progress' })
      await createTestChecklistItem(recent.id)
      const overdue = await ReminderService.getOverdueClients()
      expect(overdue.map((c) => c.id)).toContain(old.id)
      expect(overdue.map((c) => c.id)).not.toContain(recent.id)
    })
    it('excludes archived clients', async () => {
      const firm = await createTestFirm()
      const archived = await createTestClient(firm.id, { createdAt: daysAgo(8), archived: true })
      await createTestChecklistItem(archived.id)
      expect((await ReminderService.getOverdueClients()).map((c) => c.id)).not.toContain(
        archived.id,
      )
    })
    it('excludes complete clients', async () => {
      const firm = await createTestFirm()
      const done = await createTestClient(firm.id, { createdAt: daysAgo(8), status: 'complete' })
      await createTestChecklistItem(done.id)
      expect((await ReminderService.getOverdueClients()).map((c) => c.id)).not.toContain(done.id)
    })
  })

  describe('sendPendingReminders', () => {
    it('returns count of reminders sent', async () => {
      const firm = await createTestFirm()
      for (let i = 0; i < 2; i++) {
        const c = await createTestClient(firm.id, { createdAt: daysAgo(8 + i) })
        await createTestChecklistItem(c.id)
      }
      expect(await ReminderService.sendPendingReminders()).toBe(2)
    })
  })
})
```

```typescript
// apps/api/src/routes/internal.test.ts
import { vi } from 'vitest'
vi.mock('../services/reminder.service', () => ({
  ReminderService: { sendPendingReminders: vi.fn().mockResolvedValue(3) },
}))
import { api } from '../test/helpers'

describe('POST /internal/reminders/send', () => {
  it('returns 401 without cron secret header', async () => {
    expect((await api.post('/internal/reminders/send')).status).toBe(401)
  })
  it('returns 401 with wrong secret', async () => {
    expect((await api.post('/internal/reminders/send').set('x-cron-secret', 'wrong')).status).toBe(
      401,
    )
  })
  it('returns 200 with count when secret is correct', async () => {
    process.env.CRON_SECRET = 'test-cron-secret'
    const res = await api.post('/internal/reminders/send').set('x-cron-secret', 'test-cron-secret')
    expect(res.status).toBe(200)
    expect(res.body.sent).toBe(3)
  })
})
```

- [ ] Task 3.1 complete

---

## Task 3.2 — Dashboard stats

```typescript
// apps/api/src/routes/dashboard.test.ts
import { makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser, createTestClient } from '../test/factories'

describe('GET /dashboard/stats', () => {
  it('returns counts by status', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    await createTestClient(firm.id, { status: 'not_started' })
    await createTestClient(firm.id, { status: 'in_progress' })
    await createTestClient(firm.id, { status: 'complete' })
    await createTestClient(firm.id, { status: 'complete' })
    const res = await makeAuthedRequest(user.id, firm.id).get('/dashboard/stats')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ total: 4, notStarted: 1, inProgress: 1, complete: 2 })
  })

  it('excludes archived clients', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    await createTestClient(firm.id, { status: 'in_progress' })
    await createTestClient(firm.id, { status: 'in_progress', archived: true })
    const res = await makeAuthedRequest(user.id, firm.id).get('/dashboard/stats')
    expect(res.body.total).toBe(1)
  })

  it('returns 401 when not authenticated', async () => {
    const { api } = await import('../test/helpers')
    expect((await api.get('/dashboard/stats')).status).toBe(401)
  })
})
```

- [ ] Task 3.2 complete

---

## Task 3.3 — Firm branding

```typescript
// apps/api/src/routes/firms.test.ts
import { vi } from 'vitest'
vi.mock('../services/upload.service', () => ({
  UploadService: { uploadFile: vi.fn().mockResolvedValue({ storagePath: 's3://bucket/logo.png' }) },
}))

import { makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'

describe('PATCH /firms/me', () => {
  it('updates firm name', async () => {
    const firm = await createTestFirm({ name: 'Old' })
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).patch('/firms/me').send({ name: 'New' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New')
  })
  it('rejects invalid hex colour', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (
        await makeAuthedRequest(user.id, firm.id)
          .patch('/firms/me')
          .send({ accentColor: 'notahex' })
      ).status,
    ).toBe(400)
  })
  it('accepts valid hex colour', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .patch('/firms/me')
      .send({ accentColor: '#FF5733' })
    expect(res.status).toBe(200)
    expect(res.body.accentColor).toBe('#FF5733')
  })
})

describe('POST /firms/me/logo', () => {
  it('returns 400 for non-image file', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/firms/me/logo')
      .attach('logo', Buffer.from('data'), { filename: 'doc.pdf', contentType: 'application/pdf' })
    expect(res.status).toBe(400)
  })
  it('uploads image and updates logoUrl', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/firms/me/logo')
      .attach('logo', Buffer.from('PNG'), { filename: 'logo.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(res.body.logoUrl).toBeDefined()
  })
})
```

- [ ] Task 3.3 complete

---

## Task 3.4 — E2E tests (Playwright)

```typescript
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: '.',
  use: { baseURL: 'http://localhost:3000' },
  webServer: [
    { command: 'cd apps/api && npm run dev', port: 4000, reuseExistingServer: true },
    { command: 'cd apps/web && npm run dev', port: 3000, reuseExistingServer: true },
  ],
})
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/login/)
})
```

```typescript
// e2e/portal.spec.ts
import { test, expect } from '@playwright/test'

test('client opens portal without login', async ({ page }) => {
  const res = await page.request.post('http://localhost:4000/test/seed-client')
  const { portalToken } = await res.json()
  await page.goto(`/portal/${portalToken}`)
  await expect(page.getByText('Upload your documents')).toBeVisible()
})

test('completion screen appears after all required uploads', async ({ page }) => {
  const res = await page.request.post('http://localhost:4000/test/seed-client-with-one-item')
  const { portalToken, itemId } = await res.json()
  await page.goto(`/portal/${portalToken}`)
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'p60.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    })
  await expect(page.getByText(/all done/i)).toBeVisible({ timeout: 10000 })
})
```

**Note:** Google OAuth cannot be fully automated. Add a test-only route `POST /test/seed-user` (guarded by `NODE_ENV === 'test'`) that creates a user + firm, signs a JWT, and returns a redirect URL that sets the cookie. Use this in e2e tests instead of real OAuth.

- [ ] Task 3.4 complete

---

**PHASE 3 DONE WHEN:**

- [ ] All task checkboxes above ticked
- [ ] `npm test` — all tests green
- [ ] `npm run test:coverage` — all thresholds pass
- [ ] `npm run test:e2e` — all Playwright tests pass

---

# Deployment checklist

## Railway (API + DB)

- [ ] Create Railway project, add service pointing to `apps/api`
- [ ] Add managed Postgres plugin — copy `DATABASE_URL` to env vars
- [ ] Set all env vars (copy from `.env.example`, fill real values)
- [ ] Update `GOOGLE_CALLBACK_URL` to `https://api.yourdomain.com/auth/google/callback`
- [ ] Add production redirect URI in Google Cloud Console
- [ ] Register Stripe webhook: `https://api.yourdomain.com/billing/webhook`
- [ ] Run `npx prisma migrate deploy` against production DB
- [ ] Verify: `curl https://api.yourdomain.com/health` → `{ "status": "ok" }`

## Vercel (web)

- [ ] Create Vercel project from GitHub, root directory: `apps/web`
- [ ] Set `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- [ ] Configure custom domain

## Production smoke test (do manually after deploy)

- [ ] Sign in with Google → reaches dashboard
- [ ] Create a client → appears in list
- [ ] Create template → apply to client
- [ ] Send invite → email arrives with working link
- [ ] Open link in incognito → upload a file
- [ ] Accountant dashboard → item marked complete
- [ ] Stripe Checkout → subscription activates in DB

---

# Quick reference

```bash
# One-time setup
docker compose up -d
cd apps/api && npm run db:migrate && npm run db:migrate:test

# Daily dev
npm run dev               # API :4000, Web :3000, Adminer :8080

# Testing
npm test                  # all tests once
cd apps/api && npm run test:watch     # watch mode
cd apps/api && npm run test:coverage  # with coverage report
npm run test:e2e          # Playwright (needs running dev servers)

# Database
cd apps/api && npm run db:studio      # Prisma Studio :5555
cd apps/api && npm run db:reset:test  # wipe + re-migrate test DB
```
