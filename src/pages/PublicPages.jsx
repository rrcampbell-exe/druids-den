import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLink,
  AssetIcon,
  CoelbrenLabel,
  Meta,
  PageFrame,
  PhotoFigure,
  Quote,
  SectionMarker,
} from '../components/site/SiteComponents'
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
      <span>46° 04' N / 89° 15' W</span>
      <span>Conover, Wisconsin</span>
      <span>Private hospitality by invitation</span>
    </div>
  </section>
)

const DetailRow = ({ label, children }) => (
  <div className='detail-row'>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

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
        description="An inviting space for up to six people who've come to commune with the woods, the fire, and one another."
        image='druids_den_autumn_evening_fire_pit.jpg'
        alt='The Druids Den glowing beneath autumn trees'
      >
        <Link to='/gallery' className='button button-light'>See the photo journal -&gt;</Link>
      </PublicHero>

      <section className='den-intro page-section'>
        <SectionMarker eyebrow='The short version' title='All of the amenities. None of the distractions.' />
        <div className='den-intro-copy'>
          <p className='large-copy'>Nestled on 5½ secluded acres of private forest in Conover, The Druids Den is a basecamp for both stillness and getting out of the house.</p>
          <p>The cabin sleeps up to six: two in the primary bedroom, two in the loft, and up to two more on an air mattress in the living room. There is a full kitchen, radiant in-floor heating, an indoor gas fireplace, a projector, laundry, a covered porch, and a fire pit waiting out back.</p>
          <ArrowLink to='/northwoods'>See what is beyond the driveway</ArrowLink>
        </div>
      </section>

      <section className='den-facts'>
        <div className='den-facts-label'>
          <AssetIcon name='doe.png' alt='' />
          <span>At a glance</span>
        </div>
        <dl>
          <DetailRow label='Sleeps'>Six guests across bedroom, loft, and living room</DetailRow>
          <DetailRow label='Grounds'>5½ acres of private forest</DetailRow>
          <DetailRow label='Heat'>Radiant in-floor heating and gas fireplace</DetailRow>
          <DetailRow label='Outside'>Covered porch, back patio, grill, and fire pit</DetailRow>
          <DetailRow label='Connection'>Fiber internet, though cell reception that can be spotty</DetailRow>
        </dl>
      </section>

      <section className='den-sleep page-section'>
        <PhotoFigure
          src={imagePath('druids_den_winter_bedroom.jpg')}
          alt='The primary bedroom with green walls, wood ceiling, and a double bed'
          caption='The primary bedroom / the quiet end of the house'
          className='den-sleep-photo'
        />
        <div className='den-sleep-copy'>
          <SectionMarker eyebrow='Sleeping arrangements' title='Everyone gets a corner.' />
          <p>The primary bedroom holds two. The loft holds two more and feels especially good on rainy afternoons. The living room can take an air mattress for the final two guests, if needed.</p>
          <Link to='/guide#arrival' className='text-link'>Already invited? Read the guest guide -&gt;</Link>
        </div>
      </section>

      <section className='den-rooms'>
        <div className='den-rooms-heading'>
          <span className='section-number'>The rooms</span>
          <h2>Useful things, well placed.</h2>
        </div>
        <div className='den-room-list'>
          <article>
            <AssetIcon name='pinecone.png' alt='' />
            <h3>Kitchen</h3>
            <p>A full kitchen with the essentials for breakfast, lunch, and a long dinner that nobody wants to hurry.</p>
          </article>
          <article>
            <AssetIcon name='moon.png' alt='' />
            <h3>Living room</h3>
            <p>Settle in by the gas fireplace, put on a DVD, and let the projector turn a blank wall into movie night.</p>
          </article>
          <article>
            <AssetIcon name='raven.png' alt='' />
            <h3>Outside</h3>
            <p>The covered porch, back patio, gas grill, and fire pit extend the cabin into the trees. Deer and turkeys are regular neighbors.</p>
          </article>
        </div>
      </section>

      <section className='den-season page-section'>
        <div className='den-season-copy'>
          <SectionMarker eyebrow='Four seasons' title='The Den changes with the trees.' />
          <p>Spring can be muddy. Summer brings water, long light, and mosquitoes. Fall is all foliage and fire. Winter asks for good boots, warm layers, and AWD or 4WD.</p>
          <p>Bring outdoor footwear, layers, insect repellent, sunscreen, and your favorite beverages. The private road is maintained and plowed, but winter driving is still winter driving.</p>
          <ArrowLink to='/northwoods'>Read the seasonal field notes</ArrowLink>
        </div>
        <PhotoFigure
          src={imagePath('druids_den_winter_driveway.jpg')}
          alt='The driveway and trees covered in winter snow'
          caption='Winter asks for a little preparation'
          className='den-season-photo'
        />
      </section>

      <section className='public-closing-band'>
        <Quote cite='The Druids Den, in its natural habitat'>Welcome to the woods. Welcome to The Druids Den.</Quote>
        <ArrowLink to='/stay'>Ask about a private stay</ArrowLink>
      </section>
    </main>
  </PageFrame>
)

const galleryImages = [
  { src: 'druids_den_autumn_evening_fire_pit.jpg', label: 'The house at dusk', category: 'Outside' },
  { src: 'druids_den_rear_view_dusk.jpeg', label: 'The Den from behind at dusk', category: 'Outside' },
  { src: 'druids_den_welcome_sign.jpg', label: 'The way in', category: 'Around the Den' },
  { src: 'evening-shot-of-welcome-sign.jpeg', label: 'The sign after dark', category: 'Around the Den' },
  { src: 'druids_den_winter_bedroom.jpg', label: 'Primary bedroom', category: 'Inside' },
  { src: 'druids_den_summer_daisies_evening.jpg', label: 'The long approach', category: 'Outside' },
  { src: 'druids_den_mushroom_on_tree.jpg', label: 'A small resident', category: 'Around the Den' },
  { src: 'druids_den_summer_sun_in_foliage.jpg', label: 'Summer through the trees', category: 'Seasons' },
  { src: 'pink-sunset-at-druids-den.jpeg', label: 'Pink sky over the Den', category: 'Seasons' },
  { src: 'renting-a-boat-and-riding-the-chain-of-lakes.jpeg', label: 'The Chain of Lakes', category: 'Northwoods' },
  { src: 'druids_den_fall_foliage.jpg', label: 'The canopy in October', category: 'Seasons' },
  { src: 'druids_den_winter_driveway.jpg', label: 'The road in winter', category: 'Seasons' },
  { src: 'druids_den_winter_snowman.jpg', label: 'A winter visitor', category: 'Around the Den' },
  { src: 'fire-pit-closeup.jpeg', label: 'The fire-pit circle', category: 'Outside' },
  { src: 'night-time-fire-pit.jpeg', label: 'The Den after dark', category: 'Outside' },
  { src: 'spooktoberfest_pumpkin_fest_2025_1.jpg', label: 'Pumpkin Fest', category: 'Traditions' },
  { src: 'spooktoberfest_daily_grind_2025.jpg', label: 'The Daily Grind', category: 'Traditions' },
  { src: 'spooktoberfest_fire_pit_2025.jpg', label: 'Spooktoberfest fire', category: 'Traditions' },
  { src: 'sunset-fire-pit.jpeg', label: 'Fire-pit at sunset', category: 'Traditions' },
]

export const Gallery = () => {
  const [filter, setFilter] = useState('All')
  const [activeImage, setActiveImage] = useState(null)
  const categories = ['All', ...new Set(galleryImages.map((image) => image.category))]
  const visibleImages = filter === 'All' ? galleryImages : galleryImages.filter((image) => image.category === filter)

  useEffect(() => {
    if (!activeImage) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveImage(null)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
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
              <button className={`gallery-tile gallery-tile-${(index % 5) + 1}`} type='button' key={image.src} onClick={() => setActiveImage(image)} aria-label={`View ${image.label}`}>
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
          <button className='lightbox-close' type='button' onClick={() => setActiveImage(null)}>Close <span aria-hidden='true'>x</span></button>
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
    icon: 'buck.png',
    title: 'Woods & trails',
    text: 'Hike, bike, ride, or meander the back lot until the trees rearrange your thoughts. Bring sturdy shoes: mud and snow have their own opinions.',
    links: [
      { label: 'Vilas County hiking', href: 'https://www.vilascountywi.gov/' },
      { label: 'Biking the northwoods', href: 'https://biketheheart.org/bike-trail-map/' },
    ],
  },
  {
    icon: 'duck.png',
    title: 'Lakes & water',
    text: 'Eagle River is the local hub for the Chain of 28 Lakes. Pioneer Lake, North Twin, and South Twin are even more nearby options for time on the water.',
    links: [
      { label: 'Explore the Eagle River Chain', href: 'https://northwoodswisconsin.com/northern-wisconsin-recreation/eagle-river-chain-of-lakes/' },
      { label: 'Rentals made easy at Boat Sport', href: 'https://www.boatsport.com/' },
    ],
  },
  {
    icon: 'turkey.png',
    title: 'Supper club season',
    text: 'A Friday night fish fry is one of the region\'s oldest and most dependable rituals. The Craftsman and Brew\'s Pub are good places to begin.',
    links: [
      { label: 'The Craftsman American Tavern', href: 'https://www.thecraftsmanamericantavern.com/' },
      { label: "Brew's Pub", href: 'https://www.facebook.com/brewspublando/' },
    ],
  },
  {
    icon: 'great-horned-owl.png',
    title: 'When the weather turns',
    text: 'Winter brings snowmobiling, ice fishing, cross-country skiing, and clear nights. Rain brings the projector, board games, and permission to stay in.',
    links: [
      { label: 'World Championship Derby Complex', href: 'https://derbycomplex.com/' },
      { label: 'Vilas County snowmobile trails', href: 'https://www.vilascountywi.gov/departments/services/parks_and_recreation/trails___recreational_opportunities/snowmobile_trails.php' },
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
        description='Water, woods, supper clubs—the places where new memories await.'
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
      <section className='northwoods-towns page-section'>
        <div className='northwoods-towns-image'>
          <img className='northwoods-towns-photo' src={imagePath('pink-sunset-at-druids-den.jpeg')} alt='Pink sunset above the trees around the Den' loading='lazy' />
          <AssetIcon name='raven.png' alt='' />
        </div>
        <div className='northwoods-towns-copy'>
          <SectionMarker eyebrow='The useful towns' title='Know where to stock up.' />
          <dl>
            <DetailRow label='Conover'>The Den's home base: small, quiet, close to the water.</DetailRow>
            <DetailRow label='Eagle River'>15 minutes south for groceries, dining, events, and supplies.</DetailRow>
            <DetailRow label='Michigan U.P.'>About 20 minutes north for waterfalls, trails, and a change of state.</DetailRow>
          </dl>
          <p className='small-note'>Pick 'n Save or Trig's in Eagle River make for a proper grocery run. Energy Mart is closer for gas, drinks, meat, and the thing you forgot.</p>
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
        <img src={imagePath('druids_den_fall_foliage.jpg')} alt='Autumn foliage above the fire pit' loading='lazy' />
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
          <p>The Druids Den is more than a name. It's a place to become one with nature and with one's true self.</p>
        </div>
        <img src={imagePath('druids_den_welcome_sign.jpg')} alt='The Druids Den welcome sign beside the forest road' />
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
          <img className='traditions-feature-photo' src={imagePath('fire-pit-closeup.jpeg')} alt='The stone fire pit beneath the trees at The Druids Den' />
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
  const isLodgifyEnabled = import.meta.env.VITE_LODGIFY_ENABLED === 'true'
  return (
    <PageFrame className='public-page-stay'>
      <Meta title='Stay | The Druids Den' description='Ask about a private, invitation-based stay at The Druids Den in Conover, Wisconsin. Public booking is not open yet.' />
      <main>
        <section className='stay-hero'>
          <div className='stay-hero-copy'>
            <span className='public-hero-eyebrow'>For the moment, by invitation</span>
            <CoelbrenLabel>A private stay</CoelbrenLabel>
            <h1>Come for the quiet.</h1>
            <p>The Druids Den is in a hospitality beta for friends, family, and invited guests while we learn how to make the best stay possible.</p>
            <a href='mailto:grovekeeper@druidsdenwi.com?subject=Private%20stay%20inquiry' className='button button-dark'>Start an inquiry -&gt;</a>
          </div>
          <img src={imagePath('sunset-fire-pit.jpeg')} alt='The fire pit and trees at sunset around The Druids Den' />
        </section>
        <section className='stay-details page-section'>
          <SectionMarker eyebrow='What to expect' title='A simple conversation first.' />
          <div className='stay-details-copy'>
            <p className='large-copy'>At this time, there's no public calendar or instant booking. Instead, reach out and tell us who's coming, when you're thinking, and the kind of time you want to have.</p>
            <dl>
              <DetailRow label='Current model'>Private and invited stays</DetailRow>
              <DetailRow label='The cabin'>Sleeps up to six guests</DetailRow>
              <DetailRow label='The ask'>Respect the woods, the neighbors, and the house</DetailRow>
              <DetailRow label='Next step'>Contact Ryan and Lacey to start the conversation</DetailRow>
            </dl>
          </div>
        </section>
        <section className='stay-inquiry'>
          <div>
            <AssetIcon name='acorn.png' alt='' />
            <span className='section-number'>Private-stay inquiry</span>
            <h2>Tell us a little about your stay.</h2>
          </div>
          <div>
            <p>We'll reply with the details that make sense for your dates, group, and season. We'll share the address and arrival information once your stay is confirmed.</p>
            <a href='mailto:grovekeeper@druidsdenwi.com?subject=Private%20stay%20inquiry' className='button button-light'>Email the keepers -&gt;</a>
          </div>
        </section>
      {isLodgifyEnabled && <section className='future-booking-slot page-section' aria-label='Future booking area'>
          <span className='section-number'>Reserved for a future chapter</span>
          <h2>A future Lodgify booking area will live here.</h2>
          <p>When public booking is the right next step, this space can hold an embedded Lodgify widget without changing the rest of the page. For now, there is nothing to book online.</p>
        </section>}
      </main>
    </PageFrame>
  )  
}
