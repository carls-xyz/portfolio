import { ImageResponse } from 'next/og'
import { BESTIOLES } from '@/components/accueil/bestioles'
import { COULEURS, Signature, TAILLE, TYPE, bestioleSvg } from '@/lib/partage'

/* The share image of the home page, and of every page without its own */

export const alt = 'carls-xyz, portfolio de développeur web'
export const size = TAILLE
export const contentType = TYPE

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: COULEURS.page,
          color: COULEURS.texte,
        }}
      >
        <Signature />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 76, lineHeight: 1.05 }}>Portfolio</span>
          {/* The four creatures a visitor can pick, the first one in front */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            {BESTIOLES.map((b, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.id} src={bestioleSvg(b.id)} width={i === 0 ? 144 : 72} height={i === 0 ? 120 : 60} alt="" />
            ))}
          </div>
        </div>
      </div>
    ),
    TAILLE,
  )
}
