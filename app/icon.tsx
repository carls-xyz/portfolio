import { ImageResponse } from 'next/og'
import { COULEURS, bestioleSvg } from '@/lib/partage'

/* The tab's icon: the default creature on the page's dark background */

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: COULEURS.page,
          borderRadius: 14,
        }}
      >
        <img src={bestioleSvg()} width={48} height={40} alt="" />
      </div>
    ),
    size,
  )
}
