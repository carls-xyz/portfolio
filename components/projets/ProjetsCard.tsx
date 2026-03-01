import Link from 'next/link'
import styles from './ProjetsCard.module.css'
import { Projets, projets } from '@/data/projets'

export default function ProjetsCard({ projets }: { projets: Projets }) {
  return (
    <Link href={`/projets/${projets.slug}`} className={styles.card}>
      <h3 className={styles.title}>{projets.title}</h3>
      <p className={styles.description}>{projets.description}</p>
      <span className={styles.arrow}>→ Voir le projet</span>
    </Link>
  )
}