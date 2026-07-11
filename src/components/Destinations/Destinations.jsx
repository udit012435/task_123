import { useEffect, useRef, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import destinations from '../../data/destinations'
import './Destinations.css'

const TRANSITION_MS = 650
const ENGAGE_RATIO = 0.9

function Destinations() {
  const total = destinations.length
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const lockRef = useRef(null)
  const engagedRef = useRef(false)
  const animatingRef = useRef(false)
  const touchStartY = useRef(null)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const el = lockRef.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasEngaged = engagedRef.current
        const nowEngaged = entry.intersectionRatio >= ENGAGE_RATIO
        engagedRef.current = nowEngaged

        if (nowEngaged && !wasEngaged && Math.abs(entry.boundingClientRect.top) > 2) {
          window.scrollBy({ top: entry.boundingClientRect.top, left: 0, behavior: 'instant' })
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.9, 0.95, 1] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const tryAdvance = (deltaY) => {
      if (!engagedRef.current || deltaY === 0) return false

      const goingDown = deltaY > 0
      if (goingDown && activeRef.current >= total - 1) return false
      if (!goingDown && activeRef.current <= 0) return false

      if (!animatingRef.current) {
        animatingRef.current = true
        activeRef.current += goingDown ? 1 : -1
        setActive(activeRef.current)
        setTimeout(() => {
          animatingRef.current = false
        }, TRANSITION_MS)
      }
      return true
    }

    const onWheel = (e) => {
      if (tryAdvance(e.deltaY)) e.preventDefault()
    }

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }

    const onTouchMove = (e) => {
      if (touchStartY.current === null) return
      const deltaY = touchStartY.current - e.touches[0].clientY
      if (Math.abs(deltaY) < 12) return
      if (tryAdvance(deltaY)) {
        e.preventDefault()
        touchStartY.current = e.touches[0].clientY
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
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

      <div className="stack-lock" ref={lockRef}>
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

        <div className="container stack-progress-wrap">
          <div className="stack-progress">
            {destinations.map((place, index) => (
              <span key={place.id} className={index === active ? 'active' : ''} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Destinations
