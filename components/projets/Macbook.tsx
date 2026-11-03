import Sprite from '@/components/accueil/BestioleSprite'
import styles from './Macbook.module.css'

/**
 * A laptop around the project's cover. On a plain page load the lid swings
 * open and the screen lights up; when the cover glides in from a card (View
 * Transition) or with reduced motion, it is simply open. The visitor's
 * creature sits on the left edge of the base, typing away; hover the laptop
 * and it stops to look up at the screen. Pure CSS.
 */
export default function Macbook({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.macbook}>
      <div className={styles.couvercle}>
        <div className={styles.ecran}>{children}</div>
      </div>
      <div className={styles.base} aria-hidden="true" />
      {/* Two poses, swapped by CSS on hover: typing (eyes on the screen) and looking up */}
      <svg viewBox="0 -10 12 11" className={styles.bestiole} aria-hidden="true" shapeRendering="crispEdges">
        <g className={styles.tape}>
          <Sprite />
        </g>
        <g className={styles.leve}>
          <Sprite regard={1} />
        </g>
      </svg>
    </div>
  )
}
