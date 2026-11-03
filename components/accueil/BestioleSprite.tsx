import { BESTIOLES, type Bestiole, type IdBestiole } from './bestioles'
import styles from './BestioleSprite.module.css'

/*
 * The creature's sprite, shared by its desk on the home page, the 404 page,
 * the contact form, the island and the GitHub card. 12 × 10 pixels, drawn with
 * its feet at y = 0. It holds the four creatures' shapes and CSS shows the one
 * the visitor picked (globals.css, [data-forme]), so even server-rendered
 * copies follow the choice without a flash; `forme` draws one shape only.
 */

const PATTES_A = '..OO....OO..'
const PATTES_B = '...OO..OO...'

/* Colours every creature shares; B and L are the site's accent, for glyphs */
const COMMUNES: Record<string, string> = {
  W: '#f2f4f7',
  P: '#15222d',
  B: 'rgb(var(--accent))',
  L: 'rgb(var(--accent-clair))',
}

/** One row of pixels as merged horizontal runs, so each run is a single rect */
export function Ligne({
  ligne,
  x = 0,
  y,
  remplace,
  couleurs = COMMUNES,
}: {
  ligne: string
  x?: number
  y: number
  remplace?: Record<string, string>
  couleurs?: Record<string, string>
}) {
  const runs: { x: number; w: number; c: string }[] = []
  for (let i = 0; i < ligne.length; i++) {
    const k = remplace?.[ligne[i]] ?? ligne[i]
    if (k === '.') continue
    const derniere = runs[runs.length - 1]
    if (derniere && derniere.x + derniere.w === i && derniere.c === k) derniere.w++
    else runs.push({ x: i, w: 1, c: k })
  }
  return (
    <>
      {runs.map(r => (
        // style rather than the fill attribute, so CSS variables work too
        <rect key={r.x} x={x + r.x} y={y} width={r.w} height={1} style={{ fill: couleurs[r.c] }} />
      ))}
    </>
  )
}

/** Pupils: up (1) moves each pupil into the white above it; back (-1) into the white on its left */
function regarder(corps: string[], regard: number) {
  if (!regard) return corps
  const m = corps.map(r => r.split(''))
  m.forEach((rangee, r) =>
    rangee.forEach((p, c) => {
      if (p !== 'P') return
      if (regard === 1 && m[r - 1]?.[c] === 'W') {
        m[r][c] = 'W'
        m[r - 1][c] = 'P'
      } else if (regard === -1 && rangee[c - 1] === 'W') {
        rangee[c] = 'W'
        rangee[c - 1] = 'P'
      }
    }),
  )
  return m.map(r => r.join(''))
}

/** Closed eyes: a dark line across the top row of each eye */
function paupieres(corps: string[]) {
  const r = corps.findIndex(l => l.includes('W'))
  if (r < 0) return []
  const runs: { x: number; w: number }[] = []
  ;[...corps[r]].forEach((p, c) => {
    if (p !== 'W' && p !== 'P') return
    const derniere = runs[runs.length - 1]
    if (derniere && derniere.x + derniere.w === c) derniere.w++
    else runs.push({ x: c, w: 1 })
  })
  return runs.map(run => ({ ...run, y: r - 9 }))
}

type Props = {
  /** Pupils: -1 looking back, 0 forward, 1 up */
  regard?: number
  yeuxFermes?: boolean
  /** Alternating feet */
  marche?: boolean
  /** Feet tucked in, e.g. asleep */
  sansPattes?: boolean
  versLaGauche?: boolean
  /** A red winter hat, in December */
  bonnet?: boolean
  /** Sunglasses, in the light theme */
  lunettes?: boolean
  /** Headphones, while the site's owner is listening to music */
  casque?: boolean
  /** Draw this creature only, instead of the visitor's choice */
  forme?: IdBestiole
  children?: React.ReactNode
}

function Corps({ bestiole, regard, yeuxFermes, marche, sansPattes }: { bestiole: Bestiole } & Props) {
  const couleurs = { ...COMMUNES, ...bestiole.couleurs }
  const fermes = yeuxFermes ? { W: 'X', P: 'X' } : undefined
  return (
    <>
      {regarder(bestiole.corps, regard ?? 0).map((ligne, i) => (
        <Ligne key={i} ligne={ligne} y={i - 9} remplace={fermes} couleurs={couleurs} />
      ))}
      {yeuxFermes &&
        paupieres(bestiole.corps).map(p => <rect key={p.x} x={p.x} y={p.y} width={p.w} height={1} fill="#15222d" />)}
      {!sansPattes && (
        <>
          <g className={marche ? styles.pasA : undefined}>
            <Ligne ligne={PATTES_A} y={0} couleurs={couleurs} />
          </g>
          {marche && (
            <g className={styles.pasB}>
              <Ligne ligne={PATTES_B} y={0} couleurs={couleurs} />
            </g>
          )}
        </>
      )}
    </>
  )
}

export default function Sprite(props: Props) {
  const { versLaGauche, bonnet, lunettes, casque, forme, children } = props

  return (
    <g style={{ transform: versLaGauche ? 'translateX(12px) scaleX(-1)' : undefined }}>
      {forme ? (
        <Corps bestiole={BESTIOLES.find(b => b.id === forme) ?? BESTIOLES[0]} {...props} />
      ) : (
        BESTIOLES.map(b => (
          <g key={b.id} data-forme={b.id}>
            <Corps bestiole={b} {...props} />
          </g>
        ))
      )}
      {lunettes && (
        <>
          <rect x={0} y={-5} width={12} height={1} fill="#15222d" />
          <rect x={1} y={-4} width={4} height={1} fill="#15222d" />
          <rect x={7} y={-4} width={4} height={1} fill="#15222d" />
          <rect x={2} y={-5} width={1} height={1} fill="#4a86ad" />
          <rect x={8} y={-5} width={1} height={1} fill="#4a86ad" />
        </>
      )}
      {casque && (
        <>
          <rect x={2} y={-11} width={8} height={1} fill="#2b2d33" />
          <rect x={1} y={-10} width={1} height={2} fill="#2b2d33" />
          <rect x={10} y={-10} width={1} height={2} fill="#2b2d33" />
          <rect x={-1} y={-8} width={2} height={4} fill="#15222d" />
          <rect x={11} y={-8} width={2} height={4} fill="#15222d" />
          <rect x={-1} y={-7} width={1} height={1} fill="#bad7fd" />
          <rect x={12} y={-7} width={1} height={1} fill="#bad7fd" />
        </>
      )}
      {bonnet && (
        <>
          <rect x={8} y={-11} width={2} height={1} fill="#c94f4f" />
          <rect x={5} y={-10} width={5} height={1} fill="#c94f4f" />
          <rect x={3} y={-9} width={6} height={1} fill="#c94f4f" />
          <rect x={2} y={-8} width={8} height={1} fill="#f2f4f7" />
          <rect x={10} y={-12} width={2} height={2} fill="#f2f4f7" />
        </>
      )}
      {children}
    </g>
  )
}
