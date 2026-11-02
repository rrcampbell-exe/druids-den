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
2. Guests seeking practical public-facing context.
3. Approved guests using the legacy reservation-request workflow.
4. Owners, hosts, and grove keepers managing guest accounts and reservations.

The public site should feel secluded, welcoming, curious, crafted, and
trustworthy. It should not feel gimmicky, generic, overly luxurious, or like a
fantasy-game interface.

## Current Stay Model

| Topic | Current policy or behavior |
| --- | --- |
| Public booking | Not open yet. Use “Rental stays coming soon” until verified property-specific listing URLs are configured. |
| Booking platforms | Northwoods Signature Vacation Homes plans to manage the property-specific Airbnb and Vrbo listings through its accounts. Do not invent URLs or imply a live listing. |
| General inquiry | The existing owner email may be used for general questions; an email inquiry does not reserve a stay. |
| Public price | Do not publish a nightly rate. The legacy reservation system's estimate is internal and is not an approved public price. |
| Check-in / check-out | The public guide states 4 p.m. check-in and 10 a.m. checkout; Northwoods must confirm both before launch. |
| Capacity | Maximum occupancy is four guests, as stated in the current Property Rules information supplied for the rental transition. |
| Sleeping areas | One private bedroom plus an open loft, with a queen bed for two guests in each space. The loft is open to the main living area and reached by stairs. The living room is not an air-mattress sleeping area. |
| Bathroom | One bathroom. |
| Parking | Up to four vehicles, including trailers, on the driveway or designated parking pad. Winter snow can reduce usable space. |

Do not invent availability, a launch date, licensing or approval status, fees,
cancellation terms, accessibility claims, or guest policies. See the
[rental launch checklist](../launch-checklist.md) for unresolved confirmations.

## Confirmed Cabin Information

Owner-confirmed public cabin facts include a full kitchen, radiant floor heat,
a gas fireplace, fiber internet with potentially spotty cellular reception,
projector, covered porch, patio, grill, fire pit, and 5½ acres of private
forest in Conover, Wisconsin. Describe the setting as a woodland cabin with
nearby public lake access.

The supplied property photographs show a refrigerator, electric range and
oven, microwave, dishwasher, coffee maker, kettle, shower, vanity and toilet,
bedroom furnishings, bookshelves, and living-room furniture. The projector
setup materials document a DVD player. Describe these visible items
specifically, but do not infer guest supplies or policies from photographs.
Confirmed guest supplies include laundry, bed linens and towels, cookware,
games, DVDs, and books. Use those general descriptions without inventing
specific laundry equipment, cookware pieces, or game and DVD titles.
Toiletries, dinnerware, coffee/filters, and firewood remain unresolved. Do not
infer storage or other unpictured supplies from older copy.

## Page And Access Model

| Surface | Intended audience | Product boundary |
| --- | --- | --- |
| Public site: `/`, `/the-den`, `/gallery`, `/northwoods`, `/story` | Everyone | Discovery, cabin context, and regional field notes. |
| `/stay` | Everyone | Rental details and verified Airbnb/Vrbo links when configured. General email inquiries do not reserve a stay. |
| `/traditions` | Everyone with the route | Deployed seasonal and property traditions content; it may remain unlinked while it develops. |
| `/spooktoberfest` | Event invitees | A separate passcode-protected event experience. Treat dates, itinerary, and logistics as event-specific rather than general stay policy. |
| `/guide` | Public implementation | General guidance only. It must not contain actual arrival instructions, address, Wi-Fi credentials, access codes, or private guest-support details while publicly routable. |
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

Use “Rental stays coming soon” until verified property-specific booking links
are available. Once configured, make “Check availability” the primary action
to the Airbnb and/or Vrbo listing. Avoid urgency, invented availability, price
promotions, and claims that turn planned operations into approved policy.

## Canonical Language

| Subject | Preferred wording |
| --- | --- |
| Property | The Druids Den; the Den; the cabin. |
| Location | Conover, Wisconsin; the forested Northwoods of Vilas County. |
| Nearby context | Mention nearby towns, distances, or access only when verified and useful to visitors; do not turn them into directions to the property. |
| Hosts | Owners, hosts, or grove keepers. |
| Experience | Private, thoughtful, wooded, and practical. |

Do not publish a street address, coordinates, turn-by-turn directions, private
road details that identify the property, access procedures, Wi-Fi credentials,
or personal contact details. Do not call the property a resort, an Airbnb, a
public rental marketplace, or an instant-booking destination.