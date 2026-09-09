# Design System

## Visual direction

The visual language is a contemporary woodland field guide crossed with a
personal Northwoods retreat: editorial, tactile, warm, and useful. It is not a
generic vacation-rental template, luxury resort, Halloween attraction, or
fantasy-game interface.

Favor strong full-bleed photography, purposeful open space, textural detail,
and practical information that is easy to scan. Preserve the existing nature
imagery, illustrated assets, and Coelbren identity moments before introducing
new visual language.

## Color tokens

Use the custom properties in `src/index.scss`. Do not add approximate
replacements when an existing token applies.

| Token | Value | Primary use |
| --- | --- | --- |
| `--color-forest` | `#172a24` | Dark fields, major backgrounds, dark buttons. |
| `--color-iron-ore` | `#464645` | Primary dark text and structural detail. |
| `--color-shiitake` | `hsl(35, 21%, 73%)` | Warm neutral surfaces. |
| `--color-shiitake-85` | `hsla(35, 21%, 73%, 0.85)` | Translucent warm overlays. |
| `--color-shiitake-90` | `hsla(35, 21%, 73%, 0.9)` | Stronger translucent warm overlays. |
| `--color-paper` | `#f6f0df` | Light reading surfaces and reversed type. |
| `--color-moss` | `#365449` | Secondary dark-green fields. |
| `--color-sienna` | `#684338` | Warm dark sectional contrast. |
| `--color-copper` | `#a95438` | Accent labels, links, and keyboard focus. |
| `--color-saffron` | `#e4a24c` | High-contrast accent on dark fields. |
| `--color-muted` | `#68716a` | Supporting copy. |
| `--color-border` | `rgba(70, 70, 69, 0.28)` | Subtle dividers. |

## Typography

| Role | Token | Stack | Use |
| --- | --- | --- | --- |
| Editorial display | `--font-serif` | `Iowan Old Style`, `Palatino Linotype`, Palatino, Georgia, serif | Page titles, section titles, and prominent quotations. |
| Body and UI | `--font-sans` | `Avenir Next`, `Gill Sans`, `Helvetica Neue`, sans-serif | Body copy, navigation, controls, labels, and metadata. |
| Identity accent | `--font-coelbren` | `Coelbren`, sans-serif | Selected inscriptions and identity moments only. |

Use regular display weights and comfortable body leading. Existing public-page
patterns keep supporting copy near `0.94rem` with `1.75` line-height and cap
long-form measures around `32rem`. Preserve these reading constraints instead
of expanding text across wide screens. The global minimum viewport width is
320px; test text wrapping at that width.

Small metadata and labels use uppercase sans text with positive letter spacing.
Use editorial-scale text only for true page and section moments, not compact
panels or controls.

## Coelbren

- Preserve existing Coelbren-rendered text.
- Use it for selected identity moments, inscriptions, or decorative headings.
- Do not use it for paragraphs, navigation labels, form controls, essential
  instructions, or other content whose immediate readability matters.
- Keep its conventional-language equivalent adjacent or otherwise available to
  assistive technology whenever the meaning is not already present.

## Layout And Motion

- The base responsive breakpoints are 600px and 1000px. Use grids that collapse
  to a single column when their content no longer reads comfortably.
- Public heroes are image-led, full-bleed sections with a dark overlay and a
  constrained content block. Preserve readable contrast over imagery.
- Use `clamp()` and constrained content widths for fluid layouts; avoid
  viewport-width font sizing and fixed dimensions that cause overflow.
- Existing entrance motion is restrained: a short fade and upward reveal.
  Respect `prefers-reduced-motion` for new animation and never make motion
  necessary to understand or operate a page.

## Accessibility Baseline

- Keep semantic landmarks, headings, labels, and native controls.
- The shared keyboard-focus treatment is a 2px copper outline with a 3px
  offset. Do not remove it without an equally visible replacement.
- Maintain contrast for text over photographs and colored fields.
- Provide useful alt text for informative images; use empty alt text for
  decorative illustrated assets.
- Keep galleries keyboard-operable and closeable with Escape. Preserve modal
  semantics, focus handling, and a usable close control when extending them.

## Component rules

| Component | Established treatment |
| --- | --- |
| Site header and footer | Reuse the shared site components for public pages. Keep navigation concise, semantic, and mobile-friendly. |
| Hero | Use real property or surrounding-landscape photography, a readable dark overlay, a conventional title, optional Coelbren accent, and a clear next action. Do not add coordinates or private location details. |
| Buttons and links | Use the existing `.button`, `.button-light`, `.button-dark`, `ArrowLink`, and text-link patterns. Buttons perform actions; links navigate. Preserve focus, hover, and active states. |
| Section markers and headings | Pair a concise eyebrow or marker with a serif heading. Use a grid or band rather than decorative nested cards. |
| Amenity details | Use factual lists, definition lists, and restrained dividers. Do not invent amenity categories or capabilities. |
| Gallery | Use the established filter toolbar, responsive image grid, lazy loading for non-priority imagery, and accessible lightbox behavior. |
| Forms | Use visible labels, grouped fields, inline error messages, and responsive single-column fallbacks. Validate on the client and server. |
| Quotes and lore | Use sparingly as a textural break; practical directions and policy belong in plain conventional text. |
| Mobile navigation | Preserve touch-friendly targets and ensure navigation, action labels, and long property names wrap without overlap. |

## Photography And Content Safety

- Favor real images of the cabin and surrounding property.
- Do not add people or animals to property imagery.
- Remove or crop addresses and other identifying details. Never restore
  information that was deliberately removed.
- Do not materially misrepresent room size, views, amenities, or condition.
- Prefer natural color and lived-in texture over high-saturation real-estate
  processing.

Read [content-and-privacy.md](content-and-privacy.md) before adding imagery,
captions, alt text, metadata, or any location-related content.