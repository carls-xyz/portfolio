"use client"

import { useEffect, useRef, useState } from 'react'
import Sprite from '@/components/accueil/BestioleSprite'
import styles from './Ile.module.css'

/*
 * A small black island under the nav, after the iPhone's Dynamic Island: it
 * appears as a dot, stretches out to show a short message with the creature
 * beside it, holds it, then shrinks back and goes. Messages come from
 * annoncer() in annonces.ts. With reduced motion it just appears and disappears.
 */

type Phase = 'cachee' | 'point' | 'ouverte' | 'refermee'

export default function Ile() {
  const [texte, setTexte] = useState('')
  const [phase, setPhase] = useState<Phase>('cachee')
  const minuteurs = useRef<number[]>([])

  useEffect(() => {
    const vider = () => {
      minuteurs.current.forEach(window.clearTimeout)
      minuteurs.current = []
    }
    const plus = (fn: () => void, ms: number) => minuteurs.current.push(window.setTimeout(fn, ms))

    const surAnnonce = (e: Event) => {
      vider()
      setTexte((e as CustomEvent<string>).detail)
      setPhase('point')
      plus(() => setPhase('ouverte'), 140)
      plus(() => setPhase('refermee'), 2600)
      plus(() => setPhase('cachee'), 2950)
    }
    window.addEventListener('ile', surAnnonce)
    return () => {
      vider()
      window.removeEventListener('ile', surAnnonce)
    }
  }, [])

  return (
    <div className={styles.ile} data-phase={phase} aria-hidden="true">
      <svg viewBox="0 -10 12 11" className={styles.bestiole} shapeRendering="crispEdges">
        <Sprite regard={1} />
      </svg>
      <span className={styles.texte}>
        <span>{texte}</span>
      </span>
    </div>
  )
}
