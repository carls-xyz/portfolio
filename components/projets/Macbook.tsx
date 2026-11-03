import styles from './Macbook.module.css'

/**
 * A laptop around the project's cover. On a plain page load the lid swings
 * open and the screen lights up; when the cover glides in from a card (View
 * Transition) or with reduced motion, it is simply open. Pure CSS.
 */
export default function Macbook({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.macbook}>
      <div className={styles.couvercle}>
        <div className={styles.ecran}>{children}</div>
      </div>
      <div className={styles.base} aria-hidden="true" />
    </div>
  )
}
