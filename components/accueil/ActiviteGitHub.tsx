import type { CSSProperties } from 'react'
import { lireActivite, UTILISATEUR_GITHUB, type Jour } from '@/lib/github'
import BestioleRonde from './BestioleRonde'
import BulleCalendrier from './BulleCalendrier'
import styles from './ActiviteGitHub.module.css'

/*
 * The last twelve months of GitHub contributions (or fewer, from the day the
 * account was created), as GitHub draws them: one square per day, a column
 * per week, darker blue for busier days. Rendered on
 * the server and refreshed hourly (lib/github.ts); nothing shows if GitHub
 * cannot be read.
 */

const jourFr = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...options }).format(new Date(`${date.slice(0, 10)}T00:00:00Z`))

const nombre = (j: Jour) => (j.n === 0 ? 'Aucune contribution' : j.n === 1 ? '1 contribution' : `${j.n} contributions`)
const date = (j: Jour) => jourFr(j.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default async function ActiviteGitHub() {
  const activite = await lireActivite()
  if (!activite) return null
  const { total, jours, derniere, depuis } = activite

  // Weeks start on Sunday, as on GitHub: the first column may start part-way down
  const decalage = new Date(`${jours[0].date}T00:00:00Z`).getUTCDay()
  const colonnes = Math.ceil((jours.length + decalage) / 7)

  // Each month's name above the week holding its 1st (none too close to the edge to fit)
  const mois = jours
    .map((j, i) => ({ j, colonne: Math.floor((i + decalage) / 7) }))
    .filter(({ j, colonne }) => j.date.endsWith('-01') && colonne <= colonnes - 3)
    .map(({ j, colonne }) => ({ colonne, nom: jourFr(j.date, { month: 'short' }) }))

  return (
    <section className={styles.carte} aria-labelledby="activite-github">
      <BestioleRonde />
      <div className={styles.entete}>
        <div>
          <h2 id="activite-github" className={styles.titre}>
            Activité GitHub
          </h2>
          <p className={styles.total}>
            {total} contribution{total > 1 ? 's' : ''}{' '}
            {depuis ? `depuis ${jourFr(depuis, { month: 'long', year: 'numeric' })}` : 'sur les 12 derniers mois'}
          </p>
        </div>
        {derniere && (
          <p className={styles.derniere}>
            Dernière activité sur <strong>{derniere.depot}</strong>, le{' '}
            {jourFr(derniere.date, { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Scrolls sideways on small screens, starting from the most recent weeks; hover a day for its count */}
      <BulleCalendrier>
        <div className={styles.defile}>
          <div
            className={styles.calendrier}
            // A short calendar gets larger squares, so it still fills its card
            data-court={colonnes <= 30 ? '' : undefined}
            style={{ '--colonnes': colonnes } as CSSProperties}
          >
            <div className={styles.mois} aria-hidden="true">
              {mois.map(m => (
                <span key={`${m.colonne}-${m.nom}`} style={{ gridColumnStart: m.colonne + 1 }}>
                  {m.nom}
                </span>
              ))}
            </div>
            <ol className={styles.jours} aria-label="Contributions par jour">
              {jours.map((j, i) => (
                <li
                  key={j.date}
                  className={styles.jour}
                  data-niveau={j.niveau}
                  data-nombre={nombre(j)}
                  data-jour={date(j)}
                  // Days with contributions can be reached from the keyboard, and are read out
                  tabIndex={j.n > 0 ? 0 : undefined}
                  aria-label={j.n > 0 ? `${nombre(j)} le ${date(j)}` : undefined}
                  aria-hidden={j.n > 0 ? undefined : true}
                  style={
                    {
                      gridRowStart: i === 0 ? decalage + 1 : undefined,
                      '--x': Math.floor((i + decalage) / 7) / colonnes,
                    } as CSSProperties
                  }
                />
              ))}
            </ol>
          </div>
        </div>
      </BulleCalendrier>

      <div className={styles.pied}>
        <a
          href={`https://github.com/${UTILISATEUR_GITHUB}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.lien}
        >
          Profil GitHub ↗
        </a>
        <span className={styles.legende} aria-hidden="true">
          Moins
          {[0, 1, 2, 3, 4].map(n => (
            <span key={n} className={styles.jour} data-niveau={n} />
          ))}
          Plus
        </span>
      </div>
    </section>
  )
}
