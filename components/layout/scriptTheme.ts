/*
 * Storage keys and the inline script that applies a visitor's saved choices
 * before the first paint: the light theme, and the creature (which sets the
 * site's accent). Kept apart from the client modules so the server layout can
 * import it.
 */

import { CLE_BESTIOLE } from '@/components/accueil/bestioles'

export const CLE_THEME = 'theme'

/** Runs inline in <head>, before anything is painted */
export const SCRIPT_THEME = `try{var d=document.documentElement;if(localStorage.getItem('${CLE_THEME}')==='light')d.dataset.theme='light';var b=localStorage.getItem('${CLE_BESTIOLE}');if(b&&/^(mousse|braise|guimauve)$/.test(b))d.dataset.bestiole=b}catch(e){}`
