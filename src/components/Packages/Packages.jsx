import { FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import packages from '../../data/packages'
import './Packages.css'

function Packages() {
  return (
    <section id="packages" className="section packages">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Handpicked For You</span>
          <h2>Tour Packages</h2>
          <p>All-inclusive packages designed for every kind of traveler.</p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg) => (
            <article className="package-card" key={pkg.id}>
              <div className="package-image">
                <img src={pkg.image} alt={pkg.name} loading="lazy" />
                <span className="package-duration">{pkg.duration}</span>
              </div>
              <div className="package-body">
                <div className="package-top">
                  <h3>{pkg.name}</h3>
                  <span className="package-rating">
                    <FaStar /> {pkg.rating}
                  </span>
                </div>
                <p className="package-location">
                  <FaMapMarkerAlt /> {pkg.location}
                </p>
                <div className="package-footer">
                  <p className="package-price">
                    <strong>${pkg.price}</strong> / person
                  </p>
                  <button type="button" className="btn btn-primary">
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Packages
