# Content And Privacy

## Purpose

This document governs public-facing copy, metadata, images, analytics, and
guest-facing material. It protects the privacy of the property, guests, and
owners while preserving useful context about The Druids Den.

When this document conflicts with promotional convenience, privacy wins.

## Information Classification

| Classification | May appear in public content | Examples |
| --- | --- | --- |
| Public | Yes, when accurate | The Druids Den, Conover, Wisconsin, Northwoods context, general amenities, public inquiry method, owner-confirmed stay terms. |
| Guest-private | No | Street address, coordinates, turn-by-turn directions, private-road access details, arrival procedure, entry codes, Wi-Fi name and password, host phone number, guest reservation details. |
| Secret | No | API keys, database URLs, webhook signing secrets, Clerk secret keys, passcodes, authentication tokens. |
| Personal data | No, except within authorized operational flows | Guest contact details, messages, reviews before publication approval, account status, reservation data, IP addresses, and user agents. |

Never move information from a more restricted class into a less restricted
one. Do not reconstruct information removed from an image or infer a policy
from a photograph.

## Public Copy Rules

- Use the safe location wording from [product.md](product.md): “Conover,
  Wisconsin” and, where useful, “the forested Northwoods of Vilas County.”
- Mention Eagle River or Michigan's Upper Peninsula only as general regional
  context. Do not turn those references into directions or proximity claims
  beyond the owner-approved descriptions.
- Do not publish the street address, precise coordinates, route markers,
  identifiable private-road details, access instructions, or personal contact
  details in copy, source comments, filenames, alt text, captions, metadata,
  structured data, sitemap annotations, or analytics event properties.
- State only owner-confirmed policies and amenities. Pets are not permitted and
  smoking is not permitted indoors. Do not preserve older exceptions or infer either
  policy from property imagery.
- Do not promise availability, accessibility, local business operations,
  pricing changes, booking-platform integration, or guest policy that owners
  have not confirmed.

## Guest Guide Boundary

`/guide` is intended for invited guests but is currently a public route. It
may contain general, safety-oriented, and seasonal information, but it must not
contain actual private arrival details, Wi-Fi credentials, access codes, or
personal contact details.

Vite variables with the `VITE_` prefix are embedded in the client bundle. In
particular, `VITE_GUIDE_ADDRESS`, `VITE_GUIDE_WIFI_NAME`, and
`VITE_GUIDE_WIFI_PASSWORD` are browser-visible configuration, not secret
storage. Do not configure real private values there.

Before real private guide details can be placed in the application, implement
one of these reviewed designs:

1. Protect the guide for approved guests and retrieve details from an
   authorization-checked server endpoint.
2. Keep the guide public and deliver all private arrival information through a
   separate approved communication channel.

## Images, Alt Text, And Metadata

- Favor unedited, truthful images of the cabin, grounds, and surrounding
  landscape. Do not use images to imply unavailable amenities or permission for
  activities such as pets.
- Review new images at full resolution before adding them. Crop or reject any
  image that reveals an address, entry mechanism, license plate, private
  communications, identifiable guest information, or other restricted detail.
- Alt text should describe the visible image, not hidden location or access
  information. Decorative asset icons use empty alt text.
- Check image filenames, captions, EXIF/other metadata, Open Graph metadata,
  JSON-LD, `robots.txt`, and the sitemap for restricted information.
- Do not restore text, blur reversals, or otherwise recover deliberately
  removed identifying information.

## Analytics And Logs

- Track product behavior, not identity. Use low-cardinality, non-sensitive
  event names and properties such as route, action, role, or account status
  only where operationally necessary.
- Do not send names, email addresses, telephone numbers, message text,
  reservation notes, dates, precise location data, passcodes, authentication
  material, or private guest-guide content to analytics.
- Treat server logs and webhook payloads as operational data. Redact before
  copying into tickets, screenshots, documentation, or public channels.

## Review Checklist

Before merging a change that affects content, imagery, routes, environment
variables, analytics, or metadata, confirm:

- The change contains no private location, arrival, access, Wi-Fi, contact,
  guest, or credential data.
- Every public policy, amenity, price, and local statement is owner-confirmed.
- New imagery and its metadata have been reviewed at full resolution.
- Alt text is useful without exposing restricted information.
- Browser-visible `VITE_*` values contain no secrets or guest-private data.
- New analytics events do not include personal or location-sensitive data.
- The mobile view remains readable and the keyboard/focus behavior still works.

Escalate uncertain content to the owners before publication. Do not make a
privacy-sensitive fact “safe” by obscuring it with atmospheric prose.