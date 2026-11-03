"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react'
import styles from './IciEtMaintenant.module.css'

/*
 * Where I am, and what time it is there. The globe is a sphere of dots lit by
 * the real sun (each dot's brightness follows the sun's height above it, so
 * twilight is a gradient). Drag it, or use the arrow keys, to turn it; the
 * clock ticks every second. Nothing turns on its own.
 */

const PARIS = { nom: 'Paris', pays: 'France', lat: 48.8566, lon: 2.3522, fuseau: 'Europe/Paris' }

const TAILLE = 240
const RAYON = 114
const N_POINTS = 1600
// Default view: a little south of Paris, so its dot sits in the upper part of the globe
const VUE_DEPART = { lat: 30, lon: PARIS.lon }

type Vue = { lat: number; lon: number }

const rad = (d: number) => (d * Math.PI) / 180
// Rounded: Node and browsers disagree on the last float digit, which would break hydration
const arrondi = (n: number, p = 100) => Math.round(n * p) / p
const borner = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const modulo360 = (n: number) => ((((n + 180) % 360) + 360) % 360) - 180

function versVecteur(lat: number, lon: number) {
  const φ = rad(lat)
  const λ = rad(lon)
  return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)] as const
}

/** Orthographic projection centred on the view; null for points on the far side. */
function projeter(lat: number, lon: number, vue: Vue) {
  const φ = rad(lat)
  const λ = rad(lon - vue.lon)
  const φ0 = rad(vue.lat)
  const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ)
  if (cosc < 0) return null
  const x = Math.cos(φ) * Math.sin(λ)
  const y = Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ)
  return { x: arrondi(TAILLE / 2 + RAYON * x), y: arrondi(TAILLE / 2 - RAYON * y), profondeur: cosc }
}

/** Point on Earth where the sun is overhead (precise to about a degree). */
function pointSubsolaire(date: Date) {
  const debutAnnee = Date.UTC(date.getUTCFullYear(), 0, 0)
  const jour = (date.getTime() - debutAnnee) / 86400000
  const declinaison = -23.44 * Math.cos(rad((360 / 365) * (jour + 10)))
  const heuresUTC = date.getUTCHours() + date.getUTCMinutes() / 60
  return { lat: declinaison, lon: -15 * (heuresUTC - 12) }
}

/** Sun height above a place: 1 overhead, 0 on the horizon, negative below */
function hauteurSoleil(lat: number, lon: number, date: Date) {
  const s = pointSubsolaire(date)
  const a = versVecteur(lat, lon)
  const b = versVecteur(s.lat, s.lon)
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

const lisser = (a: number, b: number, x: number) => {
  const t = borner((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Evenly spread points on the sphere (Fibonacci lattice) */
const POINTS = Array.from({ length: N_POINTS }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / N_POINTS
  const theta = Math.PI * (1 + Math.sqrt(5)) * i
  const lat = (Math.asin(y) * 180) / Math.PI
  const lon = modulo360((theta * 180) / Math.PI)
  return { lat, lon, v: versVecteur(lat, lon) }
})

function partie(date: Date, options: Intl.DateTimeFormatOptions, type: Intl.DateTimeFormatPartTypes) {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS.fuseau, ...options }).formatToParts(date).find(p => p.type === type)?.value ?? ''
}

/** What the sun is doing in Paris right now */
function momentSoleil(date: Date) {
  const h = hauteurSoleil(PARIS.lat, PARIS.lon, date)
  if (h > 0.05) return 'En journée'
  if (h > -0.1) return 'Au crépuscule'
  const heure = Number(partie(date, { hour: 'numeric', hourCycle: 'h23' }, 'hour'))
  return heure >= 17 && heure < 23 ? 'En soirée' : 'La nuit'
}

/* ---------- The globe ---------- */

type GlobeProps = { vue: Vue; minute: number | null; entree: boolean }

/** Redraws when the view turns or the minute changes, never with the clock's seconds */
const Globe = memo(function Globe({ vue, minute, entree }: GlobeProps) {
  // Light depends only on the minute: computed once per minute for every dot
  const lumieres = useMemo(() => {
    const sub = minute === null ? null : pointSubsolaire(new Date(minute * 60000))
    const soleil = sub ? versVecteur(sub.lat, sub.lon) : null
    return POINTS.map(p => {
      const hauteur = soleil ? p.v[0] * soleil[0] + p.v[1] * soleil[1] + p.v[2] * soleil[2] : 0.4
      return lisser(-0.12, 0.45, hauteur)
    })
  }, [minute])

  const points = POINTS.flatMap((p, i) => {
    const pos = projeter(p.lat, p.lon, vue)
    if (!pos) return []
    const lumiere = lumieres[i]
    // The edge of the sphere darkens, as on a real one; a night floor keeps it readable
    const bord = 0.35 + 0.65 * Math.pow(pos.profondeur, 0.6)
    // Lit dots pale towards white; the hue is the site's accent (it follows the chosen creature)
    const clarte = Math.round(lumiere * lumiere * 70)
    return [
      <circle
        key={i}
        className={styles.point}
        cx={pos.x}
        cy={pos.y}
        r={arrondi(0.45 + pos.profondeur * 1.05)}
        style={{
          ['--x' as string]: arrondi(pos.x / TAILLE),
          fill: `color-mix(in srgb, rgb(var(--accent)), #fff ${clarte}%)`,
        }}
        fillOpacity={arrondi((0.2 + 0.75 * lumiere) * bord)}
      />,
    ]
  })

  // Paris goes behind the globe when it is turned far enough
  const paris = projeter(PARIS.lat, PARIS.lon, vue)

  return (
    <svg className={`${styles.globe} ${entree ? styles.entree : ''}`} viewBox={`0 0 ${TAILLE} ${TAILLE}`} aria-hidden="true">
      <circle cx={TAILLE / 2} cy={TAILLE / 2} r={RAYON + 3} className={styles.contour} />
      {points}
      {paris && (
        <>
          <circle cx={paris.x} cy={paris.y} r={8} className={styles.anneau} />
          <circle cx={paris.x} cy={paris.y} r={4} className={styles.paris} />
        </>
      )}
    </svg>
  )
})

/* ---------- Clock store ---------- */

function abonner(rappel: () => void) {
  const id = window.setInterval(rappel, 1000)
  return () => window.clearInterval(id)
}
const seconde = () => Math.floor(Date.now() / 1000)
const surServeur = () => null

const mouvementReduit = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Widget ---------- */

export default function IciEtMaintenant() {
  // null until mounted: the server never renders a time that would be stale on arrival
  const s = useSyncExternalStore(abonner, seconde, surServeur)
  const maintenant = s === null ? null : new Date(s * 1000)
  const minute = s === null ? null : Math.floor(s / 60)

  const [vue, setVue] = useState<Vue>(VUE_DEPART)
  const [entree, setEntree] = useState(true)
  const animation = useRef(0)
  // Latest view, read by animations without re-subscribing
  const vueActuelle = useRef(vue)
  useEffect(() => {
    vueActuelle.current = vue
  }, [vue])
  const glisse = useRef<{ x: number; y: number; vue: Vue; bouge: boolean } | null>(null)
  // Pointer events can outpace the screen: keep only the latest view and apply it once per frame
  const enAttente = useRef<Vue | null>(null)
  const image = useRef(0)

  // The west-to-east fill only plays on arrival, not when dots come round while turning
  useEffect(() => {
    const t = window.setTimeout(() => setEntree(false), 1600)
    return () => window.clearTimeout(t)
  }, [])

  const tourner = useCallback((cible: Vue) => {
    cancelAnimationFrame(animation.current)
    if (mouvementReduit()) {
      setVue(cible)
      return
    }
    // Ease the view to the target over 700 ms, taking the short way round
    const depart = vueActuelle.current
    const dLon = modulo360(cible.lon - depart.lon)
    const dLat = cible.lat - depart.lat
    const t0 = performance.now()
    const pas = (t: number) => {
      const k = borner((t - t0) / 700, 0, 1)
      const e = 1 - Math.pow(1 - k, 3)
      setVue({ lat: depart.lat + dLat * e, lon: modulo360(depart.lon + dLon * e) })
      if (k < 1) animation.current = requestAnimationFrame(pas)
    }
    animation.current = requestAnimationFrame(pas)
  }, [])

  /* Drag to turn. Touch: only horizontal drags turn the globe, vertical ones scroll the page. */
  const surAppui = (e: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(animation.current)
    glisse.current = { x: e.clientX, y: e.clientY, vue, bouge: false }
  }
  const surMouvement = (e: PointerEvent<HTMLDivElement>) => {
    const g = glisse.current
    if (!g) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    if (!g.bouge && Math.hypot(dx, dy) < 4) return
    if (!g.bouge) {
      g.bouge = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const degresParPixel = 180 / (e.currentTarget.clientWidth || 168)
    enAttente.current = {
      lon: modulo360(g.vue.lon - dx * degresParPixel),
      lat: e.pointerType === 'touch' ? g.vue.lat : borner(g.vue.lat + dy * degresParPixel, -60, 60),
    }
    if (!image.current) {
      image.current = requestAnimationFrame(() => {
        image.current = 0
        if (enAttente.current) setVue(enAttente.current)
      })
    }
  }
  const surRelache = () => {
    glisse.current = null
  }

  const surTouche = (e: KeyboardEvent<HTMLDivElement>) => {
    const pas = 15
    const cible = {
      ArrowLeft: { lat: vue.lat, lon: vue.lon - pas },
      ArrowRight: { lat: vue.lat, lon: vue.lon + pas },
      ArrowUp: { lat: borner(vue.lat + pas, -60, 60), lon: vue.lon },
      ArrowDown: { lat: borner(vue.lat - pas, -60, 60), lon: vue.lon },
    }[e.key]
    if (!cible) return
    e.preventDefault()
    tourner({ lat: cible.lat, lon: modulo360(cible.lon) })
  }

  useEffect(
    () => () => {
      cancelAnimationFrame(animation.current)
      cancelAnimationFrame(image.current)
    },
    [],
  )

  const horsDepart = Math.abs(modulo360(vue.lon - VUE_DEPART.lon)) > 1 || Math.abs(vue.lat - VUE_DEPART.lat) > 1

  const heure = maintenant
    ? new Intl.DateTimeFormat('fr-FR', { timeZone: PARIS.fuseau, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(maintenant)
    : '--:--:--'

  return (
    <section className={styles.carte} aria-label="Où je suis et l'heure qu'il y est">
      <div
        className={styles.scene}
        tabIndex={0}
        role="group"
        aria-label="Globe : faites-le tourner en le glissant ou avec les flèches du clavier"
        onPointerDown={surAppui}
        onPointerMove={surMouvement}
        onPointerUp={surRelache}
        onPointerCancel={surRelache}
        onKeyDown={surTouche}
      >
        <Globe vue={vue} minute={minute} entree={entree} />
      </div>

      <div className={styles.infos}>
        <p className={styles.lieu}>
          {PARIS.nom}, {PARIS.pays}
        </p>
        <p className={styles.heure}>
          <time dateTime={maintenant?.toISOString()}>{heure}</time>
        </p>
        <p className={styles.statut}>
          {maintenant
            ? `${momentSoleil(maintenant)} · ${partie(maintenant, { timeZoneName: 'shortOffset' }, 'timeZoneName').replace('GMT', 'UTC')}`
            : ' '}
        </p>

        {horsDepart && (
          <button type="button" className={styles.retour} onClick={() => tourner(VUE_DEPART)}>
            Revenir à Paris
          </button>
        )}
      </div>
    </section>
  )
}
