import { useEffect, useRef, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import destinations from '../../data/destinations'
import './Destinations.css'

// How much scroll (in vh) each slide gets before the next one slides up.
const SLIDE_SCROLL_VH = 85

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function Destinations() {
  const total = destinations.length
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const sceneRef = useRef(null)
  const pinRef = useRef(null)
  const pinPhaseRef = useRef('')

  // Pin the stack (ScrollMagic-style) so the section holds the viewport until
  // every slide has been scrolled through. The active slide is derived purely
  // from scroll position, so scrolling down advances the stack and scrolling
  // up rewinds it; only once you pass the last (or first) slide does the page
  // continue to the next (or previous) section.
  useEffect(() => {
    const scene = sceneRef.current
    const pin = pinRef.current
    if (!scene || !pin) return undefined

    let rafId = 0
    let running = false

    const setPinPhase = (phase) => {
      if (phase === pinPhaseRef.current) return
      pinPhaseRef.current = phase
      if (phase === 'during') {
        pin.style.position = 'fixed'
        pin.style.top = '0px'
        pin.style.bottom = 'auto'
      } else if (phase === 'after') {
        pin.style.position = 'absolute'
        pin.style.top = 'auto'
        pin.style.bottom = '0px'
      } else {
        pin.style.position = 'relative'
        pin.style.top = '0px'
        pin.style.bottom = 'auto'
      }
    }

    const renderOnce = () => {
      const duration = scene.offsetHeight - window.innerHeight
      const scrolled = -scene.getBoundingClientRect().top

      let progress
      if (scrolled <= 0 || duration <= 0) {
        setPinPhase('before')
        progress = 0
      } else if (scrolled >= duration) {
        setPinPhase('after')
        progress = 1
      } else {
        setPinPhase('during')
        progress = scrolled / duration
      }

      const next = clamp(Math.round(progress * (total - 1)), 0, total - 1)
      if (next !== activeRef.current) {
        activeRef.current = next
        setActive(next)
      }
    }

    const loop = () => {
      renderOnce()
      if (running) rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running) return
      running = true
      rafId = requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      renderOnce()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      },
      { threshold: 0 },
    )
    observer.observe(scene)

    window.addEventListener('resize', renderOnce)
    renderOnce()

    return () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('resize', renderOnce)
    }
  }, [total])

  return (
    <section id="destinations" className="section destinations">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Top Picks</span>
          <h2>Popular Destinations</h2>
          <p>Discover the world's most loved places, curated just for you.</p>
        </div>
      </div>

      <div className="stack-scene" ref={sceneRef} style={{ height: `${total * SLIDE_SCROLL_VH}vh` }}>
        <div className="stack-pin" ref={pinRef}>
          {destinations.map((place, index) => (
            <article
              className="stack-slide"
              key={place.id}
              style={{
                zIndex: index + 1,
                transform: index <= active ? 'translateY(0)' : 'translateY(100%)',
              }}
            >
              <div className="container stack-slide-inner">
                <div className="stack-slide-media">
                  <img src={place.image} alt={place.name} loading="lazy" />
                  <div className="stack-slide-overlay">
                    <span className="stack-slide-rating">
                      <FaStar /> {place.rating}
                    </span>
                    <div className="stack-slide-info">
                      <h3>{place.name}</h3>
                      <p className="stack-slide-price">
                        From <strong>${place.price}</strong> / person
                      </p>
                      <button type="button" className="btn btn-primary">
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Destinations
