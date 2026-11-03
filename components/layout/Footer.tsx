import styles from './Footer.module.css'
import Bonjour from './Bonjour'

// Rendered at build time, so it always reflects the last deployment
const miseAJour = new Date().toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>
        © 2026 carls-xyz
        <span className={styles.sep} aria-hidden="true">·</span>
        Mis à jour le {miseAJour}
        <span className={styles.sep} aria-hidden="true">·</span>
        <a
          href="https://github.com/carls-xyz/portfolio"
          className={styles.lien}
          target="_blank"
          rel="noopener noreferrer"
        >
          Code source sur GitHub
        </a>
      </p>
      <Bonjour />
    </footer>
  )
}
