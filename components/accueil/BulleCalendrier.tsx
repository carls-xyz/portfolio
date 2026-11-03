"use client"

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import styles from './ActiviteGitHub.module.css'

/*
 * The tooltip of the GitHub calendar: hovering a day (or focusing an active
 * one from the keyboard) shows its count and date in a small bubble above it.
 * Each day carries its text in data-nombre and data-jour. The bubble sits
 * outside the calendar's scroll box, so scrolling sideways never clips it.
 */

type Bulle = { nombre: string; jour: string; x: number; y: number; fleche: number }

/** Half the bubble's widest text, kept clear of the card's edges */
const DEMI_BULLE = 100

export default function BulleCalendrier({ children }: { children: ReactNode }) {
  const zone = useRef<HTMLDivElement>(null)
  const [bulle, setBulle] = useState<Bulle | null>(null)

  // Any scroll (the page, or the calendar sideways) moves the day away from the bubble: close it
  useEffect(() => {
    if (!bulle) return
    const fermer = () => setBulle(null)
    window.addEventListener('scroll', fermer, { capture: true, passive: true })
    window.addEventListener('widgets', fermer)
    return () => {
      window.removeEventListener('scroll', fermer, { capture: true })
      window.removeEventListener('widgets', fermer)
    }
  }, [bulle])

  const montrer = (cible: EventTarget | null) => {
    const jour = cible instanceof Element ? cible.closest<HTMLElement>('[data-jour]') : null
    const conteneur = zone.current
    if (!jour || !conteneur) return setBulle(null)
    const r = jour.getBoundingClientRect()
    const c = conteneur.getBoundingClientRect()
    // Near the card's edges the bubble slides inwards; its arrow still points at the day
    const centre = r.left - c.left + r.width / 2
    const x = Math.min(Math.max(centre, DEMI_BULLE), c.width - DEMI_BULLE)
    setBulle({
      nombre: jour.dataset.nombre ?? '',
      jour: jour.dataset.jour ?? '',
      x,
      y: r.top - c.top,
      fleche: centre - x,
    })
  }

  return (
    <div
      ref={zone}
      className={styles.zoneBulle}
      onPointerOver={(e: PointerEvent) => montrer(e.target)}
      onPointerLeave={() => setBulle(null)}
      onFocus={(e: FocusEvent) => montrer(e.target)}
      onBlur={() => setBulle(null)}
    >
      {children}
      {bulle && (
        <div
          className={styles.bulle}
          style={{ left: bulle.x, top: bulle.y, '--fleche': `${bulle.fleche}px` } as CSSProperties}
          aria-hidden="true"
        >
          <strong>{bulle.nombre}</strong>
          <span>{bulle.jour}</span>
        </div>
      )}
    </div>
  )
}
