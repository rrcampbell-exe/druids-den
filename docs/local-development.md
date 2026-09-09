# Local Development

## Prerequisites

Install Node.js 24 or later and PostgreSQL. A full local stack also needs Clerk
development credentials. Resend and WeatherAPI credentials are optional for
local feature testing; never place real production secrets in committed files.

Install project dependencies with:

```sh
npm install
```

## Environment Files

Environment files are ignored by Git. Create them manually in the repository
root or pull approved development values through the Vercel CLI. The repository
does not currently ship `.env.example` or `.env.clerk.local.example` templates.

Use `.env.local` for ordinary local settings. Use `.env.clerk.local` only when
localhost Clerk credentials must override values loaded from other sources.
`npm run start:local` loads `.env`, `.env.local`, and `.env.clerk.local` in that
order, then maps local overrides to the runtime variable names used by Vercel.

| Variable group | Purpose | Visibility |
| --- | --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` and optional `VITE_LOCAL_CLERK_PUBLISHABLE_KEY` | Clerk client authentication | Browser-visible. |
| `VITE_WEATHER_API_KEY` | Weather widget | Browser-visible. |
| `VITE_GUIDE_*` | Guest-guide placeholders | Browser-visible. Never use for private address, Wi-Fi, or access data. |
| `DATABASE_URL` and optional `PRISMA_DATABASE_URL` | PostgreSQL and optional Prisma Accelerate connection | Server-only. |
| `DEV_DATABASE_URL` and optional `DEV_PRISMA_DATABASE_URL` | Explicit local database overrides | Server-only. |
| Clerk, Resend, and passcode secrets | Authentication, webhooks, email, and event gate | Server-only. |

Read [content and privacy](ai/content-and-privacy.md) before configuring values.
In particular, the `VITE_` prefix does not make a value private.

## Database Workflow

Generate the Prisma client before commands that require it:

```sh
npx prisma generate
```

Apply migrations to the configured local database:

```sh
npm run db:deploy
```

Seed synthetic development data when appropriate:

```sh
npm run db:seed
```

`npm run db:reset` drops and recreates the target database before seeding it.
Use it only with a disposable local database; confirm the resolved connection
string before running it.

`prisma.config.ts` and `api/_utils/db.js` prefer `DEV_*` database overrides in
local development. This is intended to prevent accidental use of a shared
database, but it does not replace careful environment review.

## Run The Application

Use the full-stack Vercel environment when exercising API routes or webhooks:

```sh
npm run start:local
```

Use `npm start` for the ordinary Vercel development command. Use `npm run dev`
only for the Vite client; serverless API routes are unavailable there. Build and
preview the production client with:

```sh
npm run build
npm run preview
```

## Local Checks

```sh
npm run lint
npm run test:run
npm run build
```

For a change in one behavior, run the corresponding targeted Vitest file first,
then the full test run when the behavior crosses component, API, auth, or data
boundaries. See [testing](testing.md) for the test layout and mock conventions.

## Common Boundaries

- A missing Clerk publishable key intentionally stops the client during startup.
- Email is logged rather than sent when `RESEND_API_KEY` is absent; do not treat
  that as proof of delivery behavior.
- The public `/guide` route must only use placeholder or non-sensitive values.
- Full webhook testing requires reachable local endpoints and development
  secrets; verify signatures rather than disabling verification.