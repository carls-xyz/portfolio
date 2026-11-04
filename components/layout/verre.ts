"use client"

import { useEffect, type RefObject } from 'react'

/*
 * The liquid glass helper (tokens in globals.css). For a surface marked
 * data-verre it:
 * - reads what lies behind it on a 5 × 3 grid and sets data-encre (light or
 *   dark ink), --verre-densite and --verre-sat-garde, so the glass stays
 *   readable and does not get stained by a vivid background;
 * - on Chromium, adds the rim lens: an SVG displacement map that bends only a
 *   band along the edge, like a thick slab, split into red, green and blue
 *   passes, appended last to backdrop-filter.
 * The page behind is HTML, not an image, so "what lies behind" is the colour
 * of the elements under each point: an SVG shape's fill, or the nearest
 * opaque background going up the tree.
 */

type Options = {
  /** Add the rim lens (Chromium only, surfaces of 32 px and more) */
  lentille?: boolean
  /** Surfaces of one row share one ink decision */
  groupe?: string
  /** Remembers the last ink between visits */
  memoire?: string
  /** Sample again when the window scrolls (for fixed surfaces) */
  suitDefilement?: boolean
  /** Lowest density allowed: text-heavy panels need a denser tint to stay legible */
  densiteMin?: number
}

type Couleur = { r: number; g: number; b: number }
type Mesure = { lum: number; texture: number; chroma: number; clair: Couleur; sombre: Couleur }

/* ---------- Sampling what lies behind ---------- */

const rgbDe = (c: string) => {
  const m = c.match(/[\d.]+/g)?.map(Number)
  if (!m || m.length < 3) return null
  return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }
}

/** The colour seen at a point under the surface, ignoring the surface itself */
function couleurSous(x: number, y: number, surface: Element) {
  // Neither the surface, nor what it contains, nor its own wrappers (a fixed header is transparent)
  const pile = document
    .elementsFromPoint(x, y)
    .filter(e => !surface.contains(e) && !e.contains(surface) && !e.closest('[data-verre]'))
  for (const e of pile) {
    // An SVG shape (project covers, the globe, the pixel scenes) shows its fill
    if (e instanceof SVGGraphicsElement && !(e instanceof SVGSVGElement)) {
      const f = rgbDe(getComputedStyle(e).fill)
      if (f && f.a > 0.5) return f
      continue
    }
    for (let n: Element | null = e; n; n = n.parentElement) {
      const c = rgbDe(getComputedStyle(n).backgroundColor)
      if (c && c.a > 0.5) return c
    }
  }
  return rgbDe(getComputedStyle(document.body).backgroundColor) ?? { r: 0, g: 0, b: 0, a: 1 }
}

/*
 * A 5 × 3 grid gives the average; the contrast check needs the extremes, and
 * a small bright shape under one letter slips between 5 columns, so the grid
 * is 9 × 3 (the average still drops the two darkest and two brightest).
 */
const COLONNES = 9

function mesurer(surface: Element): Mesure {
  const r = surface.getBoundingClientRect()
  const points: { lum: number; chroma: number; c: Couleur }[] = []
  for (let i = 0; i < COLONNES; i++)
    for (let j = 0; j < 3; j++) {
      const x = r.left + (r.width * (i + 0.5)) / COLONNES
      const y = r.top + (r.height * (j + 0.5)) / 3
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue
      const c = couleurSous(x, y, surface)
      points.push({
        lum: (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255,
        chroma: (Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)) / 255,
        c,
      })
    }
  const gris = { r: 128, g: 128, b: 128 }
  if (!points.length) return { lum: 0.5, texture: 0, chroma: 0, clair: gris, sombre: gris }
  // Drop the two darkest and the two brightest, average the rest
  const tries = [...points].sort((a, b) => a.lum - b.lum)
  const milieu = tries.length > 6 ? tries.slice(2, -2) : tries
  const moyenne = (k: 'lum' | 'chroma') => milieu.reduce((s, p) => s + p[k], 0) / milieu.length
  // For the contrast check, what matters is what lies behind the text: sample along each line of it
  const sousTexte: { lum: number; c: Couleur }[] = []
  surface.querySelectorAll('a, span, strong, p, label, h2').forEach(t => {
    if (![...t.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim())) return
    const b = t.getBoundingClientRect()
    if (!b.width) return
    for (const f of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      const c = couleurSous(b.left + b.width * f, b.top + b.height / 2, surface)
      sousTexte.push({ lum: (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255, c })
    }
  })
  const extremes = (sousTexte.length ? sousTexte : tries).sort((a, b) => a.lum - b.lum)

  return {
    lum: moyenne('lum'),
    texture: tries[tries.length - 1].lum - tries[0].lum,
    chroma: moyenne('chroma'),
    // The two extremes behind the text, for the contrast check: the worst case for light ink and for dark ink
    clair: extremes[extremes.length - 1].c,
    sombre: extremes[0].c,
  }
}

/* ---------- Deciding the ink and the density ---------- */

/* The glass states as in globals.css: tint, its thin and dense alpha, and the ink drawn on it */
const ETATS = {
  sombre: { teinte: [20, 20, 24], min: 0.16, max: 0.38, encre: [255, 255, 255, 0.94] },
  clair: { teinte: [255, 255, 255], min: 0.06, max: 0.22, encre: [0, 0, 0, 0.86] },
  clairSurSombre: { teinte: [16, 18, 22], min: 0.1, max: 0.3, encre: [255, 255, 255, 0.94] },
}

const lumRel = ([r, g, b]: number[]) => {
  const l = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b)
}

/** Contrast of the ink over the glass laid on a given background colour, at a given density */
function contraste(etat: (typeof ETATS)[keyof typeof ETATS], fond: Couleur, densite: number, k: number) {
  const a = Math.min(1, (etat.min + (etat.max - etat.min) * densite) * k)
  const verre = [fond.r, fond.g, fond.b].map((v, i) => etat.teinte[i] * a + v * (1 - a))
  const [er, eg, eb, ea] = etat.encre
  const texte = [er, eg, eb].map((v, i) => v * ea + verre[i] * (1 - ea))
  const [l1, l2] = [lumRel(texte), lumRel(verre)]
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

const groupes = new Map<string, Set<HTMLElement>>()
const derniereEncre = new WeakMap<HTMLElement, 'claire' | 'sombre'>()

/* Aim a little above 4.5:1: a thin bright shape can slip between the grid's points */
const CIBLE = 5
/* Up to three times the designed density: a surface straddling white page and black covers needs it */
const DENSITE_MAX = 3

type Encre = 'claire' | 'sombre'

/** The lowest density (up to DENSITE_MAX) at which this ink reaches the target over the worst point behind */
function densiteRequise(etat: (typeof ETATS)[keyof typeof ETATS], pire: Couleur, k: number) {
  for (let d = 0; d <= DENSITE_MAX; d += 0.05) if (contraste(etat, pire, d, k) >= CIBLE) return d
  return null
}

function appliquer(membres: HTMLElement[], memoire?: string, densiteMin = 0) {
  const mesures = membres.map(mesurer)
  const lum = mesures.reduce((s, m) => s + m.lum, 0) / mesures.length
  const clair = document.documentElement.dataset.theme === 'light'
  const k = parseFloat(getComputedStyle(membres[0]).getPropertyValue('--verre-k')) || 1
  const etatDe = (e: Encre) => (!clair ? ETATS.sombre : e === 'claire' ? ETATS.clairSurSombre : ETATS.clair)
  // What each ink needs, for every surface of the group: dark ink fears the darkest point, light ink the brightest
  const besoins = (e: Encre) => mesures.map(m => densiteRequise(etatDe(e), e === 'claire' ? m.clair : m.sombre, k))

  // Dark theme: always light ink. Light theme: light ink under 0.5, with ±0.05 of hysteresis...
  const avant = derniereEncre.get(membres[0])
  let encre: Encre = 'claire'
  if (clair) {
    if (avant === 'claire') encre = lum < 0.55 ? 'claire' : 'sombre'
    else if (avant === 'sombre') encre = lum < 0.45 ? 'claire' : 'sombre'
    else encre = lum < 0.5 ? 'claire' : 'sombre'
    // ...unless that ink cannot stay readable over everything behind while the other one can
    const autre: Encre = encre === 'claire' ? 'sombre' : 'claire'
    if (besoins(encre).some(b => b === null) && besoins(autre).every(b => b !== null)) encre = autre
  }
  const lumEncre = encre === 'claire' ? 0.95 : 0.1
  const requis = besoins(encre)

  membres.forEach((el, i) => {
    const m = mesures[i]
    const proche = 1 - Math.abs(m.lum - lumEncre)
    // The designed density, raised if the text needs a thicker glass to stay readable (never a stronger ink)
    const densite = Math.min(
      DENSITE_MAX,
      Math.max(densiteMin, Math.min(1, 0.55 * proche + 0.7 * m.texture + 0.3 * m.chroma), requis[i] ?? DENSITE_MAX),
    )
    el.dataset.encre = encre
    el.style.setProperty('--verre-densite', densite.toFixed(3))
    el.style.setProperty('--verre-sat-garde', Math.max(0.45, 1 - 0.75 * m.chroma).toFixed(3))
    derniereEncre.set(el, encre)
  })
  if (memoire)
    try {
      localStorage.setItem(`verre-encre-${memoire}`, encre)
    } catch {}
}

/* ---------- The rim lens ---------- */

const lentillePossible = () =>
  typeof CSS !== 'undefined' &&
  CSS.supports('backdrop-filter', 'url(#a)') &&
  // Firefox parses url() in backdrop-filter but draws nothing; Safari does not draw it either
  /Chrom(e|ium)\//.test(navigator.userAgent) &&
  !/Firefox\//.test(navigator.userAgent)

const cartes = new Map<string, Promise<string>>()

/**
 * Displacement map for a rounded rectangle: red is the sideways bend, green the
 * vertical one, 128 none. Only a rim bends: a point d from the edge looks
 * inward by 1.1 × rim × (1 − d / rim)^2.6.
 */
function carte(l: number, h: number, rayon: number, rim: number): Promise<string> {
  const cle = `${l}×${h}×${rayon}×${rim}`
  const deja = cartes.get(cle)
  if (deja) return deja
  const promesse = (async () => {
    const toile = document.createElement('canvas')
    toile.width = l
    toile.height = h
    const ctx = toile.getContext('2d')!
    const img = ctx.createImageData(l, h)
    const max = 1.1 * rim
    const echelle = 2 * max
    const r = Math.min(rayon, l / 2, h / 2)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < l; x++) {
        const px = x + 0.5 - l / 2
        const py = y + 0.5 - h / 2
        const ax = Math.abs(px)
        const ay = Math.abs(py)
        const qx = ax - (l / 2 - r)
        const qy = ay - (h / 2 - r)
        let d: number
        let nx: number
        let ny: number
        if (qx > 0 && qy > 0) {
          // In a corner: distance to the arc, normal along the radius
          const lon = Math.hypot(qx, qy) || 1
          d = r - lon
          nx = qx / lon
          ny = qy / lon
        } else if (l / 2 - ax < h / 2 - ay) {
          d = l / 2 - ax
          nx = 1
          ny = 0
        } else {
          d = h / 2 - ay
          nx = 0
          ny = 1
        }
        nx *= Math.sign(px) || 1
        ny *= Math.sign(py) || 1
        let rouge = 128
        let vert = 128
        if (d >= 0 && d < rim) {
          const decalage = max * Math.pow(1 - d / rim, 2.6)
          // Look inward: sample the point moved towards the centre
          rouge = 128 + (-nx * decalage * 255) / echelle
          vert = 128 + (-ny * decalage * 255) / echelle
        }
        const i = (y * l + x) * 4
        img.data[i] = Math.round(Math.min(255, Math.max(0, rouge)))
        img.data[i + 1] = Math.round(Math.min(255, Math.max(0, vert)))
        img.data[i + 2] = 128
        img.data[i + 3] = 255
      }
    ctx.putImageData(img, 0, 0)
    const url = toile.toDataURL('image/png')
    // The filter must not point at the map before it has decoded, or it draws without blur
    const image = new Image()
    image.src = url
    await image.decode()
    return url
  })()
  cartes.set(cle, promesse)
  return promesse
}

let compteur = 0

/** One SVG filter per surface, in its own <svg>: three displacement passes, red bent 15 % more and blue 15 % less */
function filtre(id: string, url: string, l: number, h: number, rim: number) {
  const echelle = 2 * 1.1 * rim
  let svg = document.getElementById(`${id}-svg`) as SVGSVGElement | null
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = `${id}-svg`
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    document.body.append(svg)
  }
  const passe = (couleur: string, facteur: number, matrice: string) => `
    <feDisplacementMap in="SourceGraphic" in2="carte" scale="${(echelle * facteur).toFixed(2)}"
      xChannelSelector="R" yChannelSelector="G" result="d${couleur}"/>
    <feColorMatrix in="d${couleur}" type="matrix" values="${matrice}" result="${couleur}"/>`
  svg.innerHTML = `
    <filter id="${id}" x="0" y="0" width="${l}" height="${h}" filterUnits="userSpaceOnUse"
      primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${url}" x="0" y="0" width="${l}" height="${h}" preserveAspectRatio="none" result="carte"/>
      ${passe('r', 1.15, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0')}
      ${passe('g', 1, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0')}
      ${passe('b', 0.85, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0')}
      <feBlend in="r" in2="g" mode="screen" result="rg"/>
      <feBlend in="rg" in2="b" mode="screen"/>
    </filter>`
}

async function poserLentille(el: HTMLElement, id: string) {
  const l = Math.round(el.offsetWidth)
  const h = Math.round(el.offsetHeight)
  if (Math.min(l, h) < 32) return el.style.removeProperty('--verre-lentille')
  const rayon = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
  const rim = Math.max(4, Math.round(Math.min(44, Math.min(l, h) / 3.5)))
  const url = await carte(l, h, rayon, rim)
  filtre(id, url, l, h, rim)
  el.style.setProperty('--verre-lentille', `url(#${id})`)
}

/* ---------- The hook ---------- */

export function useVerre(
  ref: RefObject<HTMLElement | null>,
  { lentille, groupe, memoire, suitDefilement, densiteMin }: Options = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.dataset.verre = '' // already in the markup, so the glass is there before this runs

    // The ink of the last visit, so the page opens in it
    if (memoire)
      try {
        const vue = localStorage.getItem(`verre-encre-${memoire}`)
        if (vue === 'claire' || vue === 'sombre') {
          el.dataset.encre = vue
          derniereEncre.set(el, vue)
        }
      } catch {}

    const cle = groupe ?? `seul-${++compteur}`
    const membres = groupes.get(cle) ?? new Set<HTMLElement>()
    membres.add(el)
    groupes.set(cle, membres)

    let image = 0
    const echantillonner = () => {
      if (image) return
      image = requestAnimationFrame(() => {
        image = 0
        appliquer([...membres].filter(m => m.isConnected), memoire, densiteMin)
      })
    }

    const id = `verre-${++compteur}`
    const avecLentille = lentille && lentillePossible()
    let taille = ''
    const ro = new ResizeObserver(() => {
      echantillonner()
      const t = `${el.offsetWidth}×${el.offsetHeight}`
      if (avecLentille && t !== taille) {
        taille = t
        poserLentille(el, id)
      }
    })
    ro.observe(el)

    // Sample again when the theme, the creature (accent), the layout or the scroll changes
    const evenements = ['theme', 'bestiole', 'widgets', 'dossier', 'resize']
    evenements.forEach(n => window.addEventListener(n, echantillonner))
    if (suitDefilement) window.addEventListener('scroll', echantillonner, { passive: true })
    echantillonner()
    const premier = window.setTimeout(echantillonner, 400) // again after the entrance and fonts

    return () => {
      ro.disconnect()
      cancelAnimationFrame(image)
      window.clearTimeout(premier)
      evenements.forEach(n => window.removeEventListener(n, echantillonner))
      window.removeEventListener('scroll', echantillonner)
      membres.delete(el)
      document.getElementById(`${id}-svg`)?.remove()
      el.style.removeProperty('--verre-lentille')
    }
  }, [ref, lentille, groupe, memoire, suitDefilement, densiteMin])
}
