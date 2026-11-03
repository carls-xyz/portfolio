import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { lireMeteo, type Ciel } from '@/lib/meteo'
import styles from './Meteo.module.css'

/*
 * The weather in Paris, next to the clock: now, the day's range, wind,
 * humidity, the next sunrise or sunset, and the next five hours. Server
 * rendered and refreshed every ten minutes (lib/meteo.ts); not shown when
 * Open-Meteo cannot be reached.
 */

/** WMO weather code → French label and line icon (night variants after sunset) */
function decrire({ code, jour }: Ciel): { libelle: string; Icone: LucideIcon } {
  if (code === 0) return { libelle: 'Ciel dégagé', Icone: jour ? Sun : Moon }
  if (code === 1) return { libelle: 'Plutôt dégagé', Icone: jour ? Sun : Moon }
  if (code === 2) return { libelle: 'Partiellement nuageux', Icone: jour ? CloudSun : CloudMoon }
  if (code === 3) return { libelle: 'Couvert', Icone: Cloud }
  if (code <= 48) return { libelle: 'Brouillard', Icone: CloudFog }
  if (code <= 57) return { libelle: 'Bruine', Icone: CloudDrizzle }
  if (code <= 67) return { libelle: 'Pluie', Icone: CloudRain }
  if (code <= 77) return { libelle: 'Neige', Icone: CloudSnow }
  if (code <= 82) return { libelle: 'Averses', Icone: CloudRain }
  if (code <= 86) return { libelle: 'Averses de neige', Icone: CloudSnow }
  return { libelle: 'Orage', Icone: CloudLightning }
}

export default async function Meteo() {
  const m = await lireMeteo()
  if (!m) return null
  const { libelle, Icone } = decrire(m.ciel)

  return (
    <section className={styles.carte} aria-label="Météo à Paris">
      <p className={styles.lieu}>Météo à Paris</p>

      <div className={styles.maintenant}>
        <Icone size={40} strokeWidth={1.5} className={styles.icone} aria-hidden="true" />
        <div>
          <p className={styles.temperature}>{m.temperature}°</p>
          <p className={styles.ciel}>{libelle}</p>
        </div>
      </div>

      <p className={styles.details}>
        Ressenti {m.ressenti}° · max {m.max}° · min {m.min}°
      </p>

      <dl className={styles.mesures}>
        <div>
          <dt>Vent</dt>
          <dd>{m.vent} km/h</dd>
        </div>
        <div>
          <dt>Humidité</dt>
          <dd>{m.humidite} %</dd>
        </div>
        <div>
          <dt>{m.soleil.type === 'lever' ? 'Lever' : 'Coucher'}</dt>
          <dd>{`${Number(m.soleil.heure.slice(0, 2))} h ${m.soleil.heure.slice(3)}`}</dd>
        </div>
      </dl>

      <ol className={styles.heures} aria-label="Prochaines heures">
        {m.heures.map(h => {
          const { libelle: l, Icone: I } = decrire(h.ciel)
          return (
            <li key={h.heure} className={styles.heure}>
              <span className={styles.h}>{Number(h.heure)} h</span>
              <I size={18} strokeWidth={1.5} aria-label={l} />
              <span className={styles.t}>{h.temperature}°</span>
            </li>
          )
        })}
      </ol>

      <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className={styles.source}>
        Données Open-Meteo
      </a>
    </section>
  )
}
