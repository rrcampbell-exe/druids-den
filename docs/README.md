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

- [Local development](local-development.md): prerequisites, safe environment
  setup, database workflow, and local servers.
- [API reference](api.md): endpoint contracts, authentication, errors,
  webhooks, and rate limits.
- [Authentication and accounts](auth-and-accounts.md): Clerk synchronization,
  roles, account states, and authorization boundaries.
- [Data model](data-model.md): Prisma entities, relationships, soft deletion,
  migrations, and business constraints.
- [Testing](testing.md): test layout, mocks, coverage, and validation commands.
- [Analytics](analytics.md): event instrumentation and data-minimization rules.

## Operations

- [Operations](operations.md): deployment, production configuration, webhook
  registration, monitoring, rollback, and secret-management responsibilities.

## Source Of Truth

Code and configuration describe current implementation behavior. Owner-confirmed
policy in the product reference governs public-facing stay terms and claims.
When they differ, do not silently repeat the conflict: preserve privacy, flag
the mismatch, and obtain owner direction before publishing new content.