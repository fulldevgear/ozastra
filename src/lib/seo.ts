type StructuredData = Record<string, unknown>

type SeoInput = {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  structuredData?: StructuredData[]
}

const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined
export const siteUrl = (configuredSiteUrl || 'https://ozastra.com').replace(
  /\/$/,
  '',
)

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString()
}

export function createSeoHead({
  title,
  description,
  path,
  type = 'website',
  structuredData = [],
}: SeoInput) {
  const url = absoluteUrl(path)

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:site_name', content: 'Ozastra' },
      { property: 'og:locale', content: 'fr_FR' },
      { property: 'og:type', content: type },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      {
        property: 'og:image',
        content: absoluteUrl('/og/ozastra-og.png'),
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Artefact orbital abstrait Ozastra' },
      {
        name: 'twitter:image',
        content: absoluteUrl('/og/ozastra-og.png'),
      },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: structuredData.map((value) => ({
      type: 'application/ld+json',
      children: JSON.stringify(value),
    })),
  }
}

export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ozastra',
  legalName: 'Ozastra LLC',
  url: siteUrl,
  email: 'hello@ozastra.com',
  description:
    'Studio indépendant de product engineering spécialisé en web, IA appliquée, SaaS et applications mobiles.',
}
