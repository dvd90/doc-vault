# DocVault

> Accountant document collection SaaS — accountants create checklists, send a magic link, clients upload files. No client login required.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express + TypeScript (strict) |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | Google OAuth 2.0 + JWT (HttpOnly cookie) |
| File storage | AWS S3 |
| Email | Resend |
| Payments | Stripe ($49/mo, 14-day trial) |
| Frontend | Next.js 14 (App Router) + Tailwind + shadcn/ui |
| Testing | Vitest (unit + integration) · Playwright (e2e) |
| Deployment | Railway (API + DB) · Vercel (web) |

---

## Quick start

```bash
# 1. Clone and install
git clone <repo> && cd docvault && npm install

# 2. Copy env files and fill in values
cp apps/api/.env.example apps/api/.env
cp apps/api/.env.test.example apps/api/.env.test

# 3. Start infrastructure
docker compose up -d

# 4. Migrate databases
cd apps/api
npm run db:migrate          # dev DB
npm run db:migrate:test     # test DB
cd ../..

# 5. Start dev servers (API :4000, Web :3000, Adminer :8080)
npm run dev
```

---

## Testing

```bash
npm test                                    # all tests once
cd apps/api && npm run test:watch           # watch mode
cd apps/api && npm run test:coverage        # coverage report (must pass ≥ 80%)
npm run test:e2e                            # Playwright (needs running dev servers)
```

Coverage thresholds enforced in CI: Lines ≥ 80%, Functions ≥ 80%, Branches ≥ 70%.

---

## Development approach

This project is built **test-first (TDD)**. The full plan, all test specifications, and phase-by-phase instructions live in [CLAUDE.md](./CLAUDE.md).

Rule: write a failing test → make it pass with minimum code → refactor → next test.

---

## Project structure

```
docvault/
├── apps/
│   ├── api/          # Express + TypeScript backend
│   └── web/          # Next.js 14 frontend
├── e2e/              # Playwright cross-app tests
├── docker-compose.yml
├── package.json      # npm workspaces root
├── tsconfig.base.json
├── README.md
└── CLAUDE.md         # Master plan — read this before every Claude Code session
```

---

## Claude Code usage

Start every session with:

```
Read CLAUDE.md fully. We are on Phase X, task Y.Z.
Write the failing test first. Do not write any implementation until the test exists and fails.
```

See [CLAUDE.md](./CLAUDE.md) for the complete phase plan, all test specs, configuration files, and deployment checklist.
