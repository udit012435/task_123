import { useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Packages', href: '#packages' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#home" className="navbar-logo">
          <span className="navbar-logo-mark">
            <FaPaperPlane />
          </span>
          Wander<span>Go</span>
        </a>

        <nav className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#packages" className="btn btn-primary navbar-cta" onClick={() => setMenuOpen(false)}>
            Book Now
          </a>
        </nav>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? 'navbar-toggle-open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export default Navbar
