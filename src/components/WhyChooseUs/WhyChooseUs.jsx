import { FaTags, FaShieldAlt, FaHeadset, FaMapSigns } from 'react-icons/fa'
import './WhyChooseUs.css'

const FEATURES = [
  {
    icon: <FaTags />,
    title: 'Best Price',
    description: 'Guaranteed lowest prices on flights, stays and curated tour packages.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Secure Booking',
    description: 'Your payments and personal data are protected with bank-grade security.',
  },
  {
    icon: <FaHeadset />,
    title: '24x7 Support',
    description: 'Our travel experts are available around the clock, wherever you are.',
  },
  {
    icon: <FaMapSigns />,
    title: 'Trusted Guides',
    description: 'Certified local guides who know every hidden gem worth visiting.',
  },
]

function WhyChooseUs() {
  return (
    <section id="why-us" className="section why-us">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why WanderGo</span>
          <h2>Why Choose Us</h2>
          <p>We make travel planning simple, safe and truly memorable.</p>
        </div>

        <div className="why-us-grid">
          {FEATURES.map((feature) => (
            <div className="why-us-card" key={feature.title}>
              <div className="why-us-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
