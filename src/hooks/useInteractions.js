import { useEffect } from 'react'

const MAGNETIC = '.button, .resume-button, .icon-button, .contact-link, .filter, .back-top, .copy-email'

// Magnetic buttons + 3D tilt on project previews. Event delegation, so it also covers elements rendered later.
export function useInteractions() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    let magnet = null
    let tiltCard = null
    const resetMagnet = () => { if (magnet) { magnet.style.translate = ''; magnet = null } }
    const resetTilt = () => {
      const visual = tiltCard?.querySelector('.project-visual')
      if (visual) visual.style.transform = ''
      tiltCard = null
    }

    const move = (event) => {
      const el = event.target.closest?.(MAGNETIC)
      if (el !== magnet) resetMagnet()
      if (el) {
        const r = el.getBoundingClientRect()
        const dx = event.clientX - (r.left + r.width / 2)
        const dy = event.clientY - (r.top + r.height / 2)
        el.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`
        magnet = el
      }

      const card = event.target.closest?.('.project-card')
      if (card !== tiltCard) resetTilt()
      if (card) {
        const r = card.getBoundingClientRect()
        const px = (event.clientX - r.left) / r.width - 0.5
        const py = (event.clientY - r.top) / r.height - 0.5
        const visual = card.querySelector('.project-visual')
        if (visual) visual.style.transform = `perspective(700px) rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) scale(1.03)`
        tiltCard = card
      }
    }
    const leave = () => { resetMagnet(); resetTilt() }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      leave()
    }
  }, [])
}
