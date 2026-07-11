import {
  FaPaperPlane,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa'
import './Footer.css'

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Why Choose Us', href: '#why-us' },
  { label: 'Tour Packages', href: '#packages' },
]

const SERVICES = [
  { label: 'Flight Booking', href: '#packages' },
  { label: 'Hotel Reservations', href: '#packages' },
  { label: 'Guided City Tours', href: '#packages' },
  { label: 'Travel Insurance', href: '#packages' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: <FaFacebookF />, href: 'https://facebook.com' },
  { label: 'Instagram', icon: <FaInstagram />, href: 'https://instagram.com' },
  { label: 'Twitter', icon: <FaTwitter />, href: 'https://twitter.com' },
  { label: 'YouTube', icon: <FaYoutube />, href: 'https://youtube.com' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-col footer-brand">
          <a href="#home" className="footer-logo">
            <span className="footer-logo-mark">
              <FaPaperPlane />
            </span>
            Wander<span>Go</span>
          </a>
          <p>
            We craft unforgettable journeys with handpicked destinations, trusted
            local guides and unbeatable prices — making it easy for you to explore
            the world worry-free.
          </p>
          <ul className="footer-social">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Our Services</h3>
          <ul>
            {SERVICES.map((service) => (
              <li key={service.label}>
                <a href={service.href}>{service.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Get In Touch</h3>
          <ul className="footer-contact">
            <li>
              <FaMapMarkerAlt /> 42 Ocean Drive, Miami, FL
            </li>
            <li>
              <FaPhoneAlt /> +1 (555) 234-5678
            </li>
            <li>
              <FaEnvelope /> hello@wandergo.com
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} WanderGo. All rights reserved.</p>
          <ul className="footer-legal">
            <li>
              <a href="#home">Privacy Policy</a>
            </li>
            <li>
              <a href="#home">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
