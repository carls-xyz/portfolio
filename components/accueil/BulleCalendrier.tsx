"use client"

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import { useVerre } from '@/components/layout/verre'
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
  // The day reached from the keyboard, if that is how the bubble opened
  const auClavier = useRef<Element | null>(null)


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

  /*
   * Any scroll (the page, or the calendar sideways) moves the day away from the
   * bubble. Under the mouse, the bubble closes; from the keyboard it follows the
   * day, since focusing a day can itself scroll the page to show it.
   */
  useEffect(() => {
    if (!bulle) return
    const suivre = () => (auClavier.current ? montrer(auClavier.current) : setBulle(null))
    const fermer = () => setBulle(null)
    window.addEventListener('scroll', suivre, { capture: true, passive: true })
    window.addEventListener('widgets', fermer)
    return () => {
      window.removeEventListener('scroll', suivre, { capture: true })
      window.removeEventListener('widgets', fermer)
    }
  })

  return (
    <div
      ref={zone}
      className={styles.zoneBulle}
      onPointerOver={(e: PointerEvent) => {
        auClavier.current = null
        montrer(e.target)
      }}
      onPointerLeave={() => setBulle(null)}
      onFocus={(e: FocusEvent) => {
        auClavier.current = e.target
        montrer(e.target)
      }}
      onBlur={() => {
        auClavier.current = null
        setBulle(null)
      }}
    >
      {children}
      {bulle && <Bulle {...bulle} />}
    </div>
  )
}

/** The bubble itself, in liquid glass over the calendar's squares (no rim lens: small and animated) */
function Bulle({ nombre, jour, x, y, fleche }: Bulle) {
  const ref = useRef<HTMLDivElement>(null)
  useVerre(ref, { densiteMin: 1 })
  return (
    <div
      ref={ref}
      className={styles.bulle}
      style={{ left: x, top: y, '--fleche': `${fleche}px` } as CSSProperties}
      aria-hidden="true"
      data-verre=""
    >
      <strong>{nombre}</strong>
      <span>{jour}</span>
    </div>
  )
}
