# API Reference

The remaining Vercel serverless handlers support the Spooktoberfest passcode
gate and inbound email notifications. There are no first-party reservation,
availability, account, or reporting APIs.

## Public Endpoints

| Method | Endpoint | Contract |
| --- | --- | --- |
| `POST` | `/api/verify-passcode` | Accepts `{ page: "spooktoberfest", passcode }`. A correct passcode returns `{ success: true, token }`; the token supports the event page's current client-session gate. |

`/api/verify-passcode` is limited to 10 requests per 10 minutes per server
instance/IP. Its passcode is server configuration and must never be sent to
the client or stored in documentation.

## Inbound Email Webhook

`POST /api/receive-email` accepts Resend inbound-email events, sanitizes email
metadata, and sends an owner notification through Resend. The provider retains
the full inbound email body; the webhook notification contains metadata rather
than the original message body. `RESEND_WEBHOOK_SECRET`, when configured,
enables signature validation. The handler requires `RESEND_API_KEY` to send
the notification.

Register this endpoint with Resend and configure the server-only secrets in
Vercel. Do not disable signature validation to resolve a configuration
problem.

## Responses And Rate Limits

| Status | Meaning |
| --- | --- |
| `200` | Request processed. |
| `400` | Invalid passcode page or webhook request. |
| `401` | Invalid passcode or invalid/missing configured webhook signature. |
| `405` | HTTP method is unsupported. |
| `429` | The passcode rate limit was exceeded. |
| `500` | Server configuration or unexpected processing error. |

The passcode rate limiter is in-memory, per-instance, and resets on cold
starts. It provides best-effort protection only; limits are not shared across
Vercel instances or regions.

## Contract Changes

When changing a handler, update this document, its focused API tests, the
calling client code, and the architecture reference. Apply the privacy review
before adding fields that could contain guest or property-sensitive
information.
