import ProjetsCard from '@/components/projets/ProjetsCard'
import { projets } from '@/data/projets'
import styles from './projets.module.css'

export const metadata = {
  title: "Mes Projets",
  description: "",
}

export default function ProjetsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mes Projets</h1>
 <p className={styles.description}>Voici une sélection de mes projets récents.</p>
      <div className={styles.grid}>
        {projets.map(projets => (
          <ProjetsCard
            key={projets.slug}
            projets={projets}
          />
        ))}
      </div>
    </div>
  )
}