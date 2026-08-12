import {
  defaultLocale,
  getLocaleDefinition,
  localizePath,
  publishedLocales,
} from '../i18n/locales'
import type { Locale } from '../i18n/locales'
import { getSeoCopy } from '../i18n/seo-copy'

type StructuredData = Record<string, unknown>

type SeoInput = {
  locale: Locale
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

export function localizedAbsoluteUrl(locale: Locale, path: string) {
  return absoluteUrl(localizePath(locale, path))
}

export function createSeoHead({
  locale,
  title,
  description,
  path,
  type = 'website',
  structuredData = [],
}: SeoInput) {
  const definition = getLocaleDefinition(locale)
  const localizedCopy = getSeoCopy(locale)
  const url = localizedAbsoluteUrl(locale, path)
  const alternateLocales = publishedLocales.filter(
    (candidate) => candidate !== locale,
  )

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:site_name', content: 'Ozastra' },
      { property: 'og:locale', content: definition.ogLocale },
      ...alternateLocales.map((candidate) => ({
        property: 'og:locale:alternate',
        content: getLocaleDefinition(candidate).ogLocale,
      })),
      { property: 'og:type', content: type },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { property: 'og:image', content: absoluteUrl('/og/ozastra-og.png') },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: localizedCopy.imageAlt },
      { name: 'twitter:image', content: absoluteUrl('/og/ozastra-og.png') },
      { name: 'twitter:image:alt', content: localizedCopy.imageAlt },
    ],
    links: [
      { rel: 'canonical', href: url },
      ...publishedLocales.map((candidate) => ({
        rel: 'alternate',
        hreflang: getLocaleDefinition(candidate).htmlLang,
        href: localizedAbsoluteUrl(candidate, path),
      })),
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: localizedAbsoluteUrl(defaultLocale, path),
      },
    ],
    scripts: structuredData.map((value) => ({
      type: 'application/ld+json',
      children: JSON.stringify(value),
    })),
  }
}

export function organizationStructuredData(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ozastra',
    legalName: 'Ozastra LLC',
    url: siteUrl,
    email: 'hello@ozastra.com',
    description: getSeoCopy(locale).organizationDescription,
    inLanguage: getLocaleDefinition(locale).htmlLang,
  }
}

export function websiteStructuredData(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ozastra',
    url: localizedAbsoluteUrl(locale, '/'),
    inLanguage: getLocaleDefinition(locale).htmlLang,
  }
}
