import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Coelbren from '../Coelbren'
import Awen from '../Awen'
import { bookingLinks } from '../../config/booking'
import './SiteComponents.scss'

const publicNavigation = [
  { label: 'The Den', to: '/the-den' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Northwoods', to: '/northwoods' },
  { label: 'The Story', to: '/story' },
  { label: 'Spooktoberfest', to: '/spooktoberfest' },
  { label: 'Guest guide', to: '/guide', className: 'site-navigation-guide-link' },
]

const isSpooktoberfestNavigationVisible = (date = new Date()) => {
  const month = date.getMonth()
  return month >= 3 && (month < 9 || (month === 9 && date.getDate() <= 15))
}

export const CoelbrenLabel = ({ children, className = '' }) => (
  <span className={`coelbren-label ${className}`}>
    <span className='sr-only'>{children}</span>
    <Coelbren renderAs='span' aria-hidden='true'>{children}</Coelbren>
  </span>
)

export const BookingAction = ({ className = '', fallbackLink = false, onClick }) => {
  const primaryBookingLink = bookingLinks[0]
  if (primaryBookingLink) {
    return (
      <a className={className} href={primaryBookingLink.href} target='_blank' rel='noopener noreferrer' onClick={onClick}>
        Check availability
      </a>
    )
  }

  return fallbackLink ? (
    <Link className={className} to='/stay' onClick={onClick}>Rental stays coming soon</Link>
  ) : (
    <p className='booking-coming-soon' role='status'>Rental stays coming soon</p>
  )
}

export const AlternateBookingLinks = () => (
  bookingLinks.length > 1 && (
    <div className='stay-alternate-bookings' aria-label='Other booking listings'>
      {bookingLinks.slice(1).map(({ platform, href }) => (
        <a key={platform} href={href} target='_blank' rel='noopener noreferrer'>Also listed on {platform}</a>
      ))}
    </div>
  )
)

const AwenMark = () => (
  <span className='site-wordmark-symbol' aria-hidden='true'>
    <span className='site-wordmark-awen'><Awen /></span>
  </span>
)

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeMenu = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', closeMenu)
    return () => window.removeEventListener('keydown', closeMenu)
  }, [menuOpen])

  const closeOnNavigate = () => setMenuOpen(false)
  const showSpooktoberfest = isSpooktoberfestNavigationVisible()

  return (
    <header className='site-header'>
      <Link className='site-wordmark' to='/' onClick={closeOnNavigate} aria-label='The Druids Den home'>
        <AwenMark />
        <span>
          <strong>The Druids Den</strong>
          <small>Conover, Wisconsin</small>
        </span>
      </Link>

      <button
        className='site-menu-toggle'
        type='button'
        aria-expanded={menuOpen}
        aria-controls='primary-navigation'
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
        <span className='site-menu-lines' aria-hidden='true'><i /><i /></span>
      </button>

      <nav id='primary-navigation' className={`site-navigation ${menuOpen ? 'is-open' : ''}`} aria-label='Primary navigation'>
        {publicNavigation.filter((item) => item.to !== '/spooktoberfest' || showSpooktoberfest).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeOnNavigate}
            className={({ isActive }) => [item.className, isActive && 'is-active'].filter(Boolean).join(' ') || undefined}
          >
            {item.label}
          </NavLink>
        ))}
        <BookingAction className='site-navigation-cta' fallbackLink onClick={closeOnNavigate} />
      </nav>
    </header>
  )
}

export const SiteFooter = () => (
  <footer className='site-footer'>
    <div className='site-footer-mark'>
      <AwenMark />
      <div>
        <CoelbrenLabel>Return to the woods</CoelbrenLabel>
        <p>The Druids Den</p>
      </div>
    </div>
    <div className='site-footer-links'>
      <div>
        <span className='footer-label'>Find your way</span>
        <Link to='/the-den'>The Den</Link>
        <Link to='/gallery'>Gallery</Link>
        <Link to='/northwoods'>Northwoods</Link>
        <Link to='/guide'>Guest guide</Link>
      </div>
      <div>
        <span className='footer-label'>Ask the keepers</span>
        <a href='mailto:NSVH2025@GMAIL.COM?cc=grovekeeper@druidsdenwi.com'>Email</a>
        <span>Conover, Wisconsin</span>
      </div>
    </div>
    <div className='site-footer-bottom'>
      <span>A private cabin in Conover, Wisconsin</span>
      <span>Property managed by Northwoods Signature Vacation Homes</span>
      <span>©<span className='site-footer-year'>{new Date().getFullYear()}</span><span className='site-footer-title'>The Druids Den</span></span>
    </div>
  </footer>
)

export const SectionMarker = ({ eyebrow, title, coelbren = title, invert = false }) => (
  <div className={`section-marker ${invert ? 'section-marker-invert' : ''}`}>
    <span className='section-marker-eyebrow'>{eyebrow}</span>
    <CoelbrenLabel>{coelbren}</CoelbrenLabel>
    <h2>{title}</h2>
  </div>
)

export const ArrowLink = ({ children, to, href, className = '' }) => {
  const content = <>{children}<span aria-hidden='true' className='arrow-link-mark'>-&gt;</span></>
  return href ? (
    <a className={`arrow-link ${className}`} href={href} target='_blank' rel='noreferrer'>{content}</a>
  ) : (
    <Link className={`arrow-link ${className}`} to={to}>{content}</Link>
  )
}

export const AssetIcon = ({ name, alt = '', className = '' }) => (
  <img className={`asset-icon ${className}`} src={`/assets/iconography/${name}`} alt={alt} loading='lazy' />
)

export const PhotoFigure = ({ src, alt, caption, className = '', loading = 'lazy' }) => (
  <figure className={`photo-figure ${className}`}>
    <img src={src} alt={alt} loading={loading} />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
)

export const Quote = ({ children, cite }) => (
  <figure className='editorial-quote'>
    <blockquote>“{children}”</blockquote>
    {cite && <figcaption>{cite}</figcaption>}
  </figure>
)

export const PageFrame = ({ children, className = '' }) => (
  <div className={`public-page ${className}`}>
    <SiteHeader />
    {children}
    <SiteFooter />
  </div>
)

export const Meta = ({ title, description, image = '/assets/images/druids_den_summer_daisies_evening.jpg' }) => {
  useEffect(() => {
    document.title = title
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`
    const imageUrl = new URL(image, window.location.origin).href

    const updateMeta = (selector, attributes, content) => {
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        Object.entries(attributes).forEach(([attribute, value]) => element.setAttribute(attribute, value))
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    updateMeta('meta[name="description"]', { name: 'description' }, description)
    updateMeta('meta[property="og:title"]', { property: 'og:title' }, title)
    updateMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    updateMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    updateMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    updateMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl)
    updateMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
    updateMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description)
    updateMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [description, image, title])

  return null
}