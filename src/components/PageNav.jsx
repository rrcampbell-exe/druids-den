import { useState, useEffect, useRef } from 'react'
import './PageNav.scss'

const PageNav = ({ title = "Jump to Section:", items = [] }) => {
  const [expandedSections, setExpandedSections] = useState({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const navRef = useRef(null)

  const toggleSection = (label) => {
    setExpandedSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const closeAllDropdowns = () => {
    setExpandedSections({})
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeAllDropdowns()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          setActiveSection(`#${id}`)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    const getAllHrefs = (items) => {
      const hrefs = []
      items.forEach(item => {
        if (item.href) hrefs.push(item.href)
        if (item.children) {
          item.children.forEach(child => {
            if (child.href) hrefs.push(child.href)
          })
        }
      })
      return hrefs
    }

    const hrefs = getAllHrefs(items)
    const sections = hrefs
      .map(href => document.querySelector(href))
      .filter(Boolean)

    sections.forEach(section => observer.observe(section))

    return () => {
      sections.forEach(section => observer.unobserve(section))
    }
  }, [items])

  const renderNavItem = (item) => {
    if (item.children && item.children.length > 0) {
      const isExpanded = expandedSections[item.label]
      
      return (
        <li key={item.label} className='nav-item-with-children'>
          <button 
            className='nav-parent-button'
            onClick={() => toggleSection(item.label)}
            aria-expanded={isExpanded}
          >
            {item.label}
            <span className='dropdown-icon'>{isExpanded ? '▼' : '▶'}</span>
          </button>
          {isExpanded && (
            <ul className='nav-submenu'>
              {item.children.map(child => (
                <li key={child.href}>
                  <a href={child.href} onClick={closeMobileMenu}>{child.label}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
      )
    }

    return (
      <li key={item.href}>
        <a 
          href={item.href} 
          onClick={closeMobileMenu}
          className={activeSection === item.href ? 'active' : ''}
        >
          {item.label}
        </a>
      </li>
    )
  }

  return (
    <nav className='page-navigation' ref={navRef}>
      <div className='page-navigation-header'>
        <h3>{title}</h3>
        <button 
          className='mobile-menu-toggle'
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label='Toggle navigation menu'
        >
          <span className='hamburger-icon'>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      <ul className={mobileMenuOpen ? 'mobile-open' : ''}>
        {items.map(item => renderNavItem(item))}
      </ul>
    </nav>
  )
}

export default PageNav
