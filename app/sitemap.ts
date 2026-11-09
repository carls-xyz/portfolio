import type { MetadataRoute } from 'next'
import { projets } from '@/data/projets'
import { URL_SITE } from '@/lib/partage'

/* The pages search engines should know: the three main ones and one per project */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: URL_SITE, priority: 1 },
    { url: `${URL_SITE}/projets`, priority: 0.8 },
    { url: `${URL_SITE}/contact`, priority: 0.5 },
    ...projets.map(p => ({ url: `${URL_SITE}/projets/${p.slug}`, priority: 0.6 })),
  ]
}
