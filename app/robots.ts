import type { MetadataRoute } from 'next'
import { URL_SITE } from '@/lib/partage'

/* Everything is public except the API routes; the sitemap lists the pages */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${URL_SITE}/sitemap.xml`,
  }
}
