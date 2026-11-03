/*
 * A tiny channel to tell the creature what to do from elsewhere on the site
 * (the ⌘K palette's hidden commands). If it is not on screen yet, the order
 * waits until its desk mounts, e.g. after navigating to the home page.
 */

export type Ordre = 'cafe' | 'dodo' | 'saut'

let ecouteur: ((ordre: Ordre) => void) | null = null
let enAttente: Ordre | null = null

export function envoyerOrdre(ordre: Ordre) {
  if (ecouteur) ecouteur(ordre)
  else enAttente = ordre
}

export function ecouterOrdres(fn: (ordre: Ordre) => void) {
  ecouteur = fn
  // Delivered a tick later, to whoever listens by then (React may mount twice in development)
  if (enAttente)
    window.setTimeout(() => {
      if (!ecouteur || !enAttente) return
      const ordre = enAttente
      enAttente = null
      ecouteur(ordre)
    }, 0)
  return () => {
    if (ecouteur === fn) ecouteur = null
  }
}
