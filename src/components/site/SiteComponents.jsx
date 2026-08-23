import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Coelbren from '../Coelbren'
import Awen from '../Awen'
import './SiteComponents.scss'

const publicNavigation = [
  { label: 'The Den', to: '/the-den' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Northwoods', to: '/northwoods' },
  { label: 'The Story', to: '/story' },
  { label: 'Spooktoberfest', to: '/spooktoberfest' },
]

export const CoelbrenLabel = ({ children, className = '' }) => (
  <span className={`coelbren-label ${className}`}>
    <span className='sr-only'>{children}</span>
    <Coelbren renderAs='span' aria-hidden='true'>{children}</Coelbren>
  </span>
)

const AwenMark = () => (
  <span className='site-wordmark-symbol' aria-hidden='true'>
    <span className='site-wordmark-awen'><Awen /></span>
  </span>
)

export const SiteHeader = ({ guide = false }) => {
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

  return (
    <header className={`site-header ${guide ? 'site-header-guide' : ''}`}>
      <Link className='site-wordmark' to={guide ? '/guide' : '/'} onClick={closeOnNavigate} aria-label={guide ? 'The Druids Den guest guide' : 'The Druids Den home'}>
        <AwenMark />
        <span>
          <strong>The Druids Den</strong>
          <small>{guide ? 'Guest guide' : 'Conover, Wisconsin'}</small>
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
        {!guide && publicNavigation.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={closeOnNavigate} className={({ isActive }) => isActive ? 'is-active' : undefined}>
            {item.label}
          </NavLink>
        ))}
        {guide ? (
          <Link className='site-navigation-guide-link' to='/'>Back to the Den</Link>
        ) : (
          <Link className='site-navigation-guide-link' to='/guide' onClick={closeOnNavigate}>Guest guide</Link>
        )}
        <Link className='site-navigation-cta' to='/stay' onClick={closeOnNavigate}>Plan a private stay</Link>
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
        <a href='mailto:grovekeeper@druidsdenwi.com'>grovekeeper@druidsdenwi.com</a>
        <span>Conover, Wisconsin</span>
      </div>
    </div>
    <div className='site-footer-bottom'>
      <span>Private hospitality by invitation</span>
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