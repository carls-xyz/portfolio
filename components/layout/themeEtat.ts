"use client"

import { useSyncExternalStore } from 'react'
import { CLE_THEME } from './scriptTheme'

/*
 * The site's theme: dark by default, light when the visitor picked it. The
 * choice lives in localStorage and on <html data-theme>, set before the first
 * paint by the script in the root layout (scriptTheme.ts), so there is no flash.
 */

function abonner(rappel: () => void) {
  window.addEventListener('theme', rappel)
  return () => window.removeEventListener('theme', rappel)
}
const lireClair = () => document.documentElement.dataset.theme === 'light'

/** True in the light theme; false on the server, where the dark default renders */
export function useThemeClair() {
  return useSyncExternalStore(abonner, lireClair, () => false)
}

export function appliquerTheme(clair: boolean) {
  if (clair) document.documentElement.dataset.theme = 'light'
  else delete document.documentElement.dataset.theme
  try {
    localStorage.setItem(CLE_THEME, clair ? 'light' : 'dark')
  } catch {}
  window.dispatchEvent(new Event('theme'))
}

/**
 * Applies a change of look with the new page growing in a circle from (x, y),
 * where View Transitions exist and motion is welcome; otherwise just applies it.
 * A skipped transition (e.g. a hidden tab) still applies it; only the circle is lost.
 */
export function transitionCercle(x: number, y: number, changer: () => void) {
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || calme) return changer()
  const rayon = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const racine = document.documentElement
  racine.dataset.transition = 'theme'
  const vt = document.startViewTransition(changer)
  vt.ready
    .then(() =>
      racine.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rayon}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => {})
  vt.finished.catch(() => {}).finally(() => delete racine.dataset.transition)
}
