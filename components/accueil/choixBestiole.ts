"use client"

import { useSyncExternalStore } from 'react'
import { CLE_BESTIOLE, type IdBestiole } from './bestioles'

/*
 * The visitor's creature: kept in localStorage and on <html data-bestiole>
 * (set before the first paint by the layout's script), which switches both
 * the creature's shape and the site's accent. Blue, the default, has no attribute.
 */

function abonner(rappel: () => void) {
  window.addEventListener('bestiole', rappel)
  return () => window.removeEventListener('bestiole', rappel)
}
const lire = () => (document.documentElement.dataset.bestiole as IdBestiole | undefined) ?? 'bleu'

/** The creature picked; blue on the server */
export function useBestiole() {
  return useSyncExternalStore(abonner, lire, () => 'bleu' as IdBestiole)
}

export function choisirBestiole(id: IdBestiole) {
  if (id === 'bleu') delete document.documentElement.dataset.bestiole
  else document.documentElement.dataset.bestiole = id
  try {
    localStorage.setItem(CLE_BESTIOLE, id)
  } catch {}
  window.dispatchEvent(new Event('bestiole'))
}
