/*
 * GitHub activity for the home page, fetched on the server and cached for a
 * quarter of an hour. With GITHUB_TOKEN set, the official GraphQL API is used (it can count
 * private contributions too); without it, the public contributions page that
 * GitHub itself renders on the profile is read. Either way, only real data:
 * when both fail, the card is simply not shown.
 */

export const UTILISATEUR_GITHUB = process.env.GITHUB_USERNAME ?? 'carls-xyz'

export type Jour = { date: string; n: number; niveau: 0 | 1 | 2 | 3 | 4 }
export type Activite = {
  total: number
  jours: Jour[]
  /** The repository pushed to most recently, and when */
  derniere: { depot: string; date: string } | null
  /** The day the account was created (YYYY-MM-DD) when it is younger than the calendar, else null */
  depuis: string | null
}

const CACHE = 900 // seconds

type Calendrier = Pick<Activite, 'total' | 'jours'>

async function parGraphQL(token: string): Promise<Calendrier | null> {
  const requete = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`
  const NIVEAUX: Record<string, Jour['niveau']> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  }
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: requete, variables: { login: UTILISATEUR_GITHUB } }),
    next: { revalidate: CACHE },
  })
  if (!res.ok) return null
  const json = await res.json()
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar
  if (!cal) return null
  const jours: Jour[] = cal.weeks.flatMap(
    (s: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
      s.contributionDays.map(j => ({ date: j.date, n: j.contributionCount, niveau: NIVEAUX[j.contributionLevel] ?? 0 })),
  )
  return { total: cal.totalContributions, jours }
}

/** The calendar GitHub renders on the public profile: one cell per day, with its level and a tooltip giving the count */
async function parPagePublique(): Promise<Calendrier | null> {
  const res = await fetch(`https://github.com/users/${UTILISATEUR_GITHUB}/contributions`, {
    next: { revalidate: CACHE },
  })
  if (!res.ok) return null
  const html = await res.text()

  const comptes = new Map<string, number>()
  for (const [, id, texte] of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const m = texte.match(/^(\d+) contributions? on/)
    comptes.set(id, m ? Number(m[1]) : 0)
  }
  const jours: Jour[] = [...html.matchAll(/data-date="([^"]+)" id="([^"]+)" data-level="(\d)"/g)]
    .map(([, date, id, niveau]) => ({ date, n: comptes.get(id) ?? 0, niveau: Number(niveau) as Jour['niveau'] }))
    .sort((a, b) => a.date.localeCompare(b.date))
  if (!jours.length) return null

  const total = html.match(/([\d,]+)\s+contributions?\s+in the last year/)
  return { total: total ? Number(total[1].replace(/,/g, '')) : jours.reduce((s, j) => s + j.n, 0), jours }
}

/*
 * From the repositories sorted by their last push, not the public events feed:
 * GitHub publishes events with a delay that can reach hours, while a
 * repository's pushed_at changes as soon as the push lands.
 */
async function derniereActivite(): Promise<Activite['derniere']> {
  const res = await fetch(`https://api.github.com/users/${UTILISATEUR_GITHUB}/repos?sort=pushed&per_page=5`, {
    headers: { Accept: 'application/vnd.github+json' },
    next: { revalidate: CACHE },
  })
  if (!res.ok) return null
  const depots: { name: string; fork: boolean; pushed_at: string }[] = await res.json()
  const dernier = depots.find(d => !d.fork)
  return dernier ? { depot: dernier.name, date: dernier.pushed_at } : null
}

/** The day the account was created, as YYYY-MM-DD */
async function creationDuCompte(): Promise<string | null> {
  const res = await fetch(`https://api.github.com/users/${UTILISATEUR_GITHUB}`, {
    headers: { Accept: 'application/vnd.github+json' },
    // An account's creation date never changes
    next: { revalidate: 86_400 },
  })
  if (!res.ok) return null
  const { created_at }: { created_at?: string } = await res.json()
  return created_at?.slice(0, 10) ?? null
}

export async function lireActivite(): Promise<Activite | null> {
  try {
    const token = process.env.GITHUB_TOKEN
    const [calendrier, derniere, creation] = await Promise.all([
      (token ? parGraphQL(token).catch(() => null) : Promise.resolve(null)).then(c => c ?? parPagePublique()),
      derniereActivite().catch(() => null),
      creationDuCompte().catch(() => null),
    ])
    if (!calendrier) return null

    /*
     * An account younger than a year: the calendar starts the day it was
     * created, rather than showing months of squares that could only be empty.
     */
    if (creation && creation > calendrier.jours[0].date) {
      const jours = calendrier.jours.filter(j => j.date >= creation)
      if (jours.length) return { total: jours.reduce((s, j) => s + j.n, 0), jours, derniere, depuis: creation }
    }
    return { ...calendrier, derniere, depuis: null }
  } catch {
    return null
  }
}
