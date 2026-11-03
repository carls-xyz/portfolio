/*
 * One 8 × 7 pixel glyph per project (B blue, L light blue, . empty), shown on
 * the creature's laptop when a project is hovered.
 */
export const ECRANS: Record<string, string[]> = {
  'rag-doc-assistant': ['.BBBBBB.', '.B....B.', '.B.LL.B.', '.B....B.', '.B.LL.B.', '.B....B.', '.BBBBBB.'],
  'assistant-email-n8n': ['........', 'BBBBBBBB', 'BB....BB', 'B.B..B.B', 'B..BB..B', 'B......B', 'BBBBBBBB'],
  'parc-activites': ['........', '.BBBBBB.', '........', '..BBBBB.', '........', '...LLLL.', '........'],
  pixeltrader: ['........', '......L.', '....B.L.', '..B.B.L.', '..B.B.L.', 'B.B.B.L.', '........'],
  portfolio: ['BBBBBBBB', 'B.L.L..B', 'BBBBBBBB', 'B......B', 'B.LLLL.B', 'B......B', 'BBBBBBBB'],
  'crud-securise': ['.BBBBBB.', '.B....B.', '.B...LB.', '.BL.L.B.', '..BL.B..', '...BB...', '........'],
  'gestion-classes-symfony': ['BB......', 'BB......', '.B......', '.BBBBBB.', '......LL', '......LL', '........'],
  'emotions-project': ['.BBBBBB.', 'B......B', 'B.L..L.B', 'B......B', 'B.B..B.B', 'B..BB..B', '.BBBBBB.'],
}
