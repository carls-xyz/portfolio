/*
 * The four creatures a visitor can pick on the home page. Each one has its own
 * shape and colours, and sets the site's accent (the [data-bestiole] blocks in
 * globals.css). Shapes are 12 × 9 pixels: X body, O shade, A detail (leaf,
 * flame tip, inner ears and nose), W eye white, P pupil, . empty.
 */

export type IdBestiole = 'bleu' | 'mousse' | 'braise' | 'guimauve'

export type Bestiole = {
  id: IdBestiole
  nom: string
  corps: string[]
  couleurs: { X: string; O: string; A: string }
}

export const BESTIOLES: Bestiole[] = [
  {
    id: 'bleu',
    nom: 'Bleu',
    corps: [
      '....XXXX....',
      '..XXXXXXXX..',
      '.XXXXXXXXXX.',
      'XXXXXXXXXXXX',
      'XXWWXXXXWWXX',
      'XXWPXXXXWPXX',
      'XXXXXXXXXXXX',
      'OXXXXXXXXXXO',
      '.OOOOOOOOOO.',
    ],
    couleurs: { X: '#61a7d5', O: '#4a86ad', A: '#4a86ad' },
  },
  {
    id: 'mousse',
    nom: 'Mousse',
    corps: [
      '......AA....',
      '....AAA.....',
      '...XXXXXX...',
      '..XXXXXXXX..',
      '..XWWXXWWX..',
      '..XWPXXWPX..',
      '..XXXXXXXX..',
      '..OXXXXXXO..',
      '...OOOOOO...',
    ],
    couleurs: { X: '#7ebf7a', O: '#5a9a57', A: '#a8dc78' },
  },
  {
    id: 'braise',
    nom: 'Braise',
    corps: [
      '......A.....',
      '.....AXA....',
      '....XXXX.A..',
      '..XXXXXXXX..',
      '.XXWWXXWWXX.',
      '.XXWPXXWPXX.',
      '.XXXXXXXXXX.',
      '..OXXXXXXO..',
      '...OOOOOO...',
    ],
    couleurs: { X: '#ee8a52', O: '#c4662f', A: '#f7d26a' },
  },
  {
    id: 'guimauve',
    nom: 'Guimauve',
    corps: [
      '..X......X..',
      '..XA....AX..',
      '..XXXXXXXX..',
      '.XXXXXXXXXX.',
      '.XWWXXXXWWX.',
      '.XWPXXXXWPX.',
      '.XXXXAAXXXX.',
      '.OXXXXXXXXO.',
      '..OOOOOOOO..',
    ],
    couleurs: { X: '#e48cb0', O: '#c06890', A: '#b85583' },
  },
]

export const CLE_BESTIOLE = 'bestiole'
