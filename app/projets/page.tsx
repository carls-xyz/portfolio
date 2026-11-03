import Dossiers from '@/components/projets/Dossiers'
import styles from './projets.module.css'

export const metadata = {
  title: 'Projets',
  description:
    "Les projets : personnels, de cours et d'équipe.",
}

export default function ProjetsPage() {
  return (
    <div className={styles.container}>
      {/* No visible heading: the folders speak for themselves; this one is for screen readers and search */}
      <h1 className="sr-only">Projets</h1>

      <Dossiers />
    </div>
  )
}
