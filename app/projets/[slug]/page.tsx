import { projets } from '@/data/projets'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from './projets.module.css'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return projets.map(projet => ({ slug: projet.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const projet = projets.find(p => p.slug === slug)

  if (!projet) {
    return { title: 'Projet non trouvé' }
  }

  return {
    title: projet.title,
    description: projet.tagline,
  }
}

export default async function ProjetPage({ params }: Props) {
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

      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.badge}>{projet.contexte}</span>
          <span className={styles.annee}>{projet.annee}</span>
        </div>
        <h1 className={styles.title}>{projet.title}</h1>
        <p className={styles.tagline}>{projet.tagline}</p>
      </header>

      <img src={projet.imageUrl} alt="" aria-hidden="true" className={styles.image} />

      <p className={styles.description}>{projet.description}</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ce que contient le projet</h2>
        <ul className={styles.points}>
          {projet.points.map(point => (
            <li key={point} className={styles.point}>{point}</li>
          ))}
        </ul>
      </section>

      {projet.role && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ma contribution</h2>
          <p className={styles.description}>{projet.role}</p>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Technologies</h2>
        <ul className={styles.stack}>
          {projet.stack.map(techno => (
            <li key={techno} className={styles.techno}>{techno}</li>
          ))}
        </ul>
      </section>

      {projet.repoUrl && (
        <a
          href={projet.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.lien}
        >
          Voir le code sur GitHub ↗
        </a>
      )}
    </main>
  )
}
