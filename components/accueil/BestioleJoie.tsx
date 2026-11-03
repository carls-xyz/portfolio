import Sprite from './BestioleSprite'
import styles from './BestioleJoie.module.css'

/** The creature hopping three times for joy, next to "Message envoyé" */
export default function BestioleJoie() {
  return (
    <svg viewBox="0 -14 12 15" className={styles.svg} aria-hidden="true" shapeRendering="crispEdges">
      <g className={styles.joie}>
        <Sprite regard={1} />
      </g>
    </svg>
  )
}
