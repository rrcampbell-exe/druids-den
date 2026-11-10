import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLink,
  AssetIcon,
  AlternateBookingLinks,
  BookingAction,
  CoelbrenLabel,
  Meta,
  PageFrame,
  PhotoFigure,
  Quote,
  SectionMarker,
} from '../components/site/SiteComponents'
import { bookingLinks } from '../config/booking'
import './PublicPages.scss'

const imagePath = (name) => `/assets/images/${name}`

const PublicHero = ({ eyebrow, title, coelbren, description, image, alt, children }) => (
  <section className='public-hero'>
    <img className='public-hero-image' src={imagePath(image)} alt={alt} />
    <div className='public-hero-overlay' aria-hidden='true' />
    <div className='public-hero-content'>
      <span className='public-hero-eyebrow'>{eyebrow}</span>
      <CoelbrenLabel>{coelbren || title}</CoelbrenLabel>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </div>
    <div className='public-hero-foot'>
      <span>Conover, Wisconsin</span>
      <span>A private cabin in the Northwoods</span>
    </div>
  </section>
)

const DetailRow = ({ label, children }) => (
  <div className='detail-row'>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

const amenities = [
  {
    icon: 'pinecone.png',
    room: 'Kitchen',
    items: [
      ['Appliances', 'Refrigerator, electric range and oven, microwave, and dishwasher.'],
      ['Coffee equipment', 'Coffee maker, filters, and grounds.'],
      ['Cookware', 'Cookware is available for guest use.'],
    ],
  },
  {
    icon: 'moon.png',
    room: 'Living room',
    items: [
      ['Books', 'A selection to enjoy during your stay.'],
      ['Movie night', 'Projector and DVD player.'],
      ['Forested views', 'Windows with views of the surrounding forest.'],
      ['Keeping warm', 'A fireplace provides cozy indoor comfort.']
    ],
  },
  {
    icon: 'owl.png',
    room: 'Primary bedroom',
    items: [['Furnishings', 'Bedside tables, ceiling fan, and window shades.']],
  },
  {
    icon: 'great-horned-owl.png',
    room: 'Open loft',
    items: [['Furnishings', 'Bedside tables and a small reading nook beneath the eaves.']],
  },
  {
    icon: 'duck.png',
    room: 'Bathroom',
    items: [
      ['Fixtures', 'Shower, sink and vanity, and toilet.'],
      ['Amenities', 'Towels and toiletries are provided.']
    ],
  },
  {
    icon: 'acorn.png',
    room: 'Guest supplies',
    items: [
      ['Laundry', 'Laundry is available for guest use.'],
      ['Linens & towels', 'Bed linens and towels are provided.'],
      ['Games', 'Games and cards to enjoy during your stay.'],
      ['DVDs', 'A selection for movie night.'],
    ],
  },
  {
    icon: 'raven.png',
    room: 'Outside',
    items: [
      ['Outdoor spaces', 'Covered porch and open back patio.'],
      ['Fire and seating', 'Fire pit with stump seating.'],
      ['Grill', 'Outdoor grill.'],
      ['Natural surroundings', 'Views of the surrounding forest and wildlife.'],
      ['The Door in the Woods', 'Ponder the meaning of the mysterious door and its place amidst the trees.']
    ],
  },
]

export const TheDen = () => (
  <PageFrame className='public-page-den'>
    <Meta
      title='The Den | The Druids Den'
      description="See what it's actually like to stay at The Druids Den in Conover, Wisconsin: sleeping arrangements, rooms, amenities, and seasonal notes."
    />
    <main>
      <PublicHero
        eyebrow='A closer look'
        title='The Den'
        coelbren='The Den'
        description='A Northwoods cabin for up to four guests, with a private bedroom, an open loft, and room to let the woods set the pace.'
        image='druids_den_main_room_from_living_area.jpeg'
        alt='The open-plan main room with its living room, kitchen, and loft'
      >
        <Link to='/gallery' className='button button-light'>See the photo journal -&gt;</Link>
      </PublicHero>

      <section className='den-facts'>
        <div className='den-facts-label'>
          <AssetIcon name='doe.png' alt='' />
          <span>Cabin at a glance</span>
        </div>
        <dl>
          <DetailRow label='Maximum occupancy'>Four guests.</DetailRow>
          <DetailRow label='Layout'>One private bedroom and an open loft.</DetailRow>
          <DetailRow label='Bathroom'>One bathroom.</DetailRow>
          <DetailRow label='Setting'>A woodland cabin with nearby public lake access.</DetailRow>
          <DetailRow label='Comfort'>Radiant in-floor heat, gas fireplace, and fiber Wi-Fi.</DetailRow>
          <DetailRow label='Parking'>Up to four vehicles, including trailers, on the driveway or designated parking pad. Winter snow can reduce usable space.</DetailRow>
        </dl>
      </section>

      <section className='den-intro page-section'>
        <SectionMarker eyebrow='The short version' title='Useful comforts, surrounded by woods.' />
        <div className='den-intro-copy'>
          <p className='large-copy'>The Druids Den sits on 5½ acres of private forest in Conover, Wisconsin: a place to slow down, gather, and head out into the Northwoods.</p>
          <ArrowLink to='/northwoods'>Read the Northwoods field guide</ArrowLink>
        </div>
      </section>

      <section className='den-main-room page-section'>
        <div className='den-main-room-copy'>
          <SectionMarker eyebrow='The heart of the house' title='Warmth and gathering space.' />
          <p>The kitchen, dining table, and living room all meet beneath the vaulted ceiling. It's an easy place to gather for a shared meal, a game of cards, or a lazy afternoon with nowhere to be.</p>
        </div>
        <div className='den-main-room-photos'>
          <PhotoFigure
            src={imagePath('druids_den_main_room_from_dining_area.jpeg')}
            alt='The dining table, kitchen, and loft in the open-plan main room'
            caption='The room that gathers everyone'
            className='den-main-room-primary'
          />
          <PhotoFigure
            src={imagePath('druids_den_living_area_from_hallway.jpeg')}
            alt='The living area viewed from the hallway'
            caption='Entering the heart of the house'
            className='den-main-room-secondary'
          />
        </div>
      </section>

      <section className='den-sleep page-section'>
        <PhotoFigure
          src={imagePath('druids_den_primary_bedroom.jpeg')}
          alt='The sunlit private bedroom with green walls, a wood ceiling, and forest-facing windows'
          caption='The primary bedroom / light through the trees'
          className='den-sleep-photo'
        />
        <div className='den-sleep-copy'>
          <SectionMarker eyebrow='Sleeping arrangements' title='Everyone gets a corner.' />
          <p>The private bedroom features a queen bed, windows with drawable shades, and forest-facing views.</p>
          <Link to='/guide#arrival' className='text-link'>Read practical arrival information -&gt;</Link>
        </div>
      </section>

      <section className='den-loft page-section'>
        <div className='den-loft-copy'>
          <SectionMarker eyebrow='A second floor' title='The loft, above it all.' invert />
          <p>Open to the main living area and reachable by stairs, the open loft also has a queen bed.</p>
        </div>
        <div className='den-loft-photos'>
          <PhotoFigure
            src={imagePath('druids_den_loft_from_stairway.jpeg')}
            alt='The open loft above the main living area, viewed from the stairway'
            caption='The open loft'
            className='den-loft-stair-photo'
          />
          <PhotoFigure
            src={imagePath('druids_den_loft_from_corner.jpeg')}
            alt='A view across the open loft toward a forest-facing window'
            caption='A quiet corner above the main room'
            className='den-loft-corner-photo'
          />
        </div>
      </section>

      <section className='den-detail'>
        <PhotoFigure
          src={imagePath('druids_den_living_room_with_bookshelf.jpeg')}
          alt='Books on the living-room shelf beneath the vaulted wood ceiling'
          caption='Bookshelf corner'
          className='den-detail-photo'
        />
        <PhotoFigure
          src={imagePath('druids_den_autumn_lantern.jpg')}
          alt='A lantern hanging from an iron hook beside a tree, above fallen maple leaves'
          caption='Light for the path'
          className='den-detail-photo'
        />
        <PhotoFigure
          src={imagePath('druids_den_fawn_and_pinecone_decor.jpeg')}
          alt='A fawn figurine resting beside a pinecone'
          caption='Small signs of care'
          className='den-detail-photo'
        />
      </section>

      <section className='den-amenities' id='amenities'>
        <div className='den-amenities-heading'>
          <SectionMarker eyebrow='A practical inventory' title='Amenities by room.' />
          <p>A closer look at the practical comforts, room by room.</p>
        </div>
        <div className='den-amenities-grid'>
          {amenities.map(({ icon, room, items }) => (
            <article className='den-amenity-room' key={room}>
              <AssetIcon name={icon} alt='' />
              <h3>{room}</h3>
              <dl>
                {items.map(([label, description]) => <DetailRow key={label} label={label}>{description}</DetailRow>)}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className='den-season page-section'>
        <div className='den-season-copy'>
          <SectionMarker eyebrow='Four seasons' title='The Den changes with the trees.' />
          <p>Spring can be muddy. Summer brings long light. Fall is all foliage and fire. Winter brings snow and silence.</p>
          <p>Bring outdoor footwear and layers. The Northwoods field guide links to Wisconsin road and county trail information.</p>
          <ArrowLink to='/northwoods'>Read the seasonal field notes</ArrowLink>
        </div>
        <PhotoFigure
          src={imagePath('druids_den_fire_pit_autumn.jpg')}
          alt='The stone fire pit and stump seats surrounded by autumn color'
          caption='Fall is all foliage and fire'
          className='den-season-photo'
        />
      </section>

      <section className='public-closing-band'>
        <Quote cite='The Druids Den, in its natural habitat'>Welcome to the woods. Welcome to The Druids Den.</Quote>
        <ArrowLink to='/stay'>Explore stay details</ArrowLink>
      </section>
    </main>
  </PageFrame>
)

const galleryImages = [
  { src: 'druids_den_rear_view_dusk.jpeg', label: 'The cabin in its wooded clearing', category: 'Outside' },
  { src: 'druids_den_main_room_from_living_area.jpeg', label: 'The main living area, kitchen, and open loft', category: 'Inside' },
  { src: 'druids_den_kitchen-interior.jpg', label: 'The kitchen and island countertop', category: 'Inside' },
  { src: 'druids_den_primary_bedroom.jpeg', label: 'The private bedroom in morning light', category: 'Inside' },
  { src: 'druids_den_loft_from_stairway.jpeg', label: 'The open loft above the main living space', category: 'Inside' },
  { src: 'druids_den_bathroom-interior.jpg', label: 'The bathroom interior', category: 'Inside' },
  { src: 'druids_den_fire_pit_autumn.jpg', label: 'The fire pit among autumn color', category: 'Outside' },
  { src: 'druids_den_maple_sun_through_trees.jpg', label: 'Autumn light through the trees', category: 'Around the Den' },
  { src: 'druids_den_welcome_sign.jpg', label: 'The welcome sign', category: 'Around the Den' },
  { src: 'druids_den_into_the_woods_sign.png', label: 'Into the woods', category: 'Around the Den' },
  { src: 'evening-shot-of-welcome-sign.jpeg', label: 'The sign after dark', category: 'Around the Den' },
  { src: 'door_in_the_wall.jpeg', label: 'The door in the wall', category: 'Around the Den' },
  { src: 'druids_den_living_area_from_hallway.jpeg', label: 'The living area viewed from the hallway', category: 'Inside' },
  { src: 'druids_den_main_room_from_dining_area.jpeg', label: 'The dining table and main living area', category: 'Inside' },
  { src: 'druids_den_living_room_with_bookshelf.jpeg', label: 'The bookshelf corner', category: 'Inside' },
  { src: 'druids_den_loft_from_corner.jpeg', label: 'A quiet corner of the open loft', category: 'Inside' },
  { src: 'druids_den_summer_daisies_evening.jpg', label: 'The long approach', category: 'Outside' },
  { src: 'druids_den_mushroom_on_tree.jpg', label: 'A small resident', category: 'Around the Den' },
  { src: 'druids_den_fawn_and_pinecone_decor.jpeg', label: 'Small signs of care', category: 'Around the Den' },
  { src: 'druids_den_summer_sun_in_foliage.jpg', label: 'Summer through the trees', category: 'Seasons' },
  { src: 'pink-sunset-at-druids-den.jpeg', label: 'Pink sky over the Den', category: 'Seasons' },
  { src: 'morning_moonrise_at_druids_den.jpeg', label: 'Moonrise over the Den', category: 'Seasons' },
  { src: 'renting-a-boat-and-riding-the-chain-of-lakes.jpeg', label: 'A boat on the regional Eagle River Chain of Lakes', category: 'Northwoods' },
  { src: 'druids_den_fall_foliage.jpg', label: 'The canopy in October', category: 'Seasons' },
  { src: 'druids_den_autumn_lantern.jpg', label: 'Light for the path', category: 'Around the Den' },
  { src: 'druids_den_winter_driveway.jpg', label: 'The road in winter', category: 'Seasons' },
  { src: 'druids_den_winter_snowman.jpg', label: 'A winter visitor', category: 'Around the Den' },
  { src: 'fire-pit-closeup.jpeg', label: 'The fire-pit circle', category: 'Outside' },
  { src: 'fire_pit_with_bonus_stumps.jpeg', label: 'A seat by the fire', category: 'Outside' },
  { src: 'night-time-fire-pit.jpeg', label: 'The Den after dark', category: 'Outside' },
  { src: 'spooktoberfest_pumpkin_fest_2025_1.jpg', label: 'Pumpkin Fest', category: 'Traditions' },
  { src: 'spooktoberfest_daily_grind_2025.jpg', label: 'The Daily Grind', category: 'Traditions' },
  { src: 'spooktoberfest_fire_pit_2025.jpg', label: 'Spooktoberfest fire', category: 'Traditions' },
  { src: 'sunset-fire-pit.jpeg', label: 'Fire-pit at sunset', category: 'Traditions' },
]

export const Gallery = () => {
  const [filter, setFilter] = useState('All')
  const [activeImage, setActiveImage] = useState(null)
  const triggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const categories = ['All', ...new Set(galleryImages.map((image) => image.category))]
  const visibleImages = filter === 'All' ? galleryImages : galleryImages.filter((image) => image.category === filter)

  useEffect(() => {
    if (!activeImage) return undefined

    const handleDialogKeydown = (event) => {
      if (event.key === 'Escape') {
        setActiveImage(null)
      } else if (event.key === 'Tab') {
        event.preventDefault()
        closeButtonRef.current?.focus()
      }
    }
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    window.addEventListener('keydown', handleDialogKeydown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleDialogKeydown)
      trigger?.focus()
      triggerRef.current = null
    }
  }, [activeImage])

  return (
    <PageFrame className='public-page-gallery'>
      <Meta title='Gallery | The Druids Den' description='A curated visual journal of The Druids Den cabin, its seasons, and the Northwoods around it.' />
      <main>
        <section className='page-heading-band'>
          <div>
            <span className='page-heading-eyebrow'>A visual journal</span>
            <CoelbrenLabel>Things seen around the Den</CoelbrenLabel>
            <h1>Gallery</h1>
          </div>
          <p>Not every photograph made the cut. These are the views, textures, and small proofs of life that feel most like the place.</p>
        </section>
        <section className='gallery-body page-section'>
          <div className='gallery-toolbar' aria-label='Filter gallery by category'>
            <span>Arrange by</span>
            <div className='gallery-filters'>
              {categories.map((category) => (
                <button key={category} type='button' className={filter === category ? 'is-selected' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className='gallery-grid'>
            {visibleImages.map((image, index) => (
              <button className='gallery-tile' type='button' key={image.src} onClick={(event) => {
                triggerRef.current = event.currentTarget
                setActiveImage(image)
              }} aria-label={`View ${image.label}`}>
                <img src={imagePath(image.src)} alt={image.label} loading={index < 4 ? 'eager' : 'lazy'} />
                <span>{image.label}</span>
              </button>
            ))}
          </div>
        </section>
        <section className='gallery-note'>
          <AssetIcon name='02-constellation.png' alt='' />
          <p>Somewhere between a field guide and a family album.</p>
          <ArrowLink to='/story'>Find out what makes the place tick</ArrowLink>
        </section>
      </main>
      {activeImage && (
        <div className='lightbox' role='dialog' aria-modal='true' aria-label={activeImage.label} onClick={(event) => event.target === event.currentTarget && setActiveImage(null)}>
          <button className='lightbox-close' type='button' ref={closeButtonRef} onClick={() => setActiveImage(null)}>Close <span aria-hidden='true'>x</span></button>
          <figure>
            <img src={imagePath(activeImage.src)} alt={activeImage.label} />
            <figcaption><span>{activeImage.category}</span>{activeImage.label}</figcaption>
          </figure>
        </div>
      )}
    </PageFrame>
  )
}

const localGuideSections = [
  {
    icon: 'duck.png',
    title: 'Lakes & public access',
    text: 'The Eagle River Chain of Lakes links 28 lakes for boating, fishing, and paddling. Nearby public lake access offers a way onto the water.',
    links: [
      { label: 'Eagle River Chain of Lakes', href: 'https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/' },
      { label: 'Wisconsin boating information', href: 'https://dnr.wisconsin.gov/topic/Boat' },
    ],
  },
  {
    icon: 'buck.png',
    title: 'Hiking & biking',
    text: 'Vilas County has public hiking routes and local bike trails, including the Sucker Springs Mountain Bike Trail and the Conover-Phelps Trail.',
    links: [
      { label: 'Vilas County hiking trails', href: 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/hunter_hiking_trails.php' },
      { label: 'Vilas County bike trails', href: 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/bike_trails.php' },
    ],
  },
  {
    icon: 'turkey.png',
    title: 'Restaurants & supper clubs',
    text: 'Local recommendations include Honey Bear Inn for a fish fry, Brew\'s Pub in Land O\' Lakes, and Twilight Supper Club for dinner.',
    links: [
      { label: 'Honey Bear Inn in Eagle River', href: 'https://share.google/6bzLDlQTHICa1SUmb' },
      { label: 'Brew\'s Pub in Land O\' Lakes', href: 'https://share.google/K9P3V8jEzpzWnVDOi' },
      { label: 'Twilight Supper Club', href: 'https://twilightsupperclub.com/' },
      { label: 'Buckshot\'s Saloon & Eatery', href: 'https://share.google/PQfG0GTQuuDx6SQsA' },
      { label: 'The Craftsman American Tavern', href: 'https://www.thecraftsmanamericantavern.com/' },
    ],
  },
  {
    icon: 'pinecone.png',
    title: 'Groceries & supplies',
    text: "Trig's and Pick 'n Save have Eagle River grocery locations for groceries and trip supplies. Or visit the nearby Energy Mart for convenience items.",
    links: [
      { label: "Trig's of Eagle River", href: 'https://share.google/fPbC19bTIA7E3PwqG' },
      { label: "Pick 'n Save of Eagle River", href: 'https://share.google/QSnc8R6dxEXQBfORp' },
      { label: "Energy Mart of Conover", href: 'https://share.google/mjIxj5iv9unMxjJPM' },
    ],
  },
  {
    icon: 'great-horned-owl.png',
    title: 'Winter recreation',
    text: 'Vilas County has snowmobile trails and the Pioneer Creek cross-country ski trail in Conover. Check road conditions before winter travel.',
    links: [
      { label: 'Wisconsin 511 road conditions', href: 'https://511wi.gov/' },
      { label: 'Vilas County snowmobile trails', href: 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/snowmobile_trails.php' },
      { label: 'Pioneer Creek ski trails', href: 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/ski_trails.php' },
    ],
  },
  {
    icon: 'doe.png',
    title: 'ATV & UTV trails',
    text: 'Vilas County ATV and UTV routes connect communities around the county, including Conover.',
    links: [
      { label: 'Vilas County ATV and UTV trails', href: 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/atv_trails.php' },
    ],
  },
  {
    icon: 'owl.png',
    title: 'Regional attractions',
    text: 'Winter events at the World Championship Derby Complex bring snowmobile racing to Eagle River.',
    links: [
      { label: 'World Championship Derby Complex', href: 'https://derbycomplex.com/' },
    ],
  },
]

export const Northwoods = () => (
  <PageFrame className='public-page-northwoods'>
    <Meta title='The Northwoods | The Druids Den' description='An opinionated Northwoods field guide for guests of The Druids Den: trails, lakes, food, towns, winter, and rainy-day plans.' />
    <main>
      <PublicHero
        eyebrow='A field guide for the curious'
        title={<>The <span className='hero-title-word'>Northwoods</span></>}
        coelbren='The Northwoods'
        description='Water, woods, supper clubs—the places new memories await.'
        image='druids_den_summer_sun_in_foliage.jpg'
        alt='Sunlight filtering through summer foliage near the Den'
      />
      <section className='northwoods-intro page-section'>
        <SectionMarker eyebrow='Begin here' title='The Den is the basecamp for your next story.' />
        <p className='large-copy'>Eagle River to the south. Michigan's Upper Peninsula to the north. Between them: lakes, forest roads, trails, food, and an alluring lack of urgency.</p>
      </section>
      <section className='northwoods-guide'>
        <div className='northwoods-guide-heading'>
          <span className='section-number'>Field notes / 01</span>
          <h2>Pick a direction.</h2>
        </div>
        <div className='northwoods-entry-list'>
          {localGuideSections.map((section) => (
            <article className='northwoods-entry' key={section.title}>
              <AssetIcon name={section.icon} alt='' />
              <div>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
                <div className='entry-links'>
                  {section.links.map((link) => <ArrowLink key={link.href} href={link.href}>{link.label}</ArrowLink>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className='northwoods-neighbors'>
        <div className='northwoods-neighbors-heading'>
          <div>
            <span className='section-number'>Field notes / 02</span>
            <h2>Other locals.</h2>
          </div>
          <p>The Northwoods is busy when you pay attention. Look for small movement and listen for their calls, but leave the wild residents room to carry on.</p>
        </div>
        <div className='northwoods-neighbor-list'>
          <article>
            <AssetIcon name='chipmunk.png' alt='' />
            <div><h3>Chipmunk / quick company</h3><p>Small, fast, and usually gone before you reach for the camera.</p></div>
          </article>
          <article>
            <AssetIcon name='double-mushroom.png' alt='' />
            <div><h3>Mushrooms / after rain</h3><p>Look down on damp walks; the forest has its own punctuation.</p></div>
          </article>
          <article>
            <AssetIcon name='owl.png' alt='' />
            <div><h3>Owls / after dark</h3><p>The barred owls' night shifts begin after the fire goes low.</p></div>
          </article>
          <article>
            <AssetIcon name='porcupine.png' alt='' />
            <div><h3>Porcupine / give space</h3><p>A slow-moving reminder to leave wild things to their own business.</p></div>
          </article>
          <article>
            <AssetIcon name='racoon.png' alt='' />
            <div><h3>Raccoon / secure the snacks</h3><p>Food belongs inside, especially overnight.</p></div>
          </article>
          <article>
            <AssetIcon name='woodpecker.png' alt='' />
            <div><h3>Woodpecker / listen for the tap</h3><p>The trees are rarely as quiet as they look.</p></div>
          </article>
        </div>
      </section>
      <section className='northwoods-season'>
        <div>
          <span className='section-number'>Field notes / 03</span>
          <h2>Be curious, but exercise care.</h2>
          <p>Wear blaze orange during fall deer and turkey hunts. Assume wildlife is nearby. Check for ticks. In winter, bring AWD or 4WD and let the road take the time it takes.</p>
          <ArrowLink to='/the-den'>Read the cabin notes</ArrowLink>
        </div>
        <img src={imagePath('druids_den_maple_sun_through_trees.jpg')} alt='Low autumn sun shining through yellow maples in the woods around the Den' loading='lazy' />
      </section>
    </main>
  </PageFrame>
)

export const Story = () => (
  <PageFrame className='public-page-story'>
    <Meta title='The Story | The Druids Den' description='The ideas behind The Druids Den: a private Northwoods cabin, a place to pay attention, and a story still being written.' />
    <main>
      <section className='story-hero'>
        <div className='story-hero-copy'>
          <span className='public-hero-eyebrow'>A place, becoming itself</span>
          <CoelbrenLabel>The story of the Den</CoelbrenLabel>
          <h1>Some places name themselves</h1>
          <p>The Druids Den is more than a name. It's a place to become one with nature and to better know oneself.</p>
        </div>
        <img src={imagePath('druids_den_into_the_woods_sign.png')} alt='The Into the Woods sign marking the way into the forest at The Druids Den' />
      </section>
      <section className='story-opening page-section'>
        <SectionMarker eyebrow='The name' title='Keeper and refuge.' />
        <div>
          <p className='large-copy'>A druid is a keeper of knowledge, ritual, and the living world. A den is a refuge: close to the earth, tucked away, and always beckoning your return.</p>
        </div>
      </section>
      <section className='story-image-break'>
        <img src={imagePath('druids_den_summer_daisies_evening.jpg')} alt='The cabin at the end of a flower-lined driveway' loading='lazy' />
        <div><AssetIcon name='01-constellation.png' alt='' /><span>Private forest / Conover, WI</span></div>
      </section>
      <section className='story-principles page-section'>
        <div className='story-principles-heading'>
          <SectionMarker eyebrow='The design philosophy' title='Warmth, comfort, and the outside welcomed in.' />
          <p>Whether in the shape of the woods-welcoming floor-to-ceiling windows, the wood-panelled walls made from a single fallen pine, or the carefully chosen handicraft that adorns every corner, each detail makes the outside feel closer and the inside more inviting.</p>
        </div>
        <div className='story-principle-list'>
          <article><span>01</span><h3>Make room for the ordinary.</h3><p>A full kitchen, a good bed, a place to put wet boots. Hospitality begins with the small things working.</p></article>
          <article><span>02</span><h3>Let the woods stay wild.</h3><p>The forest is not a backdrop to be improved. It's your nearest neighbor, the reason to look up, and a source of endless wonder.</p></article>
          <article><span>03</span><h3>Keep a few traditions.</h3><p>We mark the solstices and equinoxes with rituals of our own. Which traditions will you discover and keep?</p></article>
        </div>
      </section>
      <section className='story-final'>
        <div>
          <CoelbrenLabel>Woodland wonder is waiting.</CoelbrenLabel>
          <h2>The best part of the story is yet to be written.</h2>
          <ArrowLink to='/stay'>Write your story at the Den</ArrowLink>
        </div>
        <img src={imagePath('druids_den_mushroom_on_tree.jpg')} alt='A mushroom growing from a tree near the Den' loading='lazy' />
      </section>
    </main>
  </PageFrame>
)

export const Traditions = () => (
  <PageFrame className='public-page-traditions'>
    <Meta title='Traditions | The Druids Den' description='Seasonal and personal traditions at The Druids Den, beginning with the annual Spooktoberfest gathering.' />
    <main>
      <section className='page-heading-band traditions-heading'>
        <div>
          <span className='page-heading-eyebrow'>Things we do on purpose</span>
          <CoelbrenLabel>Traditions of the Den</CoelbrenLabel>
          <h1>Traditions</h1>
        </div>
        <p>A home for the recurring weekends, seasonal rituals, and peculiar little customs that make a place feel like itself.</p>
      </section>
      <section className='traditions-feature'>
        <div className='traditions-feature-image'>
          <img className='traditions-feature-photo' src={imagePath('fire_pit_with_bonus_stumps.jpeg')} alt='The fire pit and stump seats beneath the trees at The Druids Den' />
          <AssetIcon name='great-horned-owl.png' alt='' />
        </div>
        <div className='traditions-feature-copy'>
          <span className='section-number'>The first tradition</span>
          <h2>Spooktoberfest</h2>
          <CoelbrenLabel>Oktoberfest / Halloween / Autumn Equinox / Ryan's birthday</CoelbrenLabel>
          <p>The third annual gathering combines Oktoberfest, Halloween, the Autumn Equinox, and Ryan's birthday into one weekend of fun and merriment.</p>
          <p className='small-note'>October 8th - 11th, 2026 · passcode protected</p>
          <Link to='/spooktoberfest' className='button button-light'>Open Spooktoberfest -&gt;</Link>
        </div>
      </section>
      <section className='traditions-next page-section'>
        <SectionMarker eyebrow='A structure for what comes next' title='The calendar is still open.' />
        <div>
          <p className='large-copy'>New traditions will live here when they exist in the real world first.</p>
          <p>Winter at the Den, summer rituals, sauna season: ideas are welcome, but this page will not pretend a tradition is real before it has happened.</p>
          <ArrowLink to='/story'>Read the story behind the place</ArrowLink>
        </div>
      </section>
    </main>
  </PageFrame>
)

export const Stay = () => {
  return (
    <PageFrame className='public-page-stay'>
      <Meta title='Stay | The Druids Den' description='Rental stays at The Druids Den, a private Northwoods cabin in Conover, Wisconsin, are coming soon.' />
      <main>
        <section className='stay-hero'>
          <div className='stay-hero-copy'>
            <span className='public-hero-eyebrow'>A Northwoods cabin</span>
            <CoelbrenLabel>Stay at the Den</CoelbrenLabel>
            <h1>Come for the quiet.</h1>
            <p>{bookingLinks.length ? 'Booking information is available from the listings below.' : 'Rental stays are coming soon. Booking information will be available here.'}</p>
            {bookingLinks.length > 0 && (
              <>
                <BookingAction className='button button-light' />
                <AlternateBookingLinks />
              </>
            )}
            <a href='mailto:grovekeeper@druidsdenwi.com?cc=NSVH2025@GMAIL.COM&subject=General%20Druids%20Den%20inquiry' className='text-link'>General questions? Reach out by email</a>
          </div>
          <img src={imagePath('sunset-fire-pit.jpeg')} alt='The fire pit and trees at sunset around The Druids Den' />
        </section>
        <section className='stay-moonrise'>
          <div>
            <span className='section-number'>After dark / before coffee</span>
            <h2>Let the woods set the pace.</h2>
            <p>Some of the Den's best hours happen when the fire is low, the moon is up, and there's nowhere else you need to be.</p>
            <ArrowLink to='/the-den'>Explore the cabin</ArrowLink>
          </div>
          <img src={imagePath('morning_moonrise_at_druids_den.jpeg')} alt='The moon rising above the trees at The Druids Den' loading='lazy' />
        </section>
      </main>
    </PageFrame>
  )
}
