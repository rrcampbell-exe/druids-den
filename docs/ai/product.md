# Product Reference

## Purpose

The Druids Den is a private cabin in Conover, Wisconsin, in the forested
Northwoods of Vilas County. The public site presents a distinctive, personal
place rather than a standardized vacation-rental product.

The site should make the cabin and surrounding woods central while keeping
practical information clear. It must never substitute atmospheric language for
an accurate statement of what is available, how a stay works, or who can access
private information.

## Audiences

1. People considering a future stay.
2. Invited guests seeking public-facing practical context.
3. Approved guests requesting a stay through the application.
4. Owners, hosts, and grove keepers managing guest accounts and reservations.

The public site should feel secluded, welcoming, curious, crafted, and
trustworthy. It should not feel gimmicky, generic, overly luxurious, or like a
fantasy-game interface.

## Current Stay Model

| Topic | Current policy or behavior |
| --- | --- |
| Public booking | Not available. There is no public calendar or instant-booking flow. |
| Inquiry | Visitors contact the owners, hosts, or grove keepers directly by email or text. |
| Booking platform | Lodgify is planned but is not active. Do not imply an active platform integration. |
| Nightly estimate | $150 per night. This is the current implementation baseline and needs owner review before any pricing change is published. |
| Minimum stay | Two nights. |
| Check-in | 4 p.m. |
| Check-out | 10 a.m. |
| Capacity | Up to six guests. |
| Pets | Not permitted. Do not infer otherwise from photography or past copy. |
| Smoking | Only permitted outdoors. No smoking of any kind is permitted indoors. |

The current implementation is an invitation-oriented hospitality beta. Do not
invent availability, fees, cancellation terms, accessibility claims, or other
guest policies that have not been confirmed by the owners.

## Confirmed Cabin Information

The cabin information currently represented in the site is verified for use in
public content. It includes sleeping space for up to six, a full kitchen,
radiant in-floor heat, an indoor gas fireplace, fiber internet with potentially
spotty cellular reception, a projector and DVD collection, a covered
porch, patio, gas grill, outdoor fire pit, and surrounding woods.

Describe amenities accurately and with the qualifications already established
in the public content. In particular, weather, seasonal road conditions,
wildlife, cellular reception, and outdoor features require sensible, current
context. Never represent a planned amenity or unverified local recommendation
as available.

## Page And Access Model

| Surface | Intended audience | Product boundary |
| --- | --- | --- |
| Public site: `/`, `/the-den`, `/gallery`, `/northwoods`, `/story` | Everyone | Discovery, cabin context, and regional field notes. |
| `/stay` | Everyone | Direct inquiry only; no public booking or availability. |
| `/traditions` | Everyone with the route | Deployed seasonal and property traditions content; it may remain unlinked while it develops. |
| `/spooktoberfest` | Event invitees | A separate passcode-protected event experience. Treat dates, itinerary, and logistics as event-specific rather than general stay policy. |
| `/guide` | Invited guests in intent, currently public in implementation | Helpful general guidance only. It must not contain actual arrival instructions, address, Wi-Fi credentials, access codes, or owner contact details while publicly routable. |
| `/reservations` | Approved signed-in guests | Reservation-request workflow. |
| `/dashboard` | Owners and administrators | Private operational interface. |
| `/feedback/:reservationId` | Guests with a valid feedback link | Post-stay feedback collection. |

Read [content-and-privacy.md](content-and-privacy.md) before changing public
copy, metadata, imagery, guest-guide content, or analytics. Read
[architecture.md](architecture.md) before changing routes, access controls, or
reservation behavior.

## Content Hierarchy

Each public page should answer, in roughly this order:

1. What is this place?
2. Why might it matter to the visitor?
3. What can the visitor accurately expect here?
4. What practical or seasonal context matters?
5. What is the appropriate next action?

Use direct inquiries as the next action until an owner-approved public booking
experience exists. Avoid urgency, availability implications, price promotions,
and claims that turn private hospitality into an unsupported commercial offer.

## Canonical Language

| Subject | Preferred wording |
| --- | --- |
| Property | The Druids Den; the Den; the cabin. |
| Location | Conover, Wisconsin; the forested Northwoods of Vilas County. |
| Nearby context | Eagle River is about 15 minutes away; Michigan's Upper Peninsula is about 15 minutes away. Use only when useful to visitor context, never as directions. |
| Hosts | Owners, hosts, or grove keepers. |
| Experience | Private, invitation-oriented, thoughtful, wooded, and practical. |

Do not publish a street address, coordinates, turn-by-turn directions, private
road details that identify the property, access procedures, Wi-Fi credentials,
or personal contact details. Do not call the property a resort, an Airbnb, a
public rental marketplace, or an instant-booking destination.