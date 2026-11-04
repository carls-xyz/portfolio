import { BESTIOLES } from '@/components/accueil/bestioles'

/*
 * Shared pieces of the share images (app/opengraph-image.tsx and
 * app/projets/[slug]/opengraph-image.tsx): the preview LinkedIn, Slack or a
 * message shows when someone pastes a link to the site. They are drawn at build
 * time by next/og, in the dark theme with the default creature and its blue.
 */

/** The feet, as in BestioleSprite.tsx (not imported: it pulls in a CSS module) */
const PATTES_A = '..OO....OO..'

export const TAILLE = { width: 1200, height: 630 }
export const TYPE = 'image/png'

export const COULEURS = {
  page: '#111113',
  surface: '#1a1a1d',
  ligne: 'rgba(255, 255, 255, 0.12)',
  texte: '#ffffff',
  secondaire: 'rgba(255, 255, 255, 0.62)',
  accent: '#61a7d5',
  accentClair: '#bad7fd',
}

/** A creature as an SVG data URL (next/og draws <img>, not CSS variables) */
export function bestioleSvg(id = BESTIOLES[0].id) {
  const b = BESTIOLES.find(x => x.id === id) ?? BESTIOLES[0]
  const couleurs: Record<string, string> = { ...b.couleurs, W: '#f2f4f7', P: '#15222d' }
  const rects = [...b.corps, PATTES_A]
    .flatMap((ligne, y) =>
      [...ligne].map((p, x) =>
        couleurs[p] ? `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${couleurs[p]}"/>` : '',
      ),
    )
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10" shape-rendering="crispEdges">${rects}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/** The site's name with the creature, top left of every image */
export function Signature({ taille = 44 }: { taille?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bestioleSvg()} width={taille} height={(taille * 10) / 12} alt="" />
      <span style={{ fontSize: 30, color: COULEURS.texte, letterSpacing: 0 }}>carls-xyz</span>
    </div>
  )
}
