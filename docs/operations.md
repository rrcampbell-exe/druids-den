# Operations

The application deploys to Vercel as a Vite single-page application with Vercel serverless API handlers. `vercel.json` rewrites non-API application paths to the SPA entry point and configures API functions with 1024 MB memory and a 10-second maximum duration.

## Production Configuration

Set production values in the Vercel project environment configuration. Treat these groups differently:

| Group | Examples | Handling |
| --- | --- | --- |
| Browser-visible | `VITE_CLERK_PUBLISHABLE_KEY`, WeatherAPI settings, visual feature flags | May ship to clients; never store secrets or guest-private details. |
| Server-only application | database URL, Clerk secret, Resend key, owner-email setting | Keep in Vercel environment configuration only. |
| Server-only webhook and event secrets | Clerk/Resend signing secrets and event passcode | Keep in Vercel environment configuration only; never log or commit. |

Do not configure real address, Wi-Fi, arrival, or access values through `VITE_GUIDE_*`. The current guide route is public. See [content and privacy](ai/content-and-privacy.md).

## Deployment Sequence

1. Review product, privacy, route, API, authentication, migration, and environment effects.
2. Run `npm run lint`, `npm run test:run`, and `npm run build`.
3. Verify production environment values are present and correctly scoped.
4. Apply reviewed Prisma migrations with `npm run db:deploy` against the intended production database.
5. Deploy to Vercel.
6. Verify public routing, approved-account access, owner/admin access, and relevant server endpoints.
7. Check Vercel logs, Analytics, and Speed Insights for unexpected errors or degraded performance.

Do not use `npm run db:reset` outside a disposable local database.

## Webhook Registration

Register the deployed `/api/webhooks/clerk` endpoint in Clerk and the deployed `/api/receive-email` endpoint in Resend. Set the matching signing secret in server-only environment configuration before accepting production events.

Confirm an invalid webhook signature is rejected and a valid provider test event succeeds. Do not disable verification to resolve a configuration problem. Resend inbound processing forwards metadata notifications; view the original email content in the provider dashboard.

## Monitoring And Incident Response

- Use Vercel deployment logs for function failures and webhook processing errors.
- Use Vercel Analytics and Speed Insights for aggregate product and performance signals. Do not introduce personal or precise location data into event payloads.
- For a bad deployment, use the Vercel dashboard to promote a known-good deployment or redeploy a known-good revision, then investigate before reapplying changes.
- Rotate a leaked or suspected secret at its provider and in Vercel immediately, then invalidate related sessions or webhooks as the provider supports.
- Maintain database backups and recovery procedures with the database provider. Prisma migrations are not backups.

## Release Checklist

- Environment variables are correctly classified and no secret is client-visible.
- Migrations were reviewed and applied to the intended database.
- Clerk and Resend webhook URLs and signing secrets are current.
- Public routes reveal no private property, guest, or access information.
- Required checks and focused tests passed.
- Mobile and desktop critical flows were inspected.
- The rollback path and database recovery contact are known to the operator.