import { NextResponse } from 'next/server'

/*
 * What Charles is listening to right now, from Last.fm (Apple Music is
 * scrobbled there by a separate app). The API key stays on the server; the
 * page only receives the track. Without LASTFM_API_KEY and LASTFM_USER (or
 * LASTFM_USERNAME), or when nothing is playing, it answers { enCours: false }
 * and the home page shows nothing.
 */

export type Ecoute =
  | { enCours: false }
  | { enCours: true; titre: string; artiste: string; url: string; pochette: string | null }

type ReponseLastfm = {
  recenttracks?: {
    track?: {
      name?: string
      url?: string
      artist?: { '#text'?: string }
      image?: { size?: string; '#text'?: string }[]
      '@attr'?: { nowplaying?: string }
    }[]
  }
}

const RIEN: Ecoute = { enCours: false }

export async function GET() {
  const cle = process.env.LASTFM_API_KEY
  const utilisateur = process.env.LASTFM_USER ?? process.env.LASTFM_USERNAME
  if (!cle || !utilisateur) return NextResponse.json(RIEN)

  const url = new URL('https://ws.audioscrobbler.com/2.0/')
  url.search = new URLSearchParams({
    method: 'user.getrecenttracks',
    user: utilisateur,
    api_key: cle,
    format: 'json',
    limit: '1',
  }).toString()

  try {
    // Last.fm is asked at most every 30 s, whatever the number of visitors
    const res = await fetch(url, { next: { revalidate: 30 } })
    if (!res.ok) return NextResponse.json(RIEN)
    const donnees = (await res.json()) as ReponseLastfm
    const piste = donnees.recenttracks?.track?.[0]
    if (!piste || piste['@attr']?.nowplaying !== 'true' || !piste.name) return NextResponse.json(RIEN)

    const ecoute: Ecoute = {
      enCours: true,
      titre: piste.name,
      artiste: piste.artist?.['#text'] ?? '',
      url: piste.url ?? 'https://www.last.fm',
      // The largest cover Last.fm has; empty strings mean none
      pochette: ['extralarge', 'large', 'medium'].map(t => piste.image?.find(i => i.size === t)?.['#text']).find(Boolean) ?? null,
    }
    return NextResponse.json(ecoute)
  } catch {
    return NextResponse.json(RIEN)
  }
}
