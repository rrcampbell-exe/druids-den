# The Druids Den

The online hub for **The Druids Den**, a cabin rental in Vilas County, Wisconsin. Guests discover the property, book stays, and leave feedback. Owners manage reservations, approve guest accounts, and view revenue analytics — all from a single app deployed on Vercel.

**Tech stack:** React 19 (Vite) · Vercel Serverless Functions · PostgreSQL (Prisma ORM + Accelerate) · Clerk Auth · Resend Email · WeatherAPI

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Public Pages](#public-pages)
  - [Landing Page](#landing-page)
  - [What to Expect](#what-to-expect)
  - [Spooktoberfest](#spooktoberfest)
- [Authentication & Accounts](#authentication--accounts)
  - [Sign-Up / Sign-In](#sign-up--sign-in)
  - [Account Approval Workflow](#account-approval-workflow)
- [Guest Features](#guest-features)
  - [Reservations](#reservations)
  - [Post-Stay Feedback](#post-stay-feedback)
- [Owner Dashboard](#owner-dashboard)
  - [At A Glance](#at-a-glance)
  - [Guest Management](#guest-management)
  - [Reports & Analytics](#reports--analytics)
  - [Guest Messaging](#guest-messaging)
- [Email System](#email-system)
- [API Reference](#api-reference)
- [Rate Limiting](#rate-limiting)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Getting Started

**Prerequisites:** Node.js ≥ 20.9, a PostgreSQL database, and accounts for [Clerk](https://clerk.com), [Resend](https://resend.com), and optionally [WeatherAPI](https://www.weatherapi.com).

```bash
# Install dependencies
npm install

# Copy and populate environment variables (see Environment Variables section)
cp .env.example .env.local
cp .env.clerk.local.example .env.clerk.local

# Generate the Prisma client, run database migrations, and seed test data
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# Start the full-stack dev server (Vite + Vercel Functions)
# Use start:local if Vercel Development env vars conflict with localhost Clerk auth
npm run start:local
```

| Script | Purpose |
|---|---|
| `npm start` | Full-stack dev server via `vercel dev` |
| `npm run start:local` | Full-stack dev server with local-only Clerk overrides from `.env.clerk.local` |
| `npm run dev` | Frontend only (Vite) |
| `npm run build` | Production build (generates Prisma client + Vite bundle) |
| `npm run lint` | ESLint check |
| `npm test` | Run tests with coverage |
| `npm run test:ui` | Interactive Vitest UI |
| `npm run db:reset` | Drop, re-migrate, and re-seed the database |

---

## Project Structure

```
├── api/                    # Vercel serverless functions (Node.js)
│   ├── _utils/             # Shared server utilities (auth, email, pricing, etc.)
│   ├── reservations/       # /api/reservations/[id] dynamic route
│   ├── user/               # /api/user/status
│   └── webhooks/           # Clerk webhook handler
├── prisma/
│   ├── schema.prisma       # Database models & enums
│   ├── seed.js             # Faker-based dev seed script
│   └── migrations/         # Migration history
├── public/                 # Static assets & images
├── src/
│   ├── components/         # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-level page components
│   │   └── dashboard/      # Owner dashboard sub-views
│   └── utils/              # Client-side helpers
├── __tests__/              # Mirrors src/ and api/ structure
├── vite.config.js          # Vite + Vitest configuration
└── vercel.json             # Deployment & function settings
```

---

## Public Pages

### Landing Page

The home page at `/`. Displays the cabin's branding with a custom Celtic font (Coelbren), the Awen symbol, a live weather widget for Conover, WI, and a call-to-action linking to the information page. A promotional link to Spooktoberfest appears automatically starting April 1.

### What to Expect

An informational guide at `/what-to-expect`. Covers cabin amenities, sleeping capacity (6 guests), house guidelines, parking, seasonal packing tips, and nearby attractions. Uses a floating sidebar navigation (PageNav) for jumping between sections.

### Spooktoberfest

A passcode-protected event page at `/spooktoberfest` for an annual October gathering. Guests enter a numeric passcode which is validated server-side. On success a token is stored in the browser and grants access for the session. The page details the multi-day itinerary, sleeping arrangements, and food logistics.

---

## Authentication & Accounts

### Sign-Up / Sign-In

Authentication is handled by [Clerk](https://clerk.com) at `/sign-in` and `/sign-up`. When a user signs up, a Clerk webhook syncs their profile to the app's PostgreSQL database. If the signup email matches the configured owner email, the account is auto-approved with the **OWNER** role. All other signups are created as **GUEST** accounts in **PENDING_APPROVAL** status.

### Account Approval Workflow

Guests cannot book until an owner approves their account. The flow:

1. Guest signs up → account is **PENDING_APPROVAL**.
2. Owner receives a notification email and sees the guest in the dashboard's Guests tab.
3. Owner approves, denies, or later revokes access.
4. Guest receives an email reflecting the decision.
5. Approved guests can access the reservation form; others see a status message.

Account statuses: `PENDING_APPROVAL` · `APPROVED` · `DENIED` · `REVOKED`

Roles: `GUEST` · `ADMIN` · `OWNER`

---

## Guest Features

### Reservations

Authenticated, approved guests book stays at `/reservations`. The form collects personal information (pre-filled from Clerk), check-in/check-out dates, party size, and special requests.

Key behaviors:
- **Date picker** fetches live availability and disables dates that overlap existing approved or pending reservations.
- **2-night minimum** stay is enforced.
- **Estimated total** is calculated automatically ($150/night).
- **Server-side validation** sanitizes all fields and re-checks date conflicts before creating a PENDING reservation.
- On success, confirmation emails are sent to both the guest and the owner.

### Post-Stay Feedback

After checkout, guests receive an email with a unique link to `/feedback/:reservationId`. The form collects a 1–5 star rating, optional review text, and a would-recommend toggle. Submissions are stored for owner review and potential use as public testimonials.

---

## Owner Dashboard

Accessible at `/dashboard` to users with the **OWNER** or **ADMIN** role.

### At A Glance

A month-view calendar showing all reservations color-coded by status (pending, approved, owner). Owners can approve, deny, or cancel reservations inline, create owner-hold reservations directly on the calendar, and click any reservation card for full details and edit capabilities. Date conflicts are validated on edits.

### Guest Management

A tabbed list of all user accounts filterable by status (Pending, Approved, Denied, Revoked). Owners change account status with one click. Each status change triggers an automated email to the guest explaining the decision.

### Reports & Analytics

Revenue and occupancy metrics with configurable date ranges (year-to-date, full year, or custom). Displays total revenue, average per-booking and per-night revenue, occupancy rate, booking counts, average stay length, lead time, and party size. Includes line and bar charts (Nivo) for monthly trends. Owner metrics can be toggled on or off.

### Guest Messaging

From any reservation card, owners can send free-form messages to guests. Messages are delivered via email with the reservation context included.

---

## Email System

Transactional email is powered by [Resend](https://resend.com). If `RESEND_API_KEY` is not set, emails are logged to the console instead — useful during development.

Emails sent by the system:
| Trigger | Recipient | Template |
|---|---|---|
| New reservation submitted | Owner + Guest | Admin notification + guest confirmation |
| Reservation approved | Guest | Approval with details |
| Reservation denied | Guest | Denial with owner message |
| Reservation cancelled | Guest | Cancellation with reason |
| Reservation edited | Guest | Modification summary |
| Account approved / denied / revoked | Guest | Status-specific message |
| New user signup | Owner | New guest notification |
| Custom message | Guest | Free-form owner message |
| Inbound email received | Owner | Forwarded notification |

Inbound emails to the property address are received via a Resend webhook at `/api/receive-email`, verified with Svix signatures, and forwarded to the owner.

---

## API Reference

All endpoints are Vercel serverless functions under `/api/`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/availability` | None | Fetch booked date ranges for the date picker |
| `POST` | `/api/send-reservation` | Approved guest | Submit a new reservation request |
| `GET` | `/api/reservations` | Owner/Admin | List all reservations |
| `POST` | `/api/reservations` | Owner/Admin | Create an owner reservation |
| `PATCH` | `/api/reservations/[id]` | Owner/Admin | Update status or details of a reservation |
| `DELETE` | `/api/reservations/[id]` | Owner/Admin | Soft-delete a reservation |
| `GET` | `/api/user/status` | Signed in | Fetch current user's app profile |
| `PATCH` | `/api/users` | Owner/Admin | Update a guest's account status |
| `POST` | `/api/message-guest` | Owner/Admin | Send a message to a guest |
| `POST` | `/api/verify-passcode` | None | Validate Spooktoberfest passcode |
| `POST` | `/api/receive-email` | Webhook (Svix) | Inbound email forwarding |
| `POST` | `/api/webhooks/clerk` | Webhook (Svix) | Clerk user lifecycle sync |

---

## Rate Limiting

Sensitive endpoints are protected by a per-IP rate limiter (`api/_utils/rateLimit.js`). Limits are tuned to the site's expected traffic profile — relaxed for authenticated users, stricter for public and signup paths.

| Endpoint | Limit | Window |
|---|---|---|
| `verify-passcode` | 10 requests | 10 minutes |
| `send-reservation` | 60 requests | 1 minute |
| `user/status` | 600 requests | 1 minute |
| `webhooks/clerk` (all events) | 240 requests | 1 minute |
| `webhooks/clerk` (user.created only) | 10 requests | 24 hours |

The client IP is resolved via `x-vercel-forwarded-for` → `x-real-ip` → `x-forwarded-for` (rightmost valid entry), preventing clients from spoofing the forwarded header to evade limits.

The webhook delivery limit fires **before** Svix signature verification so invalid-signature floods are rejected cheaply. The `user.created` signup limit fires after verification since it depends on the event type.

The store is **in-memory and per-instance**. It is not shared across concurrent serverless instances or regions and resets on cold starts. This provides best-effort protection; for strict guarantees swap the store for a shared backend (Redis, Vercel KV, Upstash).

Rate limiting is bypassed in the test environment. In production, exceeding a limit returns a `429` with a descriptive message.

---

## Input Validation & Sanitization

All user-submitted data is validated on both the client and server:

- **Client:** `src/utils/formValidation.js` checks email format, US phone format, name characters, date ranges, guest counts, and special request length before submission.
- **Server:** `api/_utils/sanitize.js` escapes HTML entities, strips control characters, enforces field-level format rules, and returns structured error objects. Reservation data passes through `sanitizeReservationData()` before any database write.

---

## Database

PostgreSQL via Prisma ORM with Prisma Accelerate for connection pooling.

**Models:** User · Reservation · BlackoutDate · Feedback · Message · AuditLog

Key design decisions:
- **Soft deletes** — `deletedAt` field on users and reservations; records are never physically removed.
- **Audit trail** — Reservation status changes record who made the change and when.
- **Clerk sync** — Users are upserted from Clerk webhook events; the app DB is the source of truth for roles and approval status.

```bash
# Apply pending migrations
npm run db:deploy

# Seed development data
npm run db:seed

# Reset everything (destructive)
npm run db:reset
```

---

## Environment Variables

### Frontend (Vite — `VITE_` prefix, exposed to browser)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk authentication public key |
| `VITE_LOCAL_CLERK_PUBLISHABLE_KEY` | Local only | Optional localhost override used by `npm run start:local` |
| `VITE_WEATHER_API_KEY` | No | WeatherAPI.com key; falls back to mock data in dev |

### Backend (Node.js — server-side only)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PRISMA_DATABASE_URL` | No | Prisma Accelerate proxy URL (overrides `DATABASE_URL` if set) |
| `CLERK_SECRET_KEY` | Yes | Clerk backend secret for token verification |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Yes | Svix key for verifying Clerk webhook payloads |
| `LOCAL_CLERK_SECRET_KEY` | Local only | Optional localhost override used by `npm run start:local` |
| `LOCAL_CLERK_WEBHOOK_SIGNING_SECRET` | Local only | Optional localhost override used by `npm run start:local` |
| `RESEND_API_KEY` | No | Resend email service key; emails log to console if unset |
| `RESEND_WEBHOOK_SECRET` | No | Svix key for verifying inbound email webhooks |
| `OWNER_EMAIL` | Yes | Owner's email — used for auto-approval matching and admin notifications |
| `SPOOKTOBERFEST_PASSCODE` | No | Numeric passcode for the Spooktoberfest page |

For localhost Clerk development, keep your normal Vercel-pulled env values in `.env.local` and put only the test Clerk keys in `.env.clerk.local`. `npm run start:local` loads that file and maps the override values onto the standard Clerk variable names before starting `vercel dev`.

---

## Testing

The project uses [Vitest](https://vitest.dev/) with `@testing-library/react` for component tests and direct handler invocation for API tests.

```bash
npm test              # Run with coverage
npm run test:run      # Run without coverage
npm run test:ui       # Interactive browser UI
```

**Coverage thresholds:** 80% lines · 80% functions · 75% branches · 80% statements

Tests are organized in `__tests__/` mirroring the source tree:

```
__tests__/
├── api/            # Serverless function handler tests
├── components/     # React component tests
├── hooks/          # Custom hook tests
├── pages/          # Page-level integration tests
│   └── dashboard/  # Dashboard sub-view tests
└── utils/          # Client utility tests
```

Global mocks (Clerk, fetch, localStorage, IntersectionObserver) are configured in `src/setupTests.js`.

---

## Deployment

The app deploys to [Vercel](https://vercel.com) with zero additional configuration beyond environment variables.

- **Frontend:** Vite builds a static SPA; all non-API routes are rewritten to `index.html`.
- **API:** Each file in `api/` becomes a serverless function (1024 MB memory, 10s max duration).
- **Database:** Prisma Accelerate is recommended for production connection pooling. Run `npm run db:deploy` after provisioning a new database.
- **Webhooks:** Register the deployed `/api/webhooks/clerk` URL in the Clerk dashboard and `/api/receive-email` in your Resend inbound routing settings.
