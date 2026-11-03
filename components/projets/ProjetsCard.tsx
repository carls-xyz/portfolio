import Link from 'next/link'
import { ViewTransition } from 'react'
import styles from './ProjetsCard.module.css'
import { Projet } from '@/data/projets'
import Cover from './Cover'

/** `entree`: play the cover's gesture once on load, after this delay (ms). */
export default function ProjetsCard({ projet, entree }: { projet: Projet; entree?: number }) {
  return (
    // The whole card grows into the project page's panel, which has the same name
    <ViewTransition name={`carte-${projet.slug}`} share="carte">
      <Link href={`/projets/${projet.slug}`} className={styles.card}>
        {/* Same name as the project page's cover: it glides from here to there */}
        <ViewTransition name={`cover-${projet.slug}`}>
          <Cover slug={projet.slug} className={styles.cover} entree={entree} />
        </ViewTransition>

        <div className={styles.meta}>
          <span className={styles.badge} data-contexte={projet.contexte}>
            {projet.contexte}
          </span>
          <span className={styles.annee}>{projet.annee}</span>
        </div>

        <h3 className={styles.title}>{projet.title}</h3>
        <p className={styles.description}>{projet.tagline}</p>

        {projet.part && (
          <p className={styles.part}>
            <span className={styles.partLabel}>Ma part</span> {projet.part}
          </p>
        )}

        <ul className={styles.stack}>
          {projet.stack.slice(0, 4).map(techno => (
            <li key={techno} className={styles.techno}>
              {techno}
            </li>
          ))}
        </ul>

        <span className={styles.arrow}>Voir le projet →</span>
      </Link>
    </ViewTransition>
  )
}
