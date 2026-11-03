/*
 * The weather in Paris for the home page's weather widget, from Open-Meteo
 * (free, no key; data under CC BY 4.0, credited on the card). Fetched on the
 * server and cached for ten minutes; null when the service cannot be reached.
 * All times are Paris local times, as Open-Meteo returns them ("2026-11-03T21:30").
 */

export type Ciel = { code: number; jour: boolean }

export type Meteo = {
  temperature: number
  ressenti: number
  humidite: number
  vent: number
  ciel: Ciel
  min: number
  max: number
  /** The next sunrise or sunset, whichever comes first */
  soleil: { type: 'lever' | 'coucher'; heure: string }
  heures: { heure: string; temperature: number; ciel: Ciel }[]
}

const URL_METEO =
  'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522' +
  '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day' +
  '&hourly=temperature_2m,weather_code,is_day' +
  '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset' +
  '&forecast_days=2&timezone=Europe%2FParis'

export async function lireMeteo(): Promise<Meteo | null> {
  try {
    const res = await fetch(URL_METEO, { next: { revalidate: 600 } })
    if (!res.ok) return null
    const d = await res.json()
    const c = d.current
    const maintenant: string = c.time

    // The next five whole hours after now
    const debut = d.hourly.time.findIndex((t: string) => t > maintenant)
    const heures = (d.hourly.time as string[]).slice(debut, debut + 5).map((t, i) => ({
      heure: t.slice(11, 13),
      temperature: Math.round(d.hourly.temperature_2m[debut + i]),
      ciel: { code: d.hourly.weather_code[debut + i], jour: d.hourly.is_day[debut + i] === 1 },
    }))

    const [leverAuj, leverDemain] = d.daily.sunrise as string[]
    const coucherAuj = (d.daily.sunset as string[])[0]
    const soleil: Meteo['soleil'] =
      maintenant < leverAuj
        ? { type: 'lever', heure: leverAuj.slice(11, 16) }
        : maintenant < coucherAuj
          ? { type: 'coucher', heure: coucherAuj.slice(11, 16) }
          : { type: 'lever', heure: leverDemain.slice(11, 16) }

    return {
      temperature: Math.round(c.temperature_2m),
      ressenti: Math.round(c.apparent_temperature),
      humidite: Math.round(c.relative_humidity_2m),
      vent: Math.round(c.wind_speed_10m),
      ciel: { code: c.weather_code, jour: c.is_day === 1 },
      min: Math.round(d.daily.temperature_2m_min[0]),
      max: Math.round(d.daily.temperature_2m_max[0]),
      soleil,
      heures,
    }
  } catch {
    return null
  }
}
