/*
 * Storage keys and the inline script that applies a visitor's saved choices
 * before the first paint: the light theme, the creature (which sets the
 * site's accent) and the liquid glass tint. Kept apart from the client modules so the server layout can
 * import it.
 */

import { CLE_BESTIOLE } from '@/components/accueil/bestioles'

export const CLE_THEME = 'theme'
/** The liquid glass tint settings, { clair, sombre } from 0 to 1.5 */
export const CLE_VERRE = 'verre-reglages'

const borner = (v: unknown) => (typeof v === 'number' && v >= 0 && v <= 1.5 ? v : 1)

/** The saved glass settings, or the defaults */
export function lireReglagesVerre() {
  try {
    const r = JSON.parse(localStorage.getItem(CLE_VERRE) ?? '{}')
    return { clair: borner(r.clair), sombre: borner(r.sombre) }
  } catch {
    return { clair: 1, sombre: 1 }
  }
}

/** Runs inline in <head>, before anything is painted */
export const SCRIPT_THEME = `try{var d=document.documentElement;if(localStorage.getItem('${CLE_THEME}')==='light')d.dataset.theme='light';var b=localStorage.getItem('${CLE_BESTIOLE}');if(b&&/^(mousse|braise|guimauve)$/.test(b))d.dataset.bestiole=b;var v=JSON.parse(localStorage.getItem('${CLE_VERRE}')||'{}');['clair','sombre'].forEach(function(k){var x=v[k];if(typeof x==='number'&&x>=0&&x<=1.5)d.style.setProperty('--verre-reglage-'+k,String(x))})}catch(e){}`
