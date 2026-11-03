import Sprite from './BestioleSprite'
import styles from './BestiolePerdue.module.css'

/* The torch beam, widening every 3 px: [x, y, height] in the sprite's own pixels */
const FAISCEAU = Array.from({ length: 15 }, (_, i) => {
  const palier = Math.floor(i / 3)
  return [13 + i, -4 - palier, 1 + 2 * palier]
})

/**
 * For the 404 page: the creature from the home page, lost in the dark,
 * walking back and forth with a torch to look for the missing page.
 * Pure CSS, so it also works without JavaScript; still with reduced motion.
 */
export default function BestiolePerdue() {
  return (
    <svg viewBox="0 0 64 24" className={styles.svg} aria-hidden="true" shapeRendering="crispEdges">
      <rect x={0} y={22} width={64} height={1} fill="#1f1f24" />
      <rect x={0} y={23} width={64} height={1} fill="#26262c" />
      <g className={styles.ronde}>
        <g className={styles.demiTour}>
          <Sprite marche regard={0}>
            {FAISCEAU.map(([x, y, h]) => (
              <rect key={x} x={x} y={y} width={1} height={h} fill="#f2d58a" opacity={0.16} />
            ))}
            <rect x={11} y={-4} width={2} height={1} fill="#9aa1ab" />
          </Sprite>
        </g>
      </g>
    </svg>
  )
}
