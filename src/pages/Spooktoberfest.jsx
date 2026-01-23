import { Link } from 'react-router'
import './Spooktoberfest.scss'
import { Coelbren, Flower, Leaf, Awen, PageNav, CaptionedImage } from '../components'

const Spooktoberfest = () => {
  const navItems = [
    { label: 'What To Expect', href: '#what-to-expect' },
    { label: 'When To Expect It', href: '#when-to-expect-it' },
    { label: 'Where To Expect It', href: '#where-to-expect-it' },
    { label: 'More to Come', href: '#more-to-come' }
  ]

  return (
    <div className='spooktoberfest-page'>
      <div className='page-header'>
        <div>
          <h1>Spooktoberfest</h1>
          <Coelbren
            renderAs='h2'
            className='coelbren-subheading' 
          >
            (Spooktoberfest)
          </Coelbren>
          <h2 className='subheading'>October 8th - 11th, 2026</h2>
          <div className='bottom-border' />
        </div>
        <Link to='/'>
          <div className='back-navigation'><Awen /> Go Back</div> 
        </Link>
      </div>
      <center>
        <Flower />
        <p>The third annual Spooktoberfest will combine Oktoberfest, Halloween, the Autumn Equinox, and Ryan's birthday into a single weekend of fun and merriment.</p>
        <Leaf />
      </center>
      
      <div className='page-content-wrapper nav-right'>
        <PageNav items={navItems} />
        
        <main>
        <section id='what-to-expect'>
        <h2>What To Expect</h2>

        <h3>Fanfare</h3>
        <CaptionedImage 
          src='/assets/images/spooktoberfest_pumpkin_fest_2025_1.jpg' 
          alt='Swinging by Pumpkin Fest in Three Lakes during Spooktoberfest 2025' 
          className='fanfare-photo'
          style={{ objectPosition: 'center 55%' }}
        />

        <p>We're modeling this year's Spooktoberfest after last year's events, but you're of course welcome to enjoy your time as you wish.</p>

        <h4>🔮 Threshold Thursday (October 8th)</h4>
        <ul>
          <li>First arrivals</li>
          <li>Group dinner at Buckshot's Saloon & Eatery in Eagle River</li>
          <li>Evening fire pit hangout back at The Druids Den</li>
        </ul>

        <h4>🍄 Freaky Friday (October 9th)</h4>
        <ul>
          <li>Arrivals throughout the day</li>
          <li>Breakfast at The Druids Den</li>
          <li>Daytime activities (hiking, lake time, etc.)</li>
          <li>After-dark shenanigans (fire pit, games, and the like)</li>
        </ul>

        <h4>🎃 Spooky Saturday (October 10th)</h4>
        <ul>
          <li>Arrivals throughout the day</li>
          <li>Breakfast at The Druids Den</li>
          <li>Pumpkin Fest in Three Lakes or other daytime activities as desired</li>
          <li>Costume party back at The Druids Den (costumes optional, but encouraged!)</li>
          <li>Evening grilling and fire pit hangout back at The Druids Den</li>
        </ul>

        <h4>🪵 Serene Sunday (October 11th)</h4>
        <ul>
          <li>Breakfast, cleanup, and farewells</li>
        </ul>

        <h3>Food</h3>
        <CaptionedImage 
          src='/assets/images/spooktoberfest_daily_grind_2025.jpg' 
          alt='A quick coffee at the Daily Grind in Eagle River' 
          className='food-photo'
          style={{ objectPosition: 'center 68%' }}
        />
        <p>We're tentatively planning on going out for meals as described above, but for breakfasts and lunch, our ask would be that all attending parties plan to make or bring at least one meal for all to share. We'll get a text chain going closer to the event to sort that out in more detail.</p>

        <h3>Sleeping Arrangements</h3>
        <CaptionedImage 
          src='/assets/images/druids_den_winter_bedroom.jpg' 
          alt='The primary bedroom at The Druids Den' 
          className='sleeping-photo'
          style={{ objectPosition: 'center 55%' }}

        />
        <p>The cabin can comfortably sleep six (two in the primary bedroom, two in the loft, and two on the air mattress), but depending on the number of RSVPs per night, we may have to get cozy with additional air mattresses set up in the space.</p>
        <p>Alternatively, you're welcome to bring a tent and camp on the land. Please let us know if you plan to do this so we can get a better feel for how to set up the cabin interior to support those who choose to sleep indoors.</p>

        </section>

        <section id='when-to-expect-it'>
        <h2>When To Expect It</h2>
        <CaptionedImage 
          src='/assets/images/spooktoberfest_fire_pit_2025.jpg' 
          alt='Gathering around the fire pit at Spooktoberfest 2025' 
          className='fall-foliage-photo'
          style={{ objectPosition: 'center 55%' }}
        />
        <p>Spooktoberfest will run from Thursday, October 8th through Sunday, October 11th, 2026.</p>
        <p>You're welcome to stay as many nights as you'd like in that window, with the final departures on Sunday the 11th.</p>
        </section>

        <section id='where-to-expect-it'>
        <h2>Where To Expect It</h2>
        <CaptionedImage 
          src='/assets/images/druids_den_autumn_evening_fire_pit.jpg' 
          alt='The Druids Den as seen from the back lot' 
          className='location-photo'
        />
        <p>The address for The Druids Den was on the physical invite you received in the mail. We can of course text you the address if you need it again.</p>
        <p>Apple Maps does now feature our address and we did submit it to Google Maps as well, but if it doesn't appear there by October and you need to use Google Maps, let us know and we'll share the best directions at that time.</p>
        </section>

        <section id='more-to-come'>
        <h2>More to Come</h2>
        <p>We'll have more updates as we get closer to the kickoff of Spooktoberfest 2026.</p>
        <p>In the meantime, if you have any questions or curiosities, don't hesitate to contact either Ryan or Lacey.</p>
        </section>
      </main>
      </div>
    </div>
  )
}

export default Spooktoberfest
