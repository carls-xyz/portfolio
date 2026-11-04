import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { projets } from '@/data/projets'
import { COULEURS, Signature, TAILLE, TYPE } from '@/lib/partage'

/*
 * One share image per project: its title, tagline, context and stack beside
 * its cover (the same SVG as on its card), drawn at build time.
 */

export const alt = 'Aperçu du projet'
export const size = TAILLE
export const contentType = TYPE

export function generateStaticParams() {
  return projets.map(p => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const projet = projets.find(p => p.slug === slug) ?? projets[0]
  const svg = await readFile(join(process.cwd(), 'public', projet.imageUrl))
  const cover = `data:image/svg+xml;base64,${svg.toString('base64')}`
  // The first five tools, so one line always holds them
  const stack = projet.stack.slice(0, 5).join(' · ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          gap: 56,
          padding: 64,
          background: COULEURS.page,
          color: COULEURS.texte,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <Signature taille={36} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span style={{ fontSize: 20, color: COULEURS.accentClair }}>{`${projet.contexte} · ${projet.annee}`}</span>
            <span style={{ fontSize: projet.title.length > 18 ? 52 : 62, lineHeight: 1.05 }}>{projet.title}</span>
            <span style={{ fontSize: 26, lineHeight: 1.35, color: COULEURS.secondaire }}>{projet.tagline}</span>
          </div>
          <span style={{ fontSize: 20, color: COULEURS.secondaire }}>{stack}</span>
        </div>
        {/* The cover, in a frame like the project's card */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'center',
            width: 520,
            height: 295,
            borderRadius: 20,
            border: `1px solid ${COULEURS.ligne}`,
            background: COULEURS.surface,
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} width={520} height={295} alt="" style={{ objectFit: 'cover' }} />
        </div>
      </div>
    ),
    TAILLE,
  )
}
