import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let instance = null
export const scrollState = { velocity: 0 }
export const getLenis = () => instance

// Lenis smooth scrolling + CSS variables (--sy, --progress) that the stylesheet uses for parallax and the progress bar.
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true })
    instance = lenis

    lenis.on('scroll', ({ scroll, limit, velocity }) => {
      scrollState.velocity = velocity
      root.style.setProperty('--sy', scroll.toFixed(1))
      root.style.setProperty('--progress', (limit ? scroll / limit : 0).toFixed(4))
    })

    let frame
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)

    // Route in-page anchors (#about, #projects...) through Lenis so they glide instead of jumping.
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]')
      if (!link) return
      const id = link.getAttribute('href').slice(1)
      const target = id ? document.getElementById(id) : null
      event.preventDefault()
      lenis.scrollTo(target || 0, { offset: -88, duration: 1.4 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
      instance = null
    }
  }, [])
}
