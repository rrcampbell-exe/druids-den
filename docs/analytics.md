# Analytics

Vercel Web Analytics and Speed Insights are mounted in the client entry point. Custom client events flow through `src/utils/analytics.js`; analytics failures are intentionally non-blocking.

## Current Events

The site uses Vercel's aggregate Web Analytics and Speed Insights. Do not add
custom events for retired reservation, reporting, or account workflows.

Client and server utilities only forward primitive string, number, and boolean payload values. The server utility forwards a small allowlist of attribution headers and excludes authorization and cookie headers.

## Data Rules

- Use event names that describe behavior, not a person or private property fact.
- Use low-cardinality properties such as route, flow stage, boolean outcome, or approved role/status where operationally necessary.
- Never include names, email addresses, telephone numbers, message text, reservation notes, stay dates, feedback content, street address, coordinates, access information, passcodes, tokens, database URLs, or webhook secrets.
- Do not add arbitrary request headers to server analytics. Expand the allowlist only after a privacy review.
- Review provider dashboards and access controls as operational systems containing telemetry, not as public documentation sources.

## Adding Or Changing Events

1. Define an event name that is stable and action-oriented.
2. Add only primitive, non-sensitive properties.
3. Use `trackEvent` in client code; do not call provider APIs ad hoc.
4. Add focused tests where event behavior matters and confirm tracking failure cannot break the user flow.
5. Update this document and review [content and privacy](ai/content-and-privacy.md).

Do not treat analytics as a source of booking availability, guest identity, or property-access data.