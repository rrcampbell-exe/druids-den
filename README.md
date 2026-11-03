# The Druids Den

The public website for The Druids Den, a private cabin in Conover, Wisconsin.
It introduces the cabin, its Northwoods setting, photography, traditions, and
rental information. Visitors discover stays through verified external listing
links when configured.

**Tech stack:** React 19 · Vite · Vercel Functions · Vercel Analytics and Speed
Insights · Resend inbound email · WeatherAPI

## Documentation

Start with [docs/README.md](docs/README.md) for the documentation map. Before
changing product, public content, design, privacy-sensitive material, routes,
or architecture, read the relevant reference in `docs/ai/`.

- [Product reference](docs/ai/product.md)
- [Design system](docs/ai/design-system.md)
- [Content and privacy](docs/ai/content-and-privacy.md)
- [Architecture reference](docs/ai/architecture.md)
- [Local development](docs/local-development.md)
- [Operations](docs/operations.md)

## Getting Started

**Prerequisite:** Node.js 24 or later.

```sh
npm install
npm run start:local
```

`npm run start:local` loads `.env` and `.env.local` when present, then starts
Vercel development so both the website and API handlers are available. See
[local development](docs/local-development.md) for environment setup.

| Script | Purpose |
|---|---|
| `npm start` | Full-stack development through Vercel |
| `npm run start:local` | Vercel development with local environment files |
| `npm run dev` | Frontend-only Vite development |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Run tests with coverage |
| `npm run test:run` | Run tests without coverage |
| `npm run test:ui` | Interactive Vitest UI |

## Public Site

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/the-den`, `/what-to-expect` | Cabin overview and compatibility alias |
| `/gallery` | Photo journal |
| `/northwoods` | Regional field guide |
| `/story` | Property story |
| `/traditions` | Traditions content |
| `/stay` | Rental information and verified external listing links |
| `/guide` | Public general guest information; no private arrival details |
| `/spooktoberfest` | Passcode-protected event page |

The public email address is for general inquiries; contacting the owners does
not reserve a stay. Do not invent listing URLs, availability, prices,
policies, or private property information.

## API Endpoints

The remaining Vercel handlers are:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/verify-passcode` | Validate the Spooktoberfest passcode |
| `POST` | `/api/receive-email` | Forward metadata notifications for inbound email |

See the [API reference](docs/api.md) for contracts and rate-limit details.

## Environment Variables

| Variable | Visibility | Purpose |
|---|---|---|
| `VITE_WEATHER_API_KEY` | Browser-visible | Weather widget |
| `VITE_AIRBNB_BOOKING_URL` | Browser-visible | Optional verified property-specific listing URL |
| `VITE_VRBO_BOOKING_URL` | Browser-visible | Optional verified property-specific listing URL |
| `RESEND_API_KEY` | Server-only | Send inbound-email notifications |
| `RESEND_WEBHOOK_SECRET` | Server-only | Optional inbound webhook signature verification |
| `SPOOKTOBERFEST_PASSCODE` | Server-only | Event passcode |

Every `VITE_*` value is public. Never put secrets, private guest information,
arrival details, Wi-Fi credentials, access codes, or the cabin address in a
browser-visible variable.

## Testing

The project uses Vitest and Testing Library.

```sh
npm run lint
npm run test:run
npm run build
```

See [testing](docs/testing.md) for test organization, coverage, and validation
guidance.

## Deployment

The site deploys to Vercel. Configure the environment variables above, register
`/api/receive-email` with Resend, and verify public routes, external listing
links, the event passcode flow, and inbound-email notifications after
deployment. See [operations](docs/operations.md).

The legacy application data is retired through the one-time destructive SQL
script at `scripts/retire-legacy-data.sql`. Follow the backup, restore-test,
and approval requirements in the operations guide before running it. It must
not be run against a shared or unverified database.
