import React, { useEffect, useRef } from 'react'
import { scrollState } from '../hooks/useSmoothScroll'

const ITEMS = ['Java', 'Spring Boot', 'Kafka', 'Microservices', 'React', 'Next.js', 'AI', 'PostgreSQL', 'Azure', 'Docker']

// Ticker that speeds up with scroll velocity and reverses when you scroll up.
export default function Marquee() {
  const track = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let x = 0, dir = 1, last = performance.now(), frame
    const loop = (now) => {
      const dt = Math.min(now - last, 50)
      last = now
      const v = scrollState.velocity
      if (Math.abs(v) > 0.2) dir = v > 0 ? 1 : -1
      x -= dir * (0.045 + Math.min(Math.abs(v), 40) * 0.012) * dt
      const half = track.current.scrollWidth / 2
      if (x <= -half) x += half
      if (x > 0) x -= half
      track.current.style.transform = `translate3d(${x}px,0,0)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  const row = ITEMS.map((item) => <span key={item}>{item} <i>✦</i></span>)
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={track}>{row}{row}{row}{row}</div>
    </div>
  )
}
