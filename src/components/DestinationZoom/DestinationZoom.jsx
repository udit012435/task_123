import { useEffect, useRef, useState } from 'react'
import './DestinationZoom.css'

const FRAME_COUNT = 51
const FRAME_PATH = (index) => `/assets/ezgif-frame-${String(index).padStart(3, '0')}.jpg`
const TOUCH_SENSITIVITY = 2.2

const STAGES = [
  {
    range: [0, 0.04, 0.16, 0.22],
    eyebrow: 'WanderGo',
    title: 'One Planet.',
    text: 'Somewhere up there, your next trip is already waiting.',
  },
  {
    range: [0.22, 0.28, 0.42, 0.48],
    eyebrow: 'Zooming in',
    title: 'Endless Destinations.',
    text: 'From coastlines to skylines — 150+ places to fall in love with.',
  },
  {
    range: [0.48, 0.54, 0.68, 0.74],
    eyebrow: 'Almost there',
    title: 'One Scroll Away.',
    text: 'No layovers, no planning stress. Just keep scrolling.',
  },
  {
    range: [0.74, 0.82, 0.99, 1],
    eyebrow: 'Agra, India',
    title: 'Welcome to the Taj Mahal.',
    text: 'This is what it feels like when WanderGo plans your trip.',
  },
]

function interpolate(input, output, value) {
  if (value <= input[0]) return output[0]
  if (value >= input[input.length - 1]) return output[output.length - 1]

  for (let i = 0; i < input.length - 1; i += 1) {
    if (value >= input[i] && value <= input[i + 1]) {
      const span = input[i + 1] - input[i]
      const t = span === 0 ? 1 : (value - input[i]) / span
      return output[i] + (output[i + 1] - output[i]) * t
    }
  }

  return output[output.length - 1]
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function DestinationZoom() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const frameIndexRef = useRef(0)
  const stageRefs = useRef([])
  const progressFillRef = useRef(null)
  const progressRef = useRef(0)
  const lockedRef = useRef(false)
  const canRelockRef = useRef(true)

  const [loadedCount, setLoadedCount] = useState(0)
  const [ready, setReady] = useState(false)

  const drawFrame = (index) => {
    const canvas = canvasRef.current
    const image = imagesRef.current[index - 1]
    if (!canvas || !image || !image.complete || !image.naturalWidth) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssWidth = canvas.clientWidth
    const cssHeight = canvas.clientHeight

    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr
      canvas.height = cssHeight * dpr
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const canvasRatio = cssWidth / cssHeight
    const imageRatio = image.naturalWidth / image.naturalHeight

    let drawWidth
    let drawHeight
    if (imageRatio > canvasRatio) {
      drawHeight = cssHeight
      drawWidth = drawHeight * imageRatio
    } else {
      drawWidth = cssWidth
      drawHeight = drawWidth / imageRatio
    }

    const offsetX = (cssWidth - drawWidth) / 2
    const offsetY = (cssHeight - drawHeight) / 2

    ctx.clearRect(0, 0, cssWidth, cssHeight)
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  }

  const applyProgress = (progress) => {
    const frameIndex = Math.min(
      FRAME_COUNT,
      Math.max(1, Math.round(1 + progress * (FRAME_COUNT - 1)))
    )
    if (frameIndex !== frameIndexRef.current) {
      frameIndexRef.current = frameIndex
      drawFrame(frameIndex)
    }

    STAGES.forEach((stage, i) => {
      const el = stageRefs.current[i]
      if (!el) return
      const opacity = interpolate(stage.range, [0, 1, 1, 0], progress)
      const y = interpolate(stage.range, [24, 0, 0, -24], progress)
      el.style.opacity = opacity
      el.style.transform = `translateY(${y}px)`
    })

    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${progress * 100}%`
    }
  }

  useEffect(() => {
    let loaded = 0
    const images = []

    for (let i = 1; i <= FRAME_COUNT; i += 1) {
      const img = new Image()
      img.src = FRAME_PATH(i)
      img.onload = () => {
        loaded += 1
        setLoadedCount(loaded)
        if (i === 1) drawFrame(1)
        if (loaded === FRAME_COUNT) setReady(true)
      }
      images.push(img)
    }

    imagesRef.current = images
    applyProgress(0)

    const handleResize = () => drawFrame(frameIndexRef.current || 1)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll-jacking: once the section reaches the viewport, trap the scroll
  // (purely via preventDefault) and drive the frame sequence from wheel/touch
  // input until it finishes, then let the very scroll that crosses the end
  // pass straight through to native scrolling so the user continues on.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scrollDistance = () => Math.max(window.innerHeight * 2.4, 1400)

    // Normalise wheel delta so line/page-mode wheels advance at the same rate
    // as pixel-mode ones (otherwise line-mode mice barely move the sequence).
    const normalize = (event) => {
      if (event.deltaMode === 1) return event.deltaY * 16
      if (event.deltaMode === 2) return event.deltaY * window.innerHeight
      return event.deltaY
    }

    // The section covers the middle line of the viewport -> ready to engage.
    const nearSection = () => {
      const rect = section.getBoundingClientRect()
      const mid = window.innerHeight * 0.5
      return rect.top <= mid && rect.bottom >= mid
    }

    const lock = () => {
      // Snap the section flush to the top once, then hold it there by
      // preventing every wheel/touch scroll while locked.
      window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY)
      lockedRef.current = true
    }

    const unlock = () => {
      lockedRef.current = false
      canRelockRef.current = false
    }

    const step = (deltaY) => {
      const next = clamp01(progressRef.current + deltaY / scrollDistance())
      progressRef.current = next
      applyProgress(next)
    }

    // Returns true if the scroll was consumed (caller must preventDefault).
    const drive = (deltaY) => {
      if (lockedRef.current) {
        // At an end and still pushing outward -> release; let this scroll
        // fall through to the browser so the user leaves the section.
        if ((progressRef.current >= 1 && deltaY > 0) || (progressRef.current <= 0 && deltaY < 0)) {
          unlock()
          return false
        }
        step(deltaY)
        return true
      }

      // Re-arm only after the section has fully left the engage band, so a
      // stray flick right after release can't immediately re-trap the user.
      if (!canRelockRef.current) {
        if (!nearSection()) canRelockRef.current = true
        return false
      }

      const wantsDown = deltaY > 0 && progressRef.current < 1
      const wantsUp = deltaY < 0 && progressRef.current > 0
      if ((wantsDown || wantsUp) && nearSection()) {
        lock()
        step(deltaY)
        return true
      }
      return false
    }

    const handleWheel = (event) => {
      if (drive(normalize(event))) event.preventDefault()
    }

    let touchStartY = null

    const handleTouchStart = (event) => {
      touchStartY = event.touches[0].clientY
    }

    const handleTouchMove = (event) => {
      if (touchStartY === null) return
      const currentY = event.touches[0].clientY
      const deltaY = (touchStartY - currentY) * TOUCH_SENSITIVITY
      touchStartY = currentY
      if (drive(deltaY)) event.preventDefault()
    }

    const handleTouchEnd = () => {
      touchStartY = null
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const loadPercent = Math.round((loadedCount / FRAME_COUNT) * 100)

  return (
    <section ref={sectionRef} className="zoom-section" aria-label="Scroll to zoom into a destination">
      <canvas ref={canvasRef} className="zoom-canvas" />
      <div className="zoom-vignette" />

      {!ready && (
        <div className="zoom-loader">
          <div className="zoom-loader-bar">
            <div className="zoom-loader-fill" style={{ width: `${loadPercent}%` }} />
          </div>
          <span>{loadPercent}%</span>
        </div>
      )}

      <div className="zoom-copy">
        {STAGES.map((stage, i) => (
          <div
            className="zoom-stage"
            key={stage.title}
            ref={(el) => {
              stageRefs.current[i] = el
            }}
          >
            <span className="zoom-eyebrow">{stage.eyebrow}</span>
            <h2>{stage.title}</h2>
            <p>{stage.text}</p>
          </div>
        ))}
      </div>

      <div className="zoom-progress-track">
        <div className="zoom-progress-fill" ref={progressFillRef} />
      </div>
    </section>
  )
}

export default DestinationZoom
