# Documentation

This directory contains the maintained project documentation for The Druids
Den. Start with the reference that matches the work being performed rather than
using this index as a replacement for it.

## Change Guidance

The documents in `docs/ai/` are binding guidance for contributors and coding
agents making changes to the application.

- [Product reference](ai/product.md): product scope, owner-confirmed stay
  terms, content hierarchy, route boundaries, and canonical language.
- [Design system](ai/design-system.md): implemented visual tokens, typography,
  responsive patterns, accessibility baseline, and component rules.
- [Content and privacy](ai/content-and-privacy.md): public/private data
  boundary, media review, guest-guide restrictions, and analytics safety.
- [Architecture reference](ai/architecture.md): routes, access controls,
  service boundaries, data rules, and validation expectations.

## Contributor References

- [Local development](local-development.md): prerequisites, environment
  setup, and local servers.
- [API reference](api.md): remaining passcode and inbound-email endpoints,
  webhook behavior, and rate limits.
- [Testing](testing.md): test layout, mocks, coverage, and validation commands.
- [Analytics](analytics.md): event instrumentation and data-minimization rules.
- [Rental launch checklist](launch-checklist.md): unresolved property facts,
  booking and guest-support setup, and assets to confirm before launch.

## Operations

- [Operations](operations.md): deployment, production configuration, inbound
  email webhook registration, monitoring, rollback, and secret management.

## Source Of Truth

Code and configuration describe current implementation behavior. Owner-confirmed
policy in the product reference governs public-facing stay terms and claims.
When they differ, do not silently repeat the conflict: preserve privacy, flag
the mismatch, and obtain owner direction before publishing new content.