import styles from './Cover.module.css'

/*
 * Project covers, drawn inline so they can animate. Each one shows what its
 * project does in one gesture; on hover of the card that gesture plays once
 * (Cover.module.css). At rest, every cover is its final, complete drawing.
 */

/** The accent, through currentColor: .cover sets color to rgb(var(--accent)) */
const BLUE = 'currentColor'

type Props = {
  slug: string
  className?: string
  /** Play the gesture once on page load, after this delay (ms). */
  entree?: number
}

/** Small deterministic generator, so the interference lines never reshuffle between renders */
function lignesParasites(n: number) {
  let graine = 7
  const hasard = () => {
    graine = (graine * 16807) % 2147483647
    return graine / 2147483647
  }
  return Array.from({ length: n }, (_, i) => ({
    x: 140 + Math.round(hasard() * 310),
    y: 80 + Math.round(hasard() * 170),
    w: 8 + Math.round(hasard() * 32),
    o: Math.round((0.3 + hasard() * 0.55) * 100) / 100,
    groupe: i % 3,
  }))
}

function Dessin({ slug }: { slug: string }) {
  switch (slug) {
    // The question fans out to the indexed sources
    case 'rag-doc-assistant': {
      const sources = [
        [400, 70],
        [260, 110],
        [400, 170],
        [260, 230],
        [400, 270],
      ]
      return (
        <>
          {sources.map(([x, y], i) => (
            <line
              key={`l${i}`}
              className={styles.trace}
              style={{ ['--i' as string]: i }}
              x1={200}
              y1={170}
              x2={x}
              y2={y}
              pathLength={1}
              stroke={BLUE}
              strokeOpacity={0.4}
              strokeWidth={2}
            />
          ))}
          <circle cx={200} cy={170} r={12} fill={BLUE} />
          {sources.map(([x, y], i) => (
            <circle
              key={`c${i}`}
              className={styles.apparait}
              style={{ ['--i' as string]: i }}
              cx={x}
              cy={y}
              r={8}
              fill={BLUE}
              fillOpacity={0.85}
            />
          ))}
        </>
      )
    }

    // One mail summary travels the morning workflow
    case 'assistant-email-n8n': {
      const chemin = 'M100 170 C 180 80, 260 260, 340 170 S 460 80, 500 170'
      return (
        <>
          <path d={chemin} fill="none" stroke={BLUE} strokeOpacity={0.5} strokeWidth={3} />
          <circle cx={100} cy={170} r={10} fill={BLUE} />
          <circle cx={340} cy={170} r={10} fill={BLUE} />
          <circle cx={500} cy={170} r={10} fill={BLUE} />
          <circle className={styles.voyageur} style={{ offsetPath: `path('${chemin}')` }} r={6} fill="#ffffff" />
        </>
      )
    }

    // A request goes through the three MVC layers
    case 'parc-activites':
      return (
        <>
          {[
            [150, 104, 300, 0.5],
            [180, 152, 240, 0.32],
            [210, 200, 180, 0.18],
          ].map(([x, y, w, o], i) => (
            <rect
              key={i}
              className={styles.couche}
              style={{ ['--i' as string]: i }}
              x={x}
              y={y}
              width={w}
              height={36}
              rx={8}
              fill={BLUE}
              fillOpacity={o}
              stroke={BLUE}
              strokeOpacity={0.6}
            />
          ))}
        </>
      )

    // The catalogue: filtering by state keeps a few tiles lit
    case 'pixeltrader':
      return (
        <>
          {Array.from({ length: 15 }, (_, k) => {
            const ligne = Math.floor(k / 5)
            const col = k % 5
            const o = [0.15, 0.35, 0.55][(ligne + col) % 3]
            const garde = (ligne + col) % 3 === 2
            return (
              <rect
                key={k}
                className={garde ? styles.garde : styles.filtre}
                x={160 + col * 60}
                y={80 + ligne * 60}
                width={44}
                height={44}
                rx={8}
                fill={BLUE}
                fillOpacity={o}
              />
            )
          })}
        </>
      )

    // The app/ tree, with the dynamic [slug] route lighting up
    case 'portfolio': {
      const lignes: [number, number, number, number][] = [
        [0, 92, 120, 0.5],
        [1, 132, 150, 0.25],
        [1, 172, 110, 0.25],
        [2, 212, 170, 0.6],
        [1, 252, 130, 0.25],
      ]
      return (
        <>
          <line x1={160} y1={104} x2={160} y2={252} stroke={BLUE} strokeOpacity={0.4} strokeWidth={2} />
          <line x1={200} y1={184} x2={200} y2={212} stroke={BLUE} strokeOpacity={0.4} strokeWidth={2} />
          {lignes.map(([prof, y, w, o]) => (
            <g key={y}>
              {prof > 0 && (
                <line
                  x1={160 + (prof - 1) * 40}
                  y1={y}
                  x2={160 + prof * 40}
                  y2={y}
                  stroke={BLUE}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />
              )}
              <rect
                className={prof === 2 ? styles.route : undefined}
                x={160 + prof * 40 + 8}
                y={y - 12}
                width={w}
                height={24}
                rx={6}
                fill={BLUE}
                fillOpacity={o}
              />
            </g>
          ))}
        </>
      )
    }

    // Many students, one class: the ManyToOne relation draws itself
    case 'gestion-classes-symfony':
      return (
        <>
          {[90, 170, 250].map((y, i) => (
            <line
              key={`l${y}`}
              className={styles.trace}
              style={{ ['--i' as string]: i }}
              x1={230}
              y1={y}
              x2={360}
              y2={170}
              pathLength={1}
              stroke={BLUE}
              strokeOpacity={0.4}
              strokeWidth={2}
            />
          ))}
          {[90, 170, 250].map(y => (
            <rect key={`r${y}`} x={150} y={y - 22} width={80} height={44} rx={8} fill={BLUE} fillOpacity={0.25} stroke={BLUE} strokeOpacity={0.6} />
          ))}
          <rect className={styles.apparait} style={{ ['--i' as string]: 3 }} x={360} y={130} width={120} height={80} rx={8} fill={BLUE} fillOpacity={0.5} stroke={BLUE} strokeOpacity={0.6} />
        </>
      )

    // The check is drawn once the shield holds
    case 'crud-securise':
      return (
        <>
          <path
            d="M300 76 L390 112 V172 C390 222 350 254 300 272 C250 254 210 222 210 172 V112 Z"
            fill={BLUE}
            fillOpacity={0.14}
            stroke={BLUE}
            strokeOpacity={0.7}
            strokeWidth={3}
          />
          <path
            className={styles.trace}
            style={{ ['--i' as string]: 1 }}
            d="M268 172 l22 22 46 -52"
            pathLength={1}
            fill="none"
            stroke={BLUE}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )

    // Camera interference: the lines jump once, like a cut in the feed
    case 'emotions-project':
      return (
        <>
          {lignesParasites(80).map((b, i) => (
            <rect
              key={i}
              className={styles.parasite}
              style={{ ['--g' as string]: b.groupe }}
              x={b.x}
              y={b.y}
              width={b.w}
              height={4}
              fill={BLUE}
              fillOpacity={b.o}
            />
          ))}
        </>
      )

    default:
      return null
  }
}

export default function Cover({ slug, className, entree }: Props) {
  return (
    <svg
      className={`${styles.cover} ${entree !== undefined ? styles.joue : ''} ${className ?? ''}`}
      style={entree !== undefined ? ({ ['--retard' as string]: `${entree}ms` }) : undefined}
      viewBox="0 0 600 340"
      aria-hidden="true"
      focusable="false"
    >
      <rect width={600} height={340} fill="#0f0f10" />
      <Dessin slug={slug} />
    </svg>
  )
}
