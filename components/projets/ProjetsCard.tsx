import Link from 'next/link'
import styles from './ProjetsCard.module.css'
import { Projet } from '@/data/projets'

export default function ProjetsCard({ projet }: { projet: Projet }) {
  return (
    <Link href={`/projets/${projet.slug}`} className={styles.card}>
      <img
        src={projet.imageUrl}
        alt=""
        aria-hidden="true"
        className={styles.cover}
      />

      <div className={styles.meta}>
        <span className={styles.badge}>{projet.contexte}</span>
        <span className={styles.annee}>{projet.annee}</span>
      </div>

      <h3 className={styles.title}>{projet.title}</h3>
      <p className={styles.description}>{projet.tagline}</p>

      <ul className={styles.stack}>
        {projet.stack.slice(0, 4).map(techno => (
          <li key={techno} className={styles.techno}>{techno}</li>
        ))}
      </ul>

      <span className={styles.arrow}>→ Voir le projet</span>
    </Link>
  )
}
