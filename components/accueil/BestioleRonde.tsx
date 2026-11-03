import Sprite from './BestioleSprite'
import styles from './BestioleRonde.module.css'

/**
 * A tiny copy of the creature walking round the edge of its parent card,
 * clockwise, feet always on the border: upright along the top, sideways down
 * the right edge, upside down along the bottom. The parent must be
 * position: relative. Pure CSS; with reduced motion it sits on the top edge.
 */
export default function BestioleRonde() {
  return (
    <span className={styles.ronde} aria-hidden="true">
      <svg viewBox="0 -10 12 11" className={styles.svg} shapeRendering="crispEdges">
        <Sprite marche />
      </svg>
    </span>
  )
}
