import Dossiers from '@/components/projets/Dossiers'
import styles from './projets.module.css'

export const metadata = {
  title: 'Projets',
  description:
    "Les projets réalisés par Charles Bauchet : projets personnels, projets de cours et projets d'équipe.",
}

export default function ProjetsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mes Projets</h1>
      <p className={styles.description}>
        Rangés en trois dossiers : personnels, de cours et d&apos;équipe. Ouvrez un dossier pour voir ses projets.
        Pour les projets de groupe, chaque carte indique ma part.
      </p>

      <Dossiers />
    </div>
  )
}
