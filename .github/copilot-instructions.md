# The Druids Den website

## Project purpose

This repository contains the public website for The Druids Den, a private
Northwoods cabin in Conover, Wisconsin.

The site should create a distinctive, atmospheric sense of place while still
being easy to understand and use. It may support future short-term-rental
discovery and guest information, but it should not invent booking functionality,
availability, policies, prices, or property claims that are not already present
in the repository.

Read the relevant files in `docs/ai/` before making substantial product,
content, design, or architectural changes. Use `docs/README.md` to find the
focused contributor and operator references.

## Product principles

- Treat the cabin and surrounding woods as the central experience.
- Favor warmth, curiosity, seclusion, craftsmanship, and restrained woodland
  mysticism.
- Keep practical visitor information easy to find despite the atmospheric design.
- Design mobile-first. Many visitors will encounter the site while traveling.
- Preserve the distinction between promotional content and confirmed guest policy.
- Do not invent amenities, accessibility claims, distances, prices, policies,
  availability, or local recommendations.

## Brand invariants

- Preserve the established Druids Den color palette. Use existing design tokens
  rather than introducing approximate colors.
- Preserve text that has been intentionally rendered or transformed using the
  Coelbren-inspired writing system.
- Coelbren is an accent and identity element, not the primary body typeface.
- Body text must remain highly legible.
- Reuse the site's existing nature imagery, textures, and visual motifs before
  introducing a different visual language.
- Avoid generic luxury-resort, corporate-template, or faux-medieval aesthetics.

See `docs/ai/design-system.md` for exact tokens, typography, and component rules.

## Privacy and property safety

- Never expose the cabin's street address in public text, image captions,
  structured data, source comments, filenames, alt text, maps, or metadata.
- Do not restore or reconstruct address information removed from photographs.
- Do not provide precise coordinates or directions that reveal the property
  unless the repository explicitly marks the content as private guest material.
- Do not imply that pets are permitted merely because a pet appears in source imagery.
- Treat access instructions, entry codes, Wi-Fi credentials, and owner contact
  information as private.
- Never commit secrets or credentials.
- Treat every `VITE_*` variable as browser-visible. In particular, do not put
  actual address, Wi-Fi, arrival, access, or credential values in
  `VITE_GUIDE_*` while `/guide` remains public.

See `docs/ai/content-and-privacy.md` before editing public-facing content.

## Engineering approach

Before changing code:

1. Inspect the relevant page, its shared components, and nearby implementations.
2. Identify the existing design and architectural pattern.
3. Prefer extending an existing component or token over creating a near-duplicate.
4. Determine whether the change affects mobile layout, accessibility, privacy,
   metadata, navigation, or structured data.

When implementing:

- Make the smallest coherent change that fully solves the problem.
- Preserve working behavior outside the requested scope.
- Keep content separate from presentation where the current architecture supports it.
- Use semantic HTML.
- Maintain keyboard access and visible focus states.
- Give informative images useful alt text and decorative images empty alt text.
- Respect reduced-motion preferences.
- Do not add dependencies when the existing stack can reasonably solve the problem.
- Do not replace intentional branded details with framework defaults.
- Avoid broad rewrites unless the requested change requires one.
- Reconcile affected product, architecture, API, auth, data, testing, analytics,
  and operations documentation when an implementation contract changes.

## Validation

Use the proportionate commands documented in `docs/ai/architecture.md` and
`docs/testing.md`.

For relevant changes:

- Run the focused test or documentation check first, then linting, tests, and
  the production build when the change affects executable behavior.
- Inspect the affected page at mobile and desktop widths.
- Check for overflow, layout shift, broken navigation, and unreadable contrast.
- Verify that no private location or property information was exposed.
- Confirm that Coelbren text and established brand colors remain intact.

If a validation command cannot be run, state that clearly instead of implying
that the change was verified.

## Response expectations

When completing a coding task, summarize:

- what changed;
- which files changed;
- what was validated;
- any assumptions or remaining risks.

Do not claim a problem is fixed solely because the code compiles.