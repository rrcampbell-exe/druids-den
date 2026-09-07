import { useEffect, useRef } from 'react'
import './Landing.scss'
import { Coelbren, Awen, Weather } from '../components'
import { Link } from 'react-router'
import { useAuth } from '@clerk/react'
import { useCurrentAppUser } from '../hooks/useCurrentAppUser'
import { ArrowLink, AssetIcon, CoelbrenLabel, SiteFooter, SiteHeader } from '../components/site/SiteComponents'

const Landing = () => {
  const ref = useRef()
  const { isSignedIn } = useAuth()
  const { user } = useCurrentAppUser()

  // Check if current date is April 2026 or later
  const now = new Date()
  const showSpooktoberfest = now >= new Date('2026-04-01')
  const showOwnerDashboard = isSignedIn && (user?.role === 'OWNER' || user?.role === 'ADMIN')

  useEffect(() => {
    const img = new window.Image()
    img.src = '/assets/images/druids_den_rear_view_dusk.jpeg'
    img.onload = () => {
      if (ref.current) {
        ref.current.classList.add('image-loaded')
      }
    }
  }, [])

  return (
    <div className='landing-page' ref={ref}>
      <SiteHeader />
      <main>
        <section className='home-hero' aria-labelledby='home-title'>
          <div className='home-hero-image' aria-hidden='true' />
          <div className='home-hero-grain' aria-hidden='true' />
          <div className='home-hero-content'>
            <p className='home-hero-kicker'>A private cabin in Wisconsin's Northwoods</p>
            <h1 id='home-title' className='landing-title'>
              <span className='landing-title-plain'>The Druids Den</span>
              <Coelbren className='landing-title-coelbren' aria-hidden='true'>Druids Den</Coelbren>
              <span className='three-rays' aria-hidden='true'><Awen /></span>
            </h1>
            <p className='home-hero-intro'>Five and a half acres of private forest, a cozy cabin, and the kind of quiet that makes room for <i>you</i>.</p>
            <div className='home-hero-actions'>
              <Link to='/what-to-expect' className='button button-light landing-cta'>Begin Your Northwoods Adventure &gt;</Link>
              <Link to='/guide' className='home-text-link'>Already arriving?<span>Open the guide</span></Link>
            </div>
          </div>
          <div className='home-hero-meta'>
            <span>46° 04' N / 89° 15' W</span>
            <span>Conover, WI</span>
            <span className='home-scroll-note'>Scroll to wander<b aria-hidden='true'>↓</b></span>
          </div>
        </section>

        <section className='home-introduction site-band'>
          <div className='home-introduction-marker'>
            <AssetIcon name='crow.png' alt='' />
            <span>01 / The invitation</span>
          </div>
          <div className='home-introduction-copy'>
            <p className='home-display-copy'>The Druids Den is your intimate woodland basecamp for exploring the beautiful Northwoods of Wisconsin and Michigan's Upper Peninsula.</p>
            <p className='home-body-copy'>A refuge for slow mornings, deep breaths, and the rituals you discover when nobody is rushing you along. Come for the forest. Stay for the solitude.</p>
            <ArrowLink to='/the-den'>See what staying here is like</ArrowLink>
          </div>
          <div className='home-introduction-side-note'>
            <Coelbren renderAs='span' className='coelbren-label'>Take it easy</Coelbren>
            <p>No lobby. No itinerary required.</p>
          </div>
        </section>

        <section className='home-glance'>
          <div className='home-glance-heading'>
            <span className='section-number'>02</span>
            <h2>The cabin at a glance</h2>
          </div>
          <div className='home-glance-list'>
            <div><strong>6</strong><span>guests, 4 comfortably</span></div>
            <div><strong>5½</strong><span>acres of private forest</span></div>
            <div><strong>4</strong><span>seasons worth arriving for</span></div>
            <div><strong>1</strong><span>projector, many movie nights</span></div>
          </div>
        </section>

        <section className='home-photo-story'>
          <div className='home-photo-story-heading'>
            <CoelbrenLabel>Small signs of life</CoelbrenLabel>
            <h2>Look a little closer.</h2>
          </div>
          <div className='home-photo-layout'>
            <figure className='home-photo home-photo-large'>
              <img src='/assets/images/druids_den_mushroom_on_tree.jpg' alt='A mushroom growing from a tree at the Den' loading='lazy' />
              <figcaption>There is always something growing.</figcaption>
            </figure>
            <figure className='home-photo home-photo-small'>
              <img src='/assets/images/door_in_the_wall.jpeg' alt='A weathered wooden door hidden among the trees at the Den' loading='lazy' />
              <figcaption>Open the doors of perception to a hidden world.</figcaption>
            </figure>
            <div className='home-photo-note'>
              <AssetIcon name='single-mushroom.png' alt='' />
              <p>Where the woods are your nearest neighbor.</p>
              <ArrowLink to='/gallery'>Enter the photo journal</ArrowLink>
            </div>
          </div>
        </section>

        <section className='home-den-preview site-band site-band-dark'>
          <div className='home-den-preview-copy'>
            <span className='section-number'>03</span>
            <h2>Inside the Den</h2>
            <CoelbrenLabel>What makes it work</CoelbrenLabel>
            <p>Radiant floors, a gas fireplace, a full kitchen, a covered porch, and enough room for four people to find their own corner.</p>
            <ArrowLink to='/the-den'>Tour the cabin</ArrowLink>
          </div>
          <figure className='home-den-preview-photo'>
            <img src='/assets/images/druids_den_primary_bedroom.jpeg' alt='The sunlit primary bedroom with green walls, a wood ceiling, and forest-facing windows' loading='lazy' />
            <figcaption>Primary bedroom / morning light / one good book</figcaption>
          </figure>
          <AssetIcon name='01-constellation.png' alt='' className='home-constellation' />
        </section>

        <section className='home-northwoods site-band'>
          <div className='home-northwoods-image'>
            <img src='/assets/images/druids_den_sky_image.jpg' alt='Sky framed by the trees around the Druids Den' loading='lazy' />
            <span>North of ordinary</span>
          </div>
          <div className='home-northwoods-copy'>
            <span className='section-number'>04</span>
            <h2>The Northwoods, unedited.</h2>
            <p>Water, woods, supper clubs, winter roads, and the places we send friends. A regional field guide for before you arrive and while you're here.</p>
            <ArrowLink to='/northwoods'>Read the field guide</ArrowLink>
          </div>
        </section>

        <section className='home-stay-cta'>
          <div>
            <CoelbrenLabel>Stay with us</CoelbrenLabel>
            <h2>The quiet is calling.</h2>
          </div>
          <div className='home-stay-cta-copy'>
            <p>The Den is for friends, family, and invited guests while we learn the shape of a great stay.</p>
            <ArrowLink to='/stay'>Family? Friends? Reach out here</ArrowLink>
          </div>
        </section>
      </main>
      <aside className='home-weather-dock' aria-label='Current weather'><Weather /></aside>
      <SiteFooter />
    </div>
  )
}

export default Landing
