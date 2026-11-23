import { CLE_DOSSIER, projets } from '@/data/projets'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ViewTransition } from 'react'
import CoverEnBoucle from '@/components/projets/CoverEnBoucle'
import Macbook from '@/components/projets/Macbook'
import DiffCode from '@/components/projets/DiffCode'
import Schema from '@/components/projets/Schema'
import { diffs } from '@/data/diffs'
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
    // The tab only says "carls-xyz"; a shared link names the project
    // (openGraph replaces the layout's whole object, hence siteName and locale again)
    openGraph: { title: `${projet.title} · carls-xyz`, description: projet.tagline, siteName: "carls-xyz", locale: "fr_FR", type: "article" },
  }
}

export default async function ProjetPage({ params }: Props) {
  const { slug } = await params
  const projet = projets.find(p => p.slug === slug)

  if (!projet) {
    notFound()
  }

  // The next one in the list, back to the first after the last
  const suivant = projets[(projets.indexOf(projet) + 1) % projets.length]
  // Only some projects carry a case study; the others keep the page as it was
  const etude = projet.etudeDeCas

  return (
    // Same name as the project's card on /projets: the card grows into this panel
    <ViewTransition name={`carte-${projet.slug}`} share="carte">
      <div className={styles.container}>
        {/* Back to the folder this project sits in, open */}
        <Link href={`/projets?dossier=${CLE_DOSSIER[projet.contexte]}`} className={styles.back}>
          ← Retour aux projets
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.badge} data-contexte={projet.contexte}>
              {projet.contexte}
            </span>
            <span className={styles.annee}>{projet.annee}</span>
          </div>
          <h1 className={styles.title}>{projet.title}</h1>
          <p className={styles.tagline}>{projet.tagline}</p>
        </header>

        <Macbook>
          <ViewTransition name={`cover-${projet.slug}`}>
            <CoverEnBoucle slug={projet.slug} className={styles.image} entree={1100} />
          </ViewTransition>
        </Macbook>

        <p className={styles.description}>{projet.description}</p>

        {etude && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Le problème</h2>
            <p className={styles.prose}>{etude.probleme}</p>
          </section>
        )}

        <section className={`${styles.section} ${styles.encadre}`}>
          <h2 className={styles.sectionTitle}>Ce que contient le projet</h2>
          <ul className={styles.points}>
            {projet.points.map(point => (
              <li key={point} className={styles.point}>
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* How it is built, part by part, each diagram right after the text it draws */}
        {etude && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Comment c&apos;est construit</h2>
            {etude.sections.map(partie => (
              <div key={partie.titre} className={styles.partie}>
                <h3 className={styles.partieTitre}>{partie.titre}</h3>
                <p className={styles.prose}>{partie.texte}</p>
                {partie.schema && <Schema {...partie.schema} />}
              </div>
            ))}
          </section>
        )}

        {etude && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Choix techniques</h2>
            <ol className={styles.choix}>
              {etude.choix.map((c, i) => (
                <li key={c.titre} className={styles.choixItem}>
                  <span className={styles.choixNumero} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.partieTitre}>{c.titre}</h3>
                  <p className={styles.prose}>{c.pourquoi}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {diffs[projet.slug] && <DiffCode diff={diffs[projet.slug]} titreSection={styles.sectionTitle} />}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Technologies</h2>
          <ul className={styles.stack}>
            {projet.stack.map(techno => (
              <li key={techno} className={styles.techno}>
                {techno}
              </li>
            ))}
          </ul>
        </section>

        {projet.repoUrl && (
          <a href={projet.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.lien}>
            Voir le code sur GitHub ↗
          </a>
        )}

        {/* Straight on to the next project, without going back through the list */}
        <nav className={styles.suivant} aria-label="Projet suivant">
          <Link href={`/projets/${suivant.slug}`} className={styles.suivantLien}>
            <span className={styles.suivantTexte}>
              <span className={styles.suivantLabel}>Projet suivant</span>
              <span className={styles.suivantTitre}>{suivant.title}</span>
              <span className={styles.suivantAccroche}>{suivant.tagline}</span>
            </span>
            <span className={styles.suivantFleche} aria-hidden="true">
              →
            </span>
          </Link>
        </nav>
      </div>
    </ViewTransition>
  )
}
