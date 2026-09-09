# API Reference

All endpoints are Vercel serverless handlers under `/api/`. JSON is the normal request and response format. The API is used by the application itself; changes to its contracts require matching client changes and focused API tests.

## Authentication And Errors

Authenticated endpoints require `Authorization: Bearer <Clerk token>`. A valid token identifies the Clerk user; the application database controls approval status and roles. Owner/admin endpoints require an approved `OWNER` or `ADMIN` application user.

| Status | Meaning |
| --- | --- |
| `200` | Successful read or mutation. |
| `201` | Owner reservation created. |
| `207` | Reservation persisted, but one or more emails failed. |
| `400` | Invalid request, validation failure, or conflict on selected endpoints. |
| `401` | Missing, invalid, or expired authentication token; invalid/missing Resend webhook signature. |
| `403` | Signed-in account is unapproved or lacks the required role. |
| `404` | Requested reservation or guest account does not exist. |
| `405` | HTTP method is unsupported. |
| `409` | Guest reservation dates overlap a pending or approved reservation. |
| `429` | A rate limit was exceeded. |
| `500` | Server configuration or unexpected processing error. |

Errors use an `error` string and may include `message` or `details`.

## Public Endpoints

| Method | Endpoint | Contract |
| --- | --- | --- |
| `GET` | `/api/availability` | Returns `{ reservations: [{ checkIn, checkOut }] }` for non-deleted pending and approved reservations. Dates are `YYYY-MM-DD`. |
| `POST` | `/api/verify-passcode` | Accepts `{ page: "spooktoberfest", passcode }`. A correct passcode returns `{ success: true, token }`; the token supports the event page's current client-session gate. |

`/api/verify-passcode` is limited to 10 requests per 10 minutes per server instance/IP. Its passcode is server configuration and must never be sent to the client or stored in documentation.

## Guest Reservation Endpoint

`POST /api/send-reservation` requires an approved account. It accepts the guest's name, contact information, `checkIn`, `checkOut`, adult/child counts, and optional `specialRequests`. Dates must be `YYYY-MM-DD`; names, email, phone, counts, and free text are validated and sanitized server-side.

The handler recalculates the estimated total and rejects overlap with non-deleted pending or approved reservations. It does not rely on a client-provided total. On success, it persists a pending reservation and attempts guest/owner email notifications.

This endpoint is limited to 60 requests per minute per server instance/IP.

## Owner And Administrator Endpoints

| Methods | Endpoint | Contract |
| --- | --- | --- |
| `GET`, `POST` | `/api/reservations` | List non-deleted reservations or create an approved owner reservation. Creation requires `checkIn` and `checkOut`; optional fields include adult/child counts and an owner note. |
| `PATCH`, `DELETE` | `/api/reservations/[id]` | Change reservation status/details or set `deletedAt` for the reservation. Status changes support `pending`, `approved`, `denied`, and `cancelled`. |
| `GET`, `PATCH` | `/api/users` | List non-deleted guest accounts or update one guest's `accountStatus`. The patch body requires `userId` and one of `PENDING_APPROVAL`, `APPROVED`, `DENIED`, or `REVOKED`. |
| `POST` | `/api/message-guest` | Send an owner/admin message for a guest reservation. Requires `reservationId` and non-empty `message`; owner reservations cannot receive guest messages. |

`GET /api/user/status` requires an authenticated account and returns the current serialized application user. It is limited to 600 requests per minute per server instance/IP.

Status changes and reservation changes may generate transactional email. Email failure handling is endpoint-specific and does not reverse a successful data write.

## Webhooks

| Endpoint | Source | Behavior |
| --- | --- | --- |
| `POST /api/webhooks/clerk` | Clerk | Requires Svix headers and signature verification. Synchronizes user-created/updated events, soft-deletes matched users for user deletion, and tracks successful sessions. |
| `POST /api/receive-email` | Resend | Optionally verifies Svix-style signature headers when `RESEND_WEBHOOK_SECRET` is configured, sanitizes metadata, and forwards a notification. Full inbound email bodies remain in Resend. |

Register each production endpoint with its provider and set the corresponding server-only signing secret. Never disable webhook verification outside a deliberate, reviewed local-development scenario.

The Clerk webhook delivery limit is 240 requests/minute; verified `user.created` events have an additional 10-per-24-hours limit. The delivery limit is applied before signature verification; the signup limit is applied after verification.

## Rate-Limit Scope

The current rate limiter is in-memory, per-instance, and resets on cold starts. It provides best-effort protection only: limits are not shared between Vercel instances or regions. It is bypassed during tests. Do not document it as a distributed abuse-prevention guarantee without replacing the backing store.

## Contract Changes

When changing an endpoint, update this document, its handler/API tests, the calling client code, analytics payload review, and the architecture reference. Apply the privacy review before adding fields that could contain guest or property-sensitive information.