# The Druids Den

The Druids Den is the online home for a private Northwoods cabin rental in Vilas County, Wisconsin. The app combines a public marketing site, a guest reservation flow, an owner dashboard, a passcode-protected event page, and a serverless backend for reservations, guest approvals, email notifications, and Clerk-based authentication.

## Tech Stack

- React 19 + Vite 6
- React Router 7
- Clerk authentication (`@clerk/react`, `@clerk/backend`)
- Prisma 7 + PostgreSQL
- Vercel serverless functions for `/api/*`
- Sass for styling
- Nivo charts for dashboard reporting
- Vitest + Testing Library for unit and integration tests
- Playwright for browser-level integration testing

## Prerequisites

- Node.js 24+
- npm 11+
- PostgreSQL
- A Clerk development instance
- Optional but recommended: `nvm`

Use the checked-in Node version file before installing dependencies:

```bash
nvm use
npm install
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create local environment files as needed:

- `.env.local` for app and database settings
- `.env` for shared local secrets
- `.env.test` for Playwright-specific overrides

### 3. Required environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key used by the React app |
| `CLERK_SECRET_KEY` | Clerk backend secret for token verification and Playwright test helpers |
| `DATABASE_URL` | Direct PostgreSQL connection string |
| `PRISMA_DATABASE_URL` | Prisma Accelerate URL or direct database URL |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Verifies Clerk webhooks |
| `RESEND_API_KEY` | Sends guest and owner emails |
| `RESEND_WEBHOOK_SECRET` | Verifies inbound email webhook requests |
| `SPOOKTOBERFEST_PASSCODE` | Passcode for the protected Spooktoberfest route |
| `OWNER_EMAIL` | Receives guest account notifications |
| `VITE_WEATHER_API_KEY` | WeatherAPI key for the landing page weather widget |

### 4. Prepare the database

```bash
npm run db:deploy
npm run db:seed
```

### 5. Start the full app locally

```bash
npm start
```

Use `npm start`, not `npm run dev`, when you need `/api/*` routes locally. The Vite-only dev server does not serve the Vercel functions.

## Project Structure

| Path | Purpose |
| --- | --- |
| [src](src) | React frontend app |
| [src/components](src/components) | Reusable UI components |
| [src/pages](src/pages) | Route-level pages |
| [src/hooks](src/hooks) | Frontend hooks |
| [src/utils](src/utils) | Frontend utilities |
| [api](api) | Vercel serverless API routes |
| [api/_utils](api/_utils) | Shared backend helpers |
| [prisma](prisma) | Prisma schema, migrations, and seed data |
| [__tests__](__tests__) | Vitest-based unit and integration tests |
| [e2e](e2e) | Playwright integration tests |

## Frontend Routes

The main route configuration lives in [src/main.jsx](src/main.jsx#L10-L66).

| Route | Page | Access |
| --- | --- | --- |
| `/` | Landing | Public |
| `/what-to-expect` | What To Expect | Public |
| `/spooktoberfest` | Spooktoberfest | Passcode protected |
| `/reservations` | Reservations | Signed-in Clerk user with `APPROVED` app status |
| `/dashboard` | Owner Dashboard | Signed-in Clerk user with `OWNER` or `ADMIN` role |
| `/sign-in` | Clerk sign-in page | Public |
| `/sign-up` | Clerk sign-up page | Public |
| `/feedback/:reservationId` | Feedback form | Public link-based flow |

## Current Feature Set

### Public guest experience

- Branded landing page with weather widget and seasonal event CTA
- Long-form “What To Expect” property guide with anchored navigation
- Public feedback page scaffold for reservation-specific reviews

### Authenticated guest experience

- Clerk sign-in and sign-up flows
- App-level guest approval gate via [src/components/ClerkAuthGate.jsx](src/components/ClerkAuthGate.jsx)
- Reservation form with:
  - prefilled guest info from Clerk
  - custom date-range picker
  - blackout-date and overlap prevention
  - success and error modals

### Owner/admin experience

- Dashboard with tabs for:
  - At A Glance reservation management
  - Guest approval management
  - Analytics and reporting
- Owner date blocking flow for personal stays
- Reservation approval, denial, cancellation, messaging, and editing

### Special event experience

- Passcode-protected Spooktoberfest page using [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)

### Backend capabilities

- Reservation submission and owner reservation creation
- User status lookup and guest approval workflows
- Clerk webhook user sync
- Email sending and inbound email webhook handling
- Reservation availability endpoint for blackout dates

## Authentication Model

The app uses three access layers:

1. **Clerk auth** for sign-in and sign-up
2. **App-level authorization** via `/api/user/status` and `ClerkAuthGate`
3. **Passcode protection** for `/spooktoberfest`

Important files:

- [src/components/ClerkAuthGate.jsx](src/components/ClerkAuthGate.jsx)
- [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)
- [src/components/PendingApproval.jsx](src/components/PendingApproval.jsx)
- [api/_utils/auth.js](api/_utils/auth.js)

## API Endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/availability` | Returns blocked and pending reservation date ranges |
| `POST` | `/api/send-reservation` | Submits a guest reservation request |
| `GET` | `/api/reservations` | Lists reservations for owners/admins |
| `POST` | `/api/reservations` | Creates owner-blocked reservations |
| `PATCH` | `/api/reservations/[id]` | Updates reservation status or details |
| `DELETE` | `/api/reservations/[id]` | Soft-deletes a reservation |
| `GET` | `/api/users` | Lists guest accounts |
| `PATCH` | `/api/users` | Updates guest account status |
| `GET` | `/api/user/status` | Returns the current signed-in app user |
| `POST` | `/api/verify-passcode` | Verifies the Spooktoberfest passcode |
| `POST` | `/api/message-guest` | Sends a message to a guest |
| `POST` | `/api/receive-email` | Handles inbound email webhook traffic |
| `POST` | `/api/webhooks/clerk` | Syncs Clerk user lifecycle events |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Start the full-stack local dev environment with Vercel |
| `npm run start:test` | Start Vercel dev on port 3000 for Playwright |
| `npm run dev` | Start Vite-only frontend dev server |
| `npm run build` | Build the frontend |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest with coverage |
| `npm run test:coverage` | Explicit coverage run alias |
| `npm run test:ui` | Run Vitest UI |
| `npm run test:run` | Run Vitest once |
| `npm run test:e2e` | Run Playwright integration tests |
| `npm run test:e2e:ui` | Open Playwright UI mode |
| `npm run test:e2e:headed` | Run Playwright with a visible browser |
| `npm run test:e2e:debug` | Run Playwright in debug mode |
| `npm run test:e2e:report` | Open the Playwright HTML report |
| `npm run db:deploy` | Apply Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:reset` | Reset the database |

## Unit and Integration Tests with Vitest

Vitest is configured in [vite.config.js](vite.config.js#L7-L32) and uses [src/setupTests.js](src/setupTests.js) for global mocks and Testing Library setup.

### Run the existing suite

```bash
npm test
```

### Unit test coverage focus

- API handlers
- React components
- custom hooks
- validation and utility functions
- dashboard and passcode flows at the component level

### Coverage thresholds

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

Coverage output is written to [coverage/index.html](coverage/index.html).

## Playwright Integration Tests

Playwright is configured in [playwright.config.js](playwright.config.js) and the browser tests live in [e2e](e2e).

### What the Playwright suite covers

- Public landing and content pages
- Access gating for sign-in and sign-up routes
- Pending approval behavior for signed-in guests
- Authenticated reservation submission flow
- Owner dashboard reservation approvals and guest approvals
- Reports tab rendering
- Spooktoberfest passcode workflow

### Playwright environment variables

The browser suite is designed to run without real Clerk sign-in credentials. Authenticated scenarios use a **dev-only local auth override** plus mocked API responses so the tests remain stable and self-contained.

| Variable | Purpose |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Still required so Clerk-backed auth pages render correctly |
| `SPOOKTOBERFEST_PASSCODE` | Used by the passcode flow |
| `VITE_WEATHER_API_KEY` | Any non-empty value works in tests because the network is mocked |
| `PLAYWRIGHT_BASE_URL` | Optional override for the local app URL |
| `PLAYWRIGHT_SKIP_DB_SETUP` | Set to `true` to skip migration/seed work in global setup |
| `PLAYWRIGHT_SKIP_DB_SEED` | Set to `true` to skip seeding only |

### Run the Playwright suite locally

```bash
npm run test:e2e
```

Useful variants:

```bash
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
npm run test:e2e:report
```

### How the Playwright flow works

- [e2e/global-setup.js](e2e/global-setup.js) loads env vars and runs Prisma setup unless explicitly skipped.
- [e2e/helpers/clerk-auth.js](e2e/helpers/clerk-auth.js) injects a dev-only local auth state for approved guest, pending guest, and owner scenarios.
- [src/utils/e2eAuth.js](src/utils/e2eAuth.js) is the app-side dev-only auth bridge used by Playwright.
- [e2e/helpers/mock-api.js](e2e/helpers/mock-api.js) stabilizes API-heavy pages with deterministic route mocking while still exercising the real browser UI.
- [e2e/helpers/fixtures.js](e2e/helpers/fixtures.js) provides authenticated guest, pending guest, and owner fixtures.

## CI Pipeline and Deployment Gate

The GitHub Actions workflow lives at [.github/workflows/ci.yml](.github/workflows/ci.yml).

It runs in three stages:

1. **Unit tests**
2. **Playwright integration tests**
3. **Release gate**

The Playwright job depends on the unit-test job, and the release gate depends on both. That means:

- E2E tests do not run if unit tests fail
- the workflow is not successful unless both test suites pass
- deployment should be gated on the successful completion of this workflow or the `Release gate` job

### GitHub Actions secrets required for E2E

| Secret | Purpose |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for the app and Playwright |
| `SPOOKTOBERFEST_PASSCODE` | Passcode-protected event test flow |

If Vercel production deployment is configured separately, make that deployment depend on the successful `CI` workflow or the `Release gate` status check in GitHub branch protection.

## Troubleshooting

### `npm run dev` works but authenticated flows fail

Use `npm start`. The app's `/api/*` routes are only available through Vercel dev.

### Playwright fails during auth setup

Verify that:

- Clerk development keys are valid
- the app is running in dev mode so the local auth override is available
- the test has injected the expected local auth state before navigation

### Playwright skips or fails database setup

Check `DATABASE_URL` and `PRISMA_DATABASE_URL`, or set `PLAYWRIGHT_SKIP_DB_SETUP=true` if you are intentionally running a mocked-only browser session.

### Weather widget is missing in Playwright

Make sure `VITE_WEATHER_API_KEY` is set to a non-empty value. The tests mock the network response, but the component still expects a key to exist at runtime.
