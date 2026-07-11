import { useState } from 'react'
import './Hero.css'

function Hero() {
  const [destination, setDestination] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    const target = document.querySelector('#destinations')
    target?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="hero">
      <video
        className="hero-video"
        src="/videos/hero_vid.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-overlay" />
      <div className="container hero-inner">
        <p className="hero-eyebrow">Your journey starts here</p>
        <h1 className="hero-title">
          Explore The World, <span>One Trip At A Time</span>
        </h1>
        <p className="hero-subtitle">
          Handpicked destinations, unbeatable prices and unforgettable experiences —
          plan your next adventure with WanderGo.
        </p>

        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Where do you want to go?"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            aria-label="Search destination"
          />
          <button type="submit" className="btn btn-primary">
            Search Trip
          </button>
        </form>

        <div className="hero-stats">
          <div>
            <strong>12k+</strong>
            <span>Happy Travelers</span>
          </div>
          <div>
            <strong>150+</strong>
            <span>Destinations</span>
          </div>
          <div>
            <strong>4.9/5</strong>
            <span>Average Rating</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
