import ProjetsCard from '@/components/projets/ProjetsCard'
import { projets } from '@/data/projets'
import styles from './projets.module.css'

export const metadata = {
  title: 'Mes Projets',
  description:
    "Les projets réalisés par Charles Bauchet : projets personnels, projets de cours et projets d'équipe.",
}

export default function ProjetsPage() {
  const personnels = projets.filter(p => p.contexte === 'Projet personnel')
  const autres = projets.filter(p => p.contexte !== 'Projet personnel')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mes Projets</h1>
      <p className={styles.description}>
        Mes projets personnels, puis ceux réalisés en cours ou en équipe pendant mes études.
        Pour les projets de groupe, la page de détail précise ce que j&apos;ai personnellement développé.
      </p>

      <h2 className={styles.sousTitre}>Projets personnels</h2>
      <div className={styles.grid}>
        {personnels.map(projet => (
          <ProjetsCard key={projet.slug} projet={projet} />
        ))}
      </div>

      <h2 className={styles.sousTitre}>Projets de cours et d&apos;équipe</h2>
      <div className={styles.grid}>
        {autres.map(projet => (
          <ProjetsCard key={projet.slug} projet={projet} />
        ))}
      </div>
    </div>
  )
}
