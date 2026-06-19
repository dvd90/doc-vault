# Deployment guide — Railway

DocVault deploys as **two services in a single Railway project**, backed by a managed
PostgreSQL plugin:

| Service | Root directory | Build (railpack default)                  | Start                                     |
| ------- | -------------- | ----------------------------------------- | ----------------------------------------- |
| API     | repo root      | `npm run build --workspace=@docvault/api` | `npm run start --workspace=@docvault/api` |
| Web     | `apps/web`     | `npm run build`                           | `npm run start`                           |

> The API's build/start scripts are self-contained: `build` runs `prisma generate && tsc -p tsconfig.build.json`
> and `start` runs `prisma migrate deploy && node dist/server.js`. Migrations run automatically on every boot.

---

## 1. Create the project

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → `dvd90/doc-vault`.
2. Add a **PostgreSQL** plugin (New → Database → PostgreSQL). This exposes a `DATABASE_URL`.

## 2. API service

- **Settings → Root Directory:** leave as the repo root (`/`).
- **Variables:** reference the Postgres plugin for `DATABASE_URL` (`${{ Postgres.DATABASE_URL }}`),
  then add the rest from the table below.
- **Networking → Generate Domain** → note the URL, e.g. `https://docvault-api.up.railway.app`.

### Required API environment variables

| Variable                | Notes                                                  |
| ----------------------- | ------------------------------------------------------ |
| `DATABASE_URL`          | Reference the Railway Postgres plugin                  |
| `JWT_SECRET`            | Long random string (`openssl rand -hex 32`)            |
| `JWT_EXPIRY`            | `30d`                                                  |
| `ADMIN_SECRET`          | Long random string — guards `/internal/admin/*`        |
| `CRON_SECRET`           | Long random string — guards `/internal/reminders/send` |
| `GOOGLE_CLIENT_ID`      | Google Cloud OAuth credentials                         |
| `GOOGLE_CLIENT_SECRET`  | Google Cloud OAuth credentials                         |
| `GOOGLE_CALLBACK_URL`   | `https://<api-domain>/auth/google/callback`            |
| `STRIPE_SECRET_KEY`     | `sk_live_…` (or `sk_test_…`)                           |
| `STRIPE_WEBHOOK_SECRET` | From the Stripe webhook endpoint                       |
| `STRIPE_PRICE_ID`       | `price_…` for the $49/mo plan                          |
| `STRIPE_TRIAL_DAYS`     | `14`                                                   |
| `AWS_ACCESS_KEY_ID`     | IAM key with S3 access                                 |
| `AWS_SECRET_ACCESS_KEY` | IAM secret                                             |
| `AWS_REGION`            | e.g. `eu-west-1`                                       |
| `AWS_S3_BUCKET`         | Your bucket name                                       |
| `RESEND_API_KEY`        | `re_…`                                                 |
| `FRONTEND_URL`          | `https://<web-domain>`                                 |
| `NODE_ENV`              | `production`                                           |

> Generate secrets locally:
>
> ```bash
> openssl rand -hex 32   # JWT_SECRET
> openssl rand -hex 24   # ADMIN_SECRET
> openssl rand -hex 24   # CRON_SECRET
> ```

## 3. Web service

- **New → GitHub Repo → same repo.**
- **Settings → Root Directory:** `apps/web`.
- **Variables:** `NEXT_PUBLIC_API_URL=https://<api-domain>`
- **Networking → Generate Domain** → this is your public site.

## 4. External provider wiring

- **Google Cloud Console → OAuth credentials:** add `https://<api-domain>/auth/google/callback`
  as an authorized redirect URI.
- **Stripe → Developers → Webhooks:** add endpoint `https://<api-domain>/billing/webhook`,
  subscribe to `customer.subscription.*` events, and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
- **AWS S3:** create the bucket and an IAM user with `s3:PutObject` / `s3:GetObject` on it.

## 5. Smoke test after deploy

```bash
curl https://<api-domain>/health        # → {"status":"ok"}
```

Then in a browser:

1. Open `https://<web-domain>` → landing page loads.
2. Click **Start free trial** → Google sign-in → lands on `/dashboard`.
3. Create a client, apply a template, send an invite.
4. Open the portal link in incognito → upload a file → item marks complete.
5. Admin panel: `https://<web-domain>/admin` → enter `ADMIN_SECRET` → stats load.

---

## Migrations

`prisma migrate deploy` runs automatically on every API boot via the `start` script, so new
migrations ship with each deploy. No manual step required.
