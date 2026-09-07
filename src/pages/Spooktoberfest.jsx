import { Link } from 'react-router'
import './Spooktoberfest.scss'
import { Coelbren, Flower, Leaf, Awen, CaptionedImage } from '../components'
import { AssetIcon, Meta, PageFrame } from '../components/site/SiteComponents'

const Spooktoberfest = () => {
  return (
    <PageFrame className='spooktoberfest-page'>
      <Meta title='Spooktoberfest | The Druids Den' description='The private Spooktoberfest gathering at The Druids Den: what to expect, when to expect it, where to expect it, and more to come.' />
      <main>
        <section className='spooktoberfest-hero' aria-labelledby='spooktoberfest-title'>
          <div className='spooktoberfest-hero-image' aria-hidden='true' />
          <div className='spooktoberfest-hero-copy'>
            <span className='spooktoberfest-eyebrow'>A private autumn gathering</span>
            <h1 id='spooktoberfest-title'>Spooktoberfest</h1>
            <Coelbren renderAs='h2' className='coelbren-subheading spooktoberfest-subheading' aria-hidden='true'>
              (Spooktoberfest)
            </Coelbren>
            <h2 className='subheading'>October 8th - 11th, 2026</h2>
            <Link to='/' className='spooktoberfest-back-link'>
              <Awen />
              <span>Go Back</span>
            </Link>
          </div>
          <div className='spooktoberfest-hero-mark' aria-hidden='true'>
            <AssetIcon name='great-horned-owl.png' alt='' />
            <span>Fire / forest / fun</span>
          </div>
        </section>

        <section className='spooktoberfest-intro'>
          <Flower />
          <p>The third annual Spooktoberfest will combine Oktoberfest, Halloween, the Autumn Equinox, and Ryan's birthday into a single weekend of fun and merriment.</p>
          <Leaf />
        </section>

        <div className='spooktoberfest-content'>
          <section id='what-to-expect' className='spooktoberfest-section'>
            <div className='spooktoberfest-section-heading'>
              <span className='spooktoberfest-section-kicker'>01 / The long weekend</span>
              <h2>What To Expect</h2>
            </div>
            <div className='spooktoberfest-section-body'>
              <div className='spooktoberfest-subsection'>
                <h3>Fanfare</h3>
                <CaptionedImage
                  src='/assets/images/spooktoberfest_pumpkin_fest_2025_1.jpg'
                  alt='Swinging by Pumpkin Fest in Three Lakes during Spooktoberfest 2025'
                  className='fanfare-photo'
                  style={{ objectPosition: 'center 55%' }}
                />
                <p>We're modeling this year's Spooktoberfest after last year's events, but you're of course welcome to enjoy your time as you wish.</p>
              </div>

              <div className='spooktoberfest-day-list'>
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
              </div>

              <div className='spooktoberfest-subsection'>
                <h3>Food</h3>
                <CaptionedImage
                  src='/assets/images/spooktoberfest_daily_grind_2025.jpg'
                  alt='A quick coffee at the Daily Grind in Eagle River'
                  className='food-photo'
                  style={{ objectPosition: 'center 68%' }}
                />
                <p>We're tentatively planning on going out for meals as described above, but for breakfasts and lunch, our ask would be that all attending parties plan to make or bring at least one meal for all to share. We'll get a text chain going closer to the event to sort that out in more detail.</p>
              </div>

              <div className='spooktoberfest-subsection'>
                <h3>Sleeping Arrangements</h3>
                <CaptionedImage
                  src='/assets/images/druids_den_primary_bedroom.jpeg'
                  alt='The sunlit primary bedroom at The Druids Den'
                  className='sleeping-photo'
                  style={{ objectPosition: 'center 55%' }}
                />
                <p>The cabin can sleep six naturally (two in the primary bedroom, two in the loft, and two on the air mattress), but depending on the number of RSVPs per night, we may have to get cozy with additional air mattresses set up in the space.</p>
                <p>Alternatively, you're welcome to bring a tent and camp on the land. Please let us know if you plan to do this so we can get a better feel for how to set up the cabin interior to support those who choose to sleep indoors.</p>
              </div>
            </div>
          </section>

          <section id='when-to-expect-it' className='spooktoberfest-section spooktoberfest-section-sienna'>
            <div className='spooktoberfest-section-heading'>
              <span className='spooktoberfest-section-kicker'>02 / Mark the dates</span>
              <h2>When To Expect It</h2>
            </div>
            <div className='spooktoberfest-section-body'>
              <CaptionedImage
                src='/assets/images/spooktoberfest_fire_pit_2025.jpg'
                alt='Gathering around the fire pit at Spooktoberfest 2025'
                className='fall-foliage-photo'
                style={{ objectPosition: 'center 55%' }}
              />
              <p>Spooktoberfest will run from Thursday, October 8th through Sunday, October 11th, 2026.</p>
              <p>You're welcome to stay as many nights as you'd like in that window, with the final departures on Sunday the 11th.</p>
            </div>
          </section>

          <section id='where-to-expect-it' className='spooktoberfest-section spooktoberfest-section-moss'>
            <div className='spooktoberfest-section-heading'>
              <span className='spooktoberfest-section-kicker'>03 / Find the place</span>
              <h2>Where To Expect It</h2>
            </div>
            <div className='spooktoberfest-section-body'>
              <CaptionedImage
                src='/assets/images/night-time-fire-pit.jpeg'
                alt='The Druids Den and fire-pit area after dark'
                className='location-photo'
                style={{ objectPosition: 'center 54%' }}
              />
              <p>The address for The Druids Den was on the physical invite you received in the mail. We can of course text you the address if you need it again.</p>
              <p>Apple Maps and Google Maps both feature our address now. So long as you have reception, you should be able to find us!</p>
            </div>
          </section>

          <section id='more-to-come' className='spooktoberfest-section spooktoberfest-section-shiitake'>
            <div className='spooktoberfest-section-heading'>
              <span className='spooktoberfest-section-kicker'>04 / Keep watching</span>
              <h2>More to Come</h2>
            </div>
            <div className='spooktoberfest-section-body'>
              <p>We'll have more updates as we get closer to the kickoff of Spooktoberfest 2026.</p>
              <p>In the meantime, if you have any questions or curiosities, don't hesitate to contact either Ryan or Lacey.</p>
            </div>
          </section>
        </div>
      </main>
    </PageFrame>
  )
}

export default Spooktoberfest
