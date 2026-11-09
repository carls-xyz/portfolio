import { ImageResponse } from 'next/og'
import { COULEURS, bestioleSvg } from '@/lib/partage'

/* The icon iOS shows when the site is added to the home screen (iOS rounds the corners itself) */

export const size = { width: 180, height: 180 }
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
        }}
      >
        <img src={bestioleSvg()} width={120} height={100} alt="" />
      </div>
    ),
    size,
  )
}
