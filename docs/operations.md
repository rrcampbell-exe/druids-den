# Operations

The application deploys to Vercel as a Vite single-page application with
serverless API handlers. `vercel.json` rewrites non-API application paths to
the SPA entry point and configures API functions with 1024 MB memory and a
10-second maximum duration.

## Production Configuration

Set production values in the Vercel project environment configuration. Treat
these groups differently:

| Group | Examples | Handling |
| --- | --- | --- |
| Browser-visible | WeatherAPI settings, visual feature flags | May ship to clients; never store secrets or guest-private details. |
| Public booking destinations | `VITE_AIRBNB_BOOKING_URL`, `VITE_VRBO_BOOKING_URL` | Optional. Set only to verified, property-specific HTTPS listing URLs. |
| Server-only email | `RESEND_API_KEY`, optional `RESEND_WEBHOOK_SECRET` | Keep in Vercel environment configuration only. |
| Server-only event secret | `SPOOKTOBERFEST_PASSCODE` | Keep in Vercel environment configuration only; never log or commit. |

The guide route is public. Keep the address, Wi-Fi, arrival, access, and
guest-support details out of browser-visible variables and public assets. See
[content and privacy](ai/content-and-privacy.md).

## Deployment Sequence

1. Review product, privacy, route, API, and environment effects.
2. Run `npm run lint`, `npm run test:run`, and `npm run build`.
3. Verify production environment values are present and correctly scoped.
4. Deploy to Vercel.
5. Verify public routing, external listing links, the event passcode flow, and
   inbound-email notifications.
6. Check Vercel logs, Analytics, and Speed Insights for unexpected errors or
   degraded performance.

## Inbound Email Webhook

Register the deployed `/api/receive-email` endpoint in Resend. Set
`RESEND_WEBHOOK_SECRET` and `RESEND_API_KEY` as server-only environment
variables. Confirm an invalid signature is rejected and a valid provider test
event succeeds. Do not disable verification to resolve a configuration
problem. Inbound processing forwards metadata notifications; view the original
email content in the provider dashboard.

## One-Time Legacy Data Retirement

`scripts/retire-legacy-data.sql` is a destructive SQL migration for the
application-owned reservation and account tables. It has not been applied.
Before running it:

1. Confirm with the database owner that the target database contains no other
   application's data and that these records may be deleted.
2. Export a backup and verify that it can be restored.
3. Test the script against a disposable restore of the target database and
   review its effects.
4. Obtain explicit owner/operator approval, then run it once through the
   approved database administration channel.

The script deliberately avoids `CASCADE` so unexpected dependencies stop the
transaction. Do not execute it against an unverified or shared database. After
the migration is confirmed, remove obsolete database environment variables
from the Vercel project.

## Monitoring And Incident Response

- Use Vercel deployment logs for function failures and webhook processing
  errors.
- Use Vercel Analytics and Speed Insights for aggregate product and
  performance signals. Do not introduce personal or precise location data
  into event payloads.
- For a bad deployment, use the Vercel dashboard to promote a known-good
  deployment or redeploy a known-good revision, then investigate before
  reapplying changes.
- Rotate a leaked or suspected secret at its provider and in Vercel
  immediately, then invalidate related webhook secrets as the provider
  supports.

## Release Checklist

- Environment variables are correctly classified and no secret is
  client-visible.
- The Resend webhook URL and server-only secrets are current.
- Public routes reveal no private property, guest, or access information.
- Required checks and focused tests passed.
- Mobile and desktop critical flows were inspected.
- The Vercel rollback path is known to the operator.
