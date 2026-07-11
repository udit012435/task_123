import { useEffect, useRef, useState } from 'react'
import './DestinationZoom.css'

const FRAME_COUNT = 51
const FRAME_PATH = (index) => `/assets/ezgif-frame-${String(index).padStart(3, '0')}.jpg`

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
  const pinRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const frameIndexRef = useRef(0)
  const stageRefs = useRef([])
  const progressFillRef = useRef(null)
  const pinPhaseRef = useRef('')

  const [loadedCount, setLoadedCount] = useState(0)
  const [ready, setReady] = useState(false)
  // Reflects the sequence position as scroll state: 'intro' -> 'playing' -> 'done'.
  // 'done' means every frame has played, so the page is free to scroll on.
  const [phase, setPhase] = useState('intro')
  const phaseRef = useRef('intro')

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

  const applyProgress = (progress, force = false) => {
    const frameIndex = Math.min(
      FRAME_COUNT,
      Math.max(1, Math.round(1 + progress * (FRAME_COUNT - 1)))
    )
    if (force || frameIndex !== frameIndexRef.current) {
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

    // Track the scroll-driven phase in state. Only flip on a real transition
    // so we are not calling setState on every animation frame.
    const nextPhase = progress >= 0.999 ? 'done' : progress <= 0.001 ? 'intro' : 'playing'
    if (nextPhase !== phaseRef.current) {
      phaseRef.current = nextPhase
      setPhase(nextPhase)
    }
  }

  // Preload the whole frame sequence up front.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Exactly the ScrollMagic pin technique: a tall section acts as the spacer
  // that reserves the scroll distance, and the inner wrap is pinned by
  // toggling its position across three phases as you scroll through it:
  //
  //   before  -> position: relative  (sits at the top of the section)
  //   during  -> position: fixed     (pinned to the viewport, frames play)
  //   after   -> position: absolute  (parked at the bottom of the section)
  //
  // The frame index and every text tween are derived purely from how far you
  // have scrolled into the section, so:
  //   - scroll down drives 0 -> 1 (frames forward) and, at the bottom, the wrap
  //     unpins and the page continues to the next section;
  //   - scroll up drives 1 -> 0 (frames reverse) and, at the top (frame 1), it
  //     unpins so you continue up to the previous section.
  //
  // Using fixed (not sticky) makes the pin immune to the ancestor's
  // `overflow-x: hidden`, which would otherwise break sticky pinning.
  useEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    if (!section || !pin) return

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
      const duration = section.offsetHeight - window.innerHeight
      const scrolled = -section.getBoundingClientRect().top

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

      applyProgress(clamp01(progress))
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
      renderOnce() // settle on the correct clamped end (frame 1 or frame 51)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      },
      { threshold: 0 },
    )
    observer.observe(section)

    const onResize = () => {
      drawFrame(frameIndexRef.current || 1)
      renderOnce()
    }
    window.addEventListener('resize', onResize)

    renderOnce()

    return () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPercent = Math.round((loadedCount / FRAME_COUNT) * 100)

  return (
    <section
      ref={sectionRef}
      className={`zoom-section zoom-${phase}`}
      aria-label="Scroll to zoom into a destination"
    >
      <div ref={pinRef} className="zoom-pin">
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
      </div>
    </section>
  )
}

export default DestinationZoom
