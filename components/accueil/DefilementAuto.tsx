"use client"

import { useEffect, useRef, type ReactNode } from 'react'

/*
 * Wraps a horizontally scrolling list (the home page's project tiles on small
 * screens) and drifts it slowly on its own, so it is clear there is more to
 * see. It only moves when the list actually overflows; touching, hovering,
 * focusing or scrolling it pauses the drift, which resumes a few seconds after
 * the last interaction. At the end it waits, then glides back to the start.
 * Off screen, in a hidden tab or with reduced motion, it stays still.
 */

const VITESSE = 28 // pixels per second
const REPRISE_MS = 3500
const PAUSE_FIN_MS = 1600

export default function DefilementAuto({ className, children }: { className?: string; children: ReactNode }) {
  const liste = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = liste.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let image = 0
    let avant = 0
    let position = el.scrollLeft // kept as a float: scrollLeft rounds to whole pixels
    let repriseA = 0 // timestamp before which the drift stays paused
    let visible = true
    let survole = false
    let appuye = false
    let retour: number | undefined
    const interaction = () => survole || appuye || el.contains(document.activeElement)

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const pauser = (ms = REPRISE_MS) => {
      window.clearTimeout(retour)
      repriseA = performance.now() + ms
      el.dataset.auto = ''
    }

    const boucle = (t: number) => {
      const dt = avant ? Math.min(0.1, (t - avant) / 1000) : 0
      avant = t
      const max = el.scrollWidth - el.clientWidth
      if (max > 4 && visible && !document.hidden && !interaction() && t >= repriseA) {
        // Snapping would pull each small step back, so it is off while drifting
        el.dataset.auto = 'oui'
        if (Math.abs(el.scrollLeft - position) > 2) position = el.scrollLeft // the visitor moved it
        position = Math.min(max, position + VITESSE * dt)
        el.scrollLeft = position
        if (position >= max) {
          // The end: a pause, a glide back to the start, another pause
          pauser(PAUSE_FIN_MS + 1800)
          retour = window.setTimeout(() => {
            if (interaction() || !visible || document.hidden) return
            el.scrollTo({ left: 0, behavior: 'smooth' })
            position = 0
          }, PAUSE_FIN_MS)
        }
      }
      image = requestAnimationFrame(boucle)
    }
    image = requestAnimationFrame(boucle)

    // Any hand on it pauses the drift
    const main = () => pauser()
    const molette = () => pauser()
    const entrer = (e: PointerEvent) => { survole = e.pointerType !== 'touch'; pauser() }
    const sortir = () => { survole = false; pauser() }
    const presser = () => { appuye = true; pauser() }
    const relacher = () => { appuye = false; pauser() }
    el.addEventListener('pointerenter', entrer)
    el.addEventListener('pointerleave', sortir)
    el.addEventListener('pointerdown', presser)
    window.addEventListener('pointerup', relacher)
    window.addEventListener('pointercancel', relacher)
    el.addEventListener('focusout', main)
    el.addEventListener('pointerdown', main)
    el.addEventListener('touchstart', main, { passive: true })
    el.addEventListener('focusin', main)
    el.addEventListener('wheel', molette, { passive: true })

    return () => {
      cancelAnimationFrame(image)
      window.clearTimeout(retour)
      el.removeEventListener('pointerenter', entrer)
      el.removeEventListener('pointerleave', sortir)
      el.removeEventListener('pointerdown', presser)
      window.removeEventListener('pointerup', relacher)
      window.removeEventListener('pointercancel', relacher)
      el.removeEventListener('focusout', main)
      io.disconnect()
      el.removeEventListener('pointerdown', main)
      el.removeEventListener('touchstart', main)
      el.removeEventListener('focusin', main)
      el.removeEventListener('wheel', molette)
    }
  }, [])

  return (
    <ul ref={liste} className={className}>
      {children}
    </ul>
  )
}
