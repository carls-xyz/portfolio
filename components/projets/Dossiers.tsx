"use client"

import { useSyncExternalStore, type CSSProperties } from 'react'
import { projets, type Contexte } from '@/data/projets'
import Cover from './Cover'
import ProjetsCard from './ProjetsCard'
import pageStyles from '@/app/projets/projets.module.css'
import styles from './Dossiers.module.css'

/*
 * The projects page as three glass folders, one per context. Each folder shows
 * its projects' covers peeking out; on hover they fan. Nothing is listed until
 * a folder is clicked: it opens (the covers lift out) and its projects appear
 * below; a second click closes it. The open folder is kept in the URL
 * (?dossier=equipe), so coming back from a project reopens it.
 */

/* All three in the site's accent, i.e. the colour of the creature the visitor picked */
const DOSSIERS: { contexte: Contexte; cle: string; titre: string; section: string }[] = [
  { contexte: 'Projet personnel', cle: 'personnel', titre: 'Personnel', section: 'Projets personnels' },
  { contexte: 'Projet de cours', cle: 'cours', titre: 'Cours', section: 'Projets de cours' },
  { contexte: "Projet d'équipe", cle: 'equipe', titre: 'Équipe', section: "Projets d'équipe" },
]

/* The open folder, read from the URL; none on the server */
function abonner(rappel: () => void) {
  window.addEventListener('popstate', rappel)
  window.addEventListener('dossier', rappel)
  return () => {
    window.removeEventListener('popstate', rappel)
    window.removeEventListener('dossier', rappel)
  }
}
const lireDossier = () => new URLSearchParams(window.location.search).get('dossier')
const surServeur = () => null

function choisir(cle: string | null) {
  const url = new URL(window.location.href)
  if (cle) url.searchParams.set('dossier', cle)
  else url.searchParams.delete('dossier')
  window.history.replaceState(null, '', url)
  window.dispatchEvent(new Event('dossier'))
}

export default function Dossiers() {
  const cle = useSyncExternalStore(abonner, lireDossier, surServeur)
  const ouvert = DOSSIERS.find(d => d.cle === cle)

  return (
    <>
      <div className={styles.dossiers} role="group" aria-label="Dossiers de projets">
        {DOSSIERS.map(d => {
          const liste = projets.filter(p => p.contexte === d.contexte)
          const ici = ouvert === d
          return (
            <button
              key={d.cle}
              type="button"
              className={styles.dossier}
              aria-pressed={ici}
              aria-controls="projets-du-dossier"
              aria-label={`${d.section}, ${liste.length} projets`}
              onClick={() => choisir(ici ? null : d.cle)}
            >
              <span className={styles.dos} aria-hidden="true" />
              <span className={styles.feuilles} aria-hidden="true">
                {liste.slice(0, 3).map((p, i, tout) => (
                  <span
                    key={p.slug}
                    className={styles.feuille}
                    // -1, 0, 1 from left to right, so the fan opens around the middle one
                    style={{ '--i': i - (tout.length - 1) / 2 } as CSSProperties}
                  >
                    <Cover slug={p.slug} className={styles.feuilleCover} />
                  </span>
                ))}
              </span>
              <span className={styles.face} aria-hidden="true">
                <span className={styles.titre}>{d.titre}</span>
                <span className={styles.compte}>{liste.length} projets</span>
              </span>
            </button>
          )
        })}
      </div>

      <section id="projets-du-dossier" aria-label={ouvert?.section ?? 'Projets du dossier ouvert'}>
        {ouvert && (
          <div key={ouvert.cle} className={styles.contenu}>
            <h2 className={pageStyles.sousTitre}>{ouvert.section}</h2>
            <div className={pageStyles.grid}>
              {projets
                .filter(p => p.contexte === ouvert.contexte)
                .map(projet => (
                  <ProjetsCard key={projet.slug} projet={projet} />
                ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
