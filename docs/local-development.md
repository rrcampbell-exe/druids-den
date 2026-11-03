# Local Development

## Prerequisites

Install Node.js 24 or later. Resend and WeatherAPI credentials are optional
for local feature testing; never place real production secrets in committed
files.

Install project dependencies with:

```sh
npm install
```

## Environment Files

Environment files are ignored by Git. Create them manually in the repository
root or pull approved development values through the Vercel CLI. The repository
does not currently ship an environment template.

Use `.env.local` for local settings. `npm run start:local` loads `.env` and
`.env.local` before starting Vercel development.

| Variable group | Purpose | Visibility |
| --- | --- | --- |
| `VITE_WEATHER_API_KEY` | Weather widget | Browser-visible. |
| `VITE_AIRBNB_BOOKING_URL` and `VITE_VRBO_BOOKING_URL` | Optional verified property-specific listing URLs | Browser-visible; use only public listing destinations. |
| `RESEND_API_KEY` and optional `RESEND_WEBHOOK_SECRET` | Inbound-email notifications | Server-only. |
| `SPOOKTOBERFEST_PASSCODE` | Event passcode gate | Server-only. |

Do not configure private address, Wi-Fi, arrival, access, or guest-support
details as Vite variables. Read [content and privacy](ai/content-and-privacy.md)
before configuring values.
`vite.config.js` explicitly allowlists browser-visible variables. Review
public visibility before adding another variable to that allowlist; the
`VITE_` prefix does not make a value private.

## Run The Application

Use the full Vercel environment when exercising API routes or webhooks:

```sh
npm run start:local
```

Use `npm start` for the ordinary Vercel development command. Use `npm run dev`
only for the Vite client; serverless API routes are unavailable there. Build
and preview the production client with:

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

For a change in one behavior, run the corresponding targeted Vitest file
first, then the full test run when the behavior crosses component or API
boundaries. See [testing](testing.md) for the test layout and mock conventions.

## Common Boundaries

- Email is not forwarded when `RESEND_API_KEY` is absent; do not treat a local
  run without it as proof of delivery behavior.
- The public `/guide` route must only use placeholder or non-sensitive values.
- Full webhook testing requires reachable local endpoints and development
  secrets; verify signatures rather than disabling verification.
