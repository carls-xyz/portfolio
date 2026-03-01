import { projets } from '@/data/projets'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from './projets.module.css'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const projet = projets.find(p => p.slug === slug)
  return {
    title: projet?.title || 'Projet non trouvé'
  }
}

export default async function ProjetsPage({ params }: Props) {
  const { slug } = await params
  const projet = projets.find(p => p.slug === slug)

  if (!projet) {
    notFound()
  }

  return (
    <main className={styles.container}>
      <Link href="/projets" className={styles.back}>
        ← Retour aux projets
      </Link>
      <h1 className={styles.title}>{projet.title}</h1>
      <img src={projet.imageUrl} alt={projet.title} className={styles.image} />
      <p className={styles.description}>{projet.description}</p>
    </main>
  )
}