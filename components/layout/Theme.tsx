"use client"

import type { MouseEvent } from 'react'
import { Moon, Sun } from 'lucide-react'
import { appliquerTheme, transitionCercle, useThemeClair } from './themeEtat'
import { annoncer } from './annonces'
import styles from './Header.module.css'

/**
 * Light / dark switch in the nav. Where View Transitions exist, the new theme
 * spreads from the button in a growing circle; otherwise, or with reduced
 * motion, it simply switches.
 */
export default function Theme() {
  const clair = useThemeClair()

  const basculer = (e: MouseEvent<HTMLButtonElement>) => {
    const suivant = !clair
    annoncer(suivant ? 'Thème clair' : 'Thème sombre')
    // The circle starts at the click (or the button's centre from the keyboard)
    const bouton = e.currentTarget.getBoundingClientRect()
    transitionCercle(
      e.clientX || bouton.left + bouton.width / 2,
      e.clientY || bouton.top + bouton.height / 2,
      () => appliquerTheme(suivant),
    )
  }

  return (
    <button
      type="button"
      className={styles.theme}
      onClick={basculer}
      aria-label={clair ? 'Passer en thème sombre' : 'Passer en thème clair'}
    >
      {clair ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
    </button>
  )
}
