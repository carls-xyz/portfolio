"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from 'react'
import Sprite, { Ligne } from './BestioleSprite'
import { ECRANS } from './glyphes'
import { ecouterOrdres, envoyerOrdre } from './bestioleOrdres'
import { transitionCercle, useThemeClair } from '@/components/layout/themeEtat'
import { annoncer } from '@/components/layout/annonces'
import { BESTIOLES, type Bestiole as Creature } from './bestioles'
import { choisirBestiole, useBestiole } from './choixBestiole'
import type { Ecoute } from '@/app/api/ecoute/route'
import styles from './Bestiole.module.css'

/*
 * A little pixel creature at work. It goes from its laptop (code scrolls while
 * it types) to the coffee corner and back, strolls, looks around and hops,
 * always busy with something; at night in Paris it falls asleep at its desk.
 * Its window shows the real weather in Paris, it looks up and shows a project
 * on its screen when one is hovered in the strip above, wears a hat in
 * December and keeps a pumpkin around Halloween. In the light theme it is
 * broad daylight whatever the hour: it stays awake, in sunglasses. While
 * Charles is listening to music (Last.fm, /api/ecoute), it wears headphones,
 * nods along, little notes float up, and the track is named under the scene.
 * Under the scene, four faint little heads let the visitor swap the creature
 * for another one, which also repaints the site's accent in its colour. Click it and it jumps; the
 * ⌘K palette has a few hidden orders for it. Nothing moves when the system
 * asks for reduced motion, and it pauses while off screen. 64 × 48 pixels.
 */

type Action = 'marche' | 'code' | 'cafe' | 'regarde' | 'saut' | 'dort'
type Meteo = 'clair' | 'nuages' | 'brume' | 'pluie' | 'neige' | 'orage'

/* Raindrops or snowflakes, repeated every 4 px so the falling loop is seamless */
const GOUTTES = [26, 29, 33, 36, 38].flatMap((x, i) => [0, 4, 8].map(d => ({ x, y: 5 + ((i * 3) % 4) + d })))

/** Open-Meteo WMO weather code → what the window shows */
const lireMeteo = (code: number): Meteo =>
  code <= 1
    ? 'clair'
    : code <= 3
      ? 'nuages'
      : code <= 48
        ? 'brume'
        : (code >= 71 && code <= 77) || code === 85 || code === 86
          ? 'neige'
          : code >= 95
            ? 'orage'
            : 'pluie'
const METEO_PARIS =
  'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=weather_code&timezone=Europe%2FParis'

/** A plain pixel rectangle for the scenery */
const R = ({ x, y, w = 1, h = 1, c }: { x: number; y: number; w?: number; h?: number; c: string }) => (
  // style rather than the fill attribute, so the accent's CSS variables work
  <rect x={x} y={y} width={w} height={h} style={{ fill: c }} />
)

/* The site's accent (set by the chosen creature), for the screen, notes and rain */
const ACCENT = 'rgb(var(--accent))'
const ACCENT_CLAIR = 'rgb(var(--accent-clair))'

/* Paris hour, month and day as "h|m|d", refreshed every minute; null on the server */
function abonner(rappel: () => void) {
  const id = window.setInterval(rappel, 60000)
  return () => window.clearInterval(id)
}
const momentParis = () => {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const valeur = (type: string) => parts.find(p => p.type === type)?.value
  return `${valeur('hour')}|${valeur('month')}|${valeur('day')}`
}
const surServeur = () => null

const entre = (min: number, max: number) => min + Math.random() * (max - min)
const SOL = 45 // feet row; the ground line is at 46
const POSTE_CODE = 30 // in front of the laptop
const POSTE_CAFE = 15 // next to the coffee table
const MS_PAR_PIXEL = 80 // walking speed

export default function Bestiole() {
  const moment = useSyncExternalStore(abonner, momentParis, surServeur)
  const [heure, mois, jour] = moment ? moment.split('|').map(Number) : [null, null, null]
  const clair = useThemeClair()
  // Asleep from 23 h to 7 h; the window turns dark from 18 h
  const nuit = !clair && heure !== null && (heure >= 23 || heure < 7)
  const ciel = clair || heure === null || (heure >= 7 && heure < 18) ? 'jour' : 'nuit'
  const decembre = mois === 12
  const halloween = mois === 10 && jour !== null && jour >= 24

  const [action, setAction] = useState<Action>('code')
  const [x, setX] = useState(POSTE_CODE)
  const [duree, setDuree] = useState(0) // ms for the current walk
  const [versLaGauche, setVersLaGauche] = useState(false)
  const [regard, setRegard] = useState(0) // pupils: -1 back, 0 forward, 1 up
  const [cligne, setCligne] = useState(false)
  const [meteo, setMeteo] = useState<Meteo | null>(null)
  const [ecran, setEcran] = useState<string | null>(null) // hovered project's slug
  const [ecoute, setEcoute] = useState<Ecoute>({ enCours: false })
  const scene = useRef<HTMLButtonElement>(null)
  const visible = useRef(true)
  const minuteur = useRef(0)
  const xActuel = useRef(x)

  // Pause its life while off screen
  useEffect(() => {
    const el = scene.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The real weather in Paris, every 15 minutes; a failed request keeps a clear sky
  useEffect(() => {
    let actif = true
    const lire = () =>
      fetch(METEO_PARIS)
        .then(r => (r.ok ? r.json() : null))
        .then(d => {
          const code = d?.current?.weather_code
          if (actif && typeof code === 'number') setMeteo(lireMeteo(code))
        })
        .catch(() => {})
    lire()
    const id = window.setInterval(lire, 15 * 60000)
    return () => {
      actif = false
      window.clearInterval(id)
    }
  }, [])

  // What is playing, asked every 30 s while the page is open and visible
  useEffect(() => {
    let actif = true
    const lire = () => {
      if (document.hidden) return
      fetch('/api/ecoute')
        .then(r => (r.ok ? r.json() : null))
        .then((d: Ecoute | null) => actif && d && setEcoute(d))
        .catch(() => {})
    }
    lire()
    const id = window.setInterval(lire, 30000)
    return () => {
      actif = false
      window.clearInterval(id)
    }
  }, [])

  // A project hovered or focused in the strip: it looks up and shows it on its screen
  useEffect(() => {
    let t = 0
    const projet = (e: Event) => (e.target instanceof Element ? e.target.closest('[data-projet]') : null)
    const dessus = (e: Event) => {
      const el = projet(e)
      if (!el) return
      window.clearTimeout(t)
      setEcran(el.getAttribute('data-projet'))
    }
    const parti = (e: Event) => {
      if (!projet(e)) return
      window.clearTimeout(t)
      t = window.setTimeout(() => setEcran(null), 1500)
    }
    document.addEventListener('pointerover', dessus)
    document.addEventListener('focusin', dessus)
    document.addEventListener('pointerout', parti)
    document.addEventListener('focusout', parti)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('pointerover', dessus)
      document.removeEventListener('focusin', dessus)
      document.removeEventListener('pointerout', parti)
      document.removeEventListener('focusout', parti)
    }
  }, [])

  // Its day: always on to the next thing, with only short breaks
  useEffect(() => {
    // With reduced motion it stays still at its laptop, and orders only change its pose
    const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let actif = true
    const plus = (fn: () => void, ms: number) => {
      window.clearTimeout(minuteur.current)
      minuteur.current = window.setTimeout(() => actif && fn(), ms)
    }

    /** Walk to a spot (or appear there, with reduced motion), then carry on with `ensuite` */
    const aller = (cible: number, ensuite: () => void) => {
      const depuis = xActuel.current
      const t = calme ? 0 : Math.abs(cible - depuis) * MS_PAR_PIXEL
      setX(cible)
      xActuel.current = cible
      if (t === 0) return ensuite()
      setVersLaGauche(cible < depuis)
      setDuree(t)
      setAction('marche')
      plus(ensuite, t + 120)
    }

    const coder = () =>
      aller(POSTE_CODE, () => {
        setVersLaGauche(false)
        setRegard(0)
        setAction('code')
        if (!calme) plus(suivante, entre(3500, 6500))
      })
    const boire = (ms: number) =>
      aller(POSTE_CAFE, () => {
        setVersLaGauche(true)
        setAction('cafe')
        plus(suivante, ms)
      })
    const dormir = (ms: number) =>
      aller(POSTE_CODE, () => {
        setVersLaGauche(false)
        setAction('dort')
        plus(suivante, ms)
      })
    const flaner = () =>
      aller(Math.round(entre(17, 29)), () => {
        setAction('regarde')
        setRegard(-1)
        window.setTimeout(() => actif && setRegard(1), 500)
        window.setTimeout(() => actif && setRegard(0), 1000)
        plus(suivante, 1300)
      })
    const sauter = () => {
      setAction('saut')
      plus(suivante, 850)
    }

    function suivante() {
      if (calme) return coder()
      if (document.hidden || !visible.current) return plus(suivante, 1000)
      if (nuit) return dormir(10000)
      const tirage = Math.random()
      if (tirage < 0.4) coder()
      else if (tirage < 0.65) boire(entre(2200, 3500))
      else if (tirage < 0.82) flaner()
      else sauter()
    }

    // Start its day, unless an order is already waiting: that one goes first
    if (!calme) plus(suivante, 600)

    // Orders from the palette (and clicks): do it now, then life goes on
    const arreter = ecouterOrdres(ordre => {
      window.clearTimeout(minuteur.current)
      // Bring it into view first; after the scroll a page change may do
      window.setTimeout(
        () => scene.current?.scrollIntoView({ block: 'center', behavior: calme ? 'auto' : 'smooth' }),
        100,
      )
      if (ordre === 'cafe') boire(4000)
      else if (ordre === 'dodo') dormir(8000)
      else sauter()
    })

    return () => {
      actif = false
      arreter()
      window.clearTimeout(minuteur.current)
    }
  }, [nuit])

  // Blinks now and then while awake
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t = 0
    const boucle = () => {
      t = window.setTimeout(() => {
        setCligne(true)
        window.setTimeout(() => setCligne(false), 140)
        boucle()
      }, entre(2500, 6000))
    }
    boucle()
    return () => window.clearTimeout(t)
  }, [])

  const toucher = () => envoyerOrdre('saut')

  // Another creature: the site repaints in its colour from the button, then it hops in
  const choisie = useBestiole()
  const changer = (b: Creature) => (e: MouseEvent<HTMLButtonElement>) => {
    if (b.id === choisie) return
    const r = e.currentTarget.getBoundingClientRect()
    transitionCercle(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, () => choisirBestiole(b.id))
    envoyerOrdre('saut')
    annoncer(`${b.nom} prend le relais`)
  }

  const dort = action === 'dort'
  const code = action === 'code'
  const marche = action === 'marche'
  const glyphe = ecran ? ECRANS[ecran] : null
  const musique = ecoute.enCours && !dort

  // The window: a darker sky behind clouds, rain or snow
  const couvert = meteo === 'pluie' || meteo === 'neige' || meteo === 'orage'
  const fond = ciel === 'nuit' ? '#0f1621' : couvert ? '#3a4a58' : '#2f5878'
  const nuage = ciel === 'nuit' ? '#3a3f48' : '#9aa1ab'

  return (
    <section className={styles.carte} aria-label="Une petite bestiole au travail">
      <button ref={scene} type="button" className={styles.scene} onClick={toucher} aria-label="Faire sauter la bestiole">
        <svg viewBox="0 0 64 48" className={styles.svg} aria-hidden="true" shapeRendering="crispEdges">
          <defs>
            <clipPath id="bestiole-fenetre">
              <rect x={25} y={5} width={14} height={9} />
            </clipPath>
            <clipPath id="bestiole-ecran">
              <rect x={47} y={27} width={8} height={7} />
            </clipPath>
          </defs>

          {/* Window onto Paris: sun or moon, then the weather on top */}
          <R x={24} y={4} w={16} h={11} c="#2a2a30" />
          <g clipPath="url(#bestiole-fenetre)">
            <R x={25} y={5} w={14} h={9} c={fond} />
            {!couvert &&
              (ciel === 'nuit' ? (
                <>
                  <R x={35} y={6} w={3} h={3} c="#e6e6ea" />
                  <R x={36} y={6} w={2} h={2} c={fond} />
                  {meteo !== 'nuages' && (
                    <>
                      <R x={27} y={7} c="#8a8f98" />
                      <R x={29} y={11} c="#8a8f98" />
                    </>
                  )}
                </>
              ) : (
                <R x={34} y={7} w={3} h={3} c="#f2d58a" />
              ))}
            {meteo && meteo !== 'clair' && meteo !== 'brume' && (
              <>
                <R x={27} y={5} w={3} h={1} c={nuage} />
                <R x={26} y={6} w={5} h={2} c={nuage} />
                <R x={34} y={7} w={3} h={1} c={nuage} />
                <R x={33} y={8} w={5} h={2} c={nuage} />
              </>
            )}
            {meteo === 'brume' && (
              <>
                <R x={25} y={7} w={9} h={1} c="#5a6270" />
                <R x={29} y={10} w={10} h={1} c="#5a6270" />
                <R x={25} y={12} w={7} h={1} c="#5a6270" />
              </>
            )}
            {(meteo === 'pluie' || meteo === 'orage' || meteo === 'neige') && (
              <g className={meteo === 'neige' ? styles.neige : styles.pluie}>
                {GOUTTES.map(g => (
                  <R key={`${g.x}-${g.y}`} x={g.x} y={g.y - 8} c={meteo === 'neige' ? '#f2f4f7' : ACCENT_CLAIR} />
                ))}
              </g>
            )}
            {meteo === 'orage' && (
              <g className={styles.eclair}>
                <R x={30} y={9} w={2} h={1} c="#f2d58a" />
                <R x={29} y={10} w={2} h={1} c="#f2d58a" />
                <R x={30} y={11} w={1} h={2} c="#f2d58a" />
              </g>
            )}
          </g>
          <R x={31} y={5} w={1} h={9} c="#2a2a30" />

          {/* Floor */}
          <R x={0} y={46} w={64} h={1} c="#2a2a30" />
          <R x={0} y={47} w={64} h={1} c="#38383f" />

          {/* Plant in its pot */}
          <g className={styles.plante}>
            <R x={2} y={36} w={1} h={6} c="#6fa58a" />
            <R x={0} y={35} w={2} h={2} c="#6fa58a" />
            <R x={3} y={33} w={2} h={3} c="#6fa58a" />
          </g>
          <R x={1} y={42} w={3} h={4} c="#8a6a55" />

          {/* Coffee corner: small table, mug, steam */}
          <R x={5} y={38} w={9} h={1} c="#4a4a52" />
          <R x={6} y={39} w={1} h={7} c="#38383f" />
          <R x={12} y={39} w={1} h={7} c="#38383f" />
          {/* White mug on the dark wall, blue on the pale one */}
          <R x={8} y={35} w={3} h={3} c={clair ? ACCENT : '#e6e6ea'} />
          <R x={11} y={36} c={clair ? ACCENT : '#e6e6ea'} />
          <g className={action === 'cafe' ? styles.vapeurForte : styles.vapeur}>
            <R x={9} y={33} c="#9aa1ab" />
            <R x={10} y={32} c="#9aa1ab" />
            <R x={9} y={31} c="#9aa1ab" />
          </g>

          {/* Desk and laptop; the screen scrolls code, faster while it types */}
          <R x={42} y={36} w={21} h={2} c="#4a4a52" />
          <R x={43} y={38} w={2} h={8} c="#38383f" />
          <R x={60} y={38} w={2} h={8} c="#38383f" />
          <R x={44} y={35} w={13} h={1} c="#9aa1ab" />
          <R x={46} y={26} w={10} h={9} c="#9aa1ab" />
          <R x={47} y={27} w={8} h={7} c={dort && !glyphe ? '#0b0f14' : '#15222d'} />
          {glyphe ? (
            glyphe.map((ligne, i) => <Ligne key={i} ligne={ligne} x={47} y={27 + i} />)
          ) : (
            !dort && (
              <g clipPath="url(#bestiole-ecran)">
                <g className={code ? styles.codeRapide : styles.codeLent}>
                  <R x={48} y={28} w={5} c={ACCENT} />
                  <R x={49} y={30} w={4} c={ACCENT_CLAIR} />
                  <R x={49} y={32} w={5} c={ACCENT} />
                  <R x={48} y={34} w={3} c={ACCENT_CLAIR} />
                  <R x={49} y={36} w={4} c={ACCENT} />
                  <R x={48} y={38} w={5} c={ACCENT_CLAIR} />
                </g>
              </g>
            )
          )}
          {/* Pencil pot */}
          <R x={58} y={32} w={2} h={4} c={ACCENT} />
          <R x={58} y={30} w={1} h={2} c="#f2d58a" />

          {/* Around Halloween, a pumpkin under the desk */}
          {halloween && (
            <>
              <R x={52} y={41} c="#6fa58a" />
              <R x={50} y={42} w={5} h={4} c="#d9822b" />
              <R x={51} y={43} c="#15222d" />
              <R x={53} y={43} c="#15222d" />
              <R x={51} y={44} w={3} h={1} c="#15222d" />
            </>
          )}

          {/* The creature: x moves with a CSS transition, the sprite flips to face its way */}
          <g
            className={styles.position}
            style={{ transform: `translate(${x}px, ${SOL}px)`, transitionDuration: `${marche ? duree : 0}ms` }}
          >
            <g
              className={[
                styles.corps,
                marche && styles.marche,
                action === 'saut' && styles.saut,
                code && styles.tape,
                action === 'cafe' && styles.gorgee,
                dort && styles.dort,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <g className={musique ? styles.hoche : undefined}>
                <Sprite
                  regard={glyphe ? 1 : regard}
                  yeuxFermes={dort || cligne}
                  marche={marche}
                  sansPattes={dort}
                  versLaGauche={versLaGauche}
                  bonnet={decembre && !musique}
                  lunettes={clair}
                  casque={ecoute.enCours}
                />
              </g>
            </g>
            {musique && (
              <g className={styles.notes}>
                <rect x={13} y={-12} width={1} height={3} style={{ fill: ACCENT_CLAIR }} />
                <rect x={12} y={-10} width={1} height={1} style={{ fill: ACCENT_CLAIR }} />
                <rect x={14} y={-12} width={1} height={1} style={{ fill: ACCENT_CLAIR }} />
              </g>
            )}
            {dort && (
              <g className={styles.zzz}>
                <rect x={11} y={-13} width={3} height={1} style={{ fill: ACCENT_CLAIR }} />
                <rect x={12} y={-12} width={1} height={1} style={{ fill: ACCENT_CLAIR }} />
                <rect x={11} y={-11} width={3} height={1} style={{ fill: ACCENT_CLAIR }} />
              </g>
            )}
          </g>
        </svg>
      </button>
      <div className={styles.choix} role="group" aria-label="Changer de bestiole">
        {BESTIOLES.map(b => (
          <button
            key={b.id}
            type="button"
            className={styles.pastille}
            aria-label={b.nom}
            aria-pressed={choisie === b.id}
            onClick={changer(b)}
          >
            <svg viewBox="0 -10 12 11" aria-hidden="true" shapeRendering="crispEdges">
              <Sprite forme={b.id} />
            </svg>
          </button>
        ))}
      </div>
      {ecoute.enCours && (
        <a href={ecoute.url} target="_blank" rel="noopener noreferrer" className={styles.ecoute}>
          {ecoute.pochette && (
            // A remote cover from Last.fm's CDN, tiny and decorative: a plain img is enough
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ecoute.pochette} alt="" width={36} height={36} className={styles.pochette} />
          )}
          <span className={styles.ecouteTexte}>
            <span className={styles.ecouteLibelle}>En écoute</span>
            <span className={styles.ecouteTitre}>
              {ecoute.titre}
              {ecoute.artiste && <span className={styles.ecouteArtiste}> · {ecoute.artiste}</span>}
            </span>
          </span>
        </a>
      )}
    </section>
  )
}
