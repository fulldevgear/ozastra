import { describe, expect, it } from 'vitest'

import { getSeoCopy } from '../i18n/seo-copy'
import {
  createSeoHead,
  organizationStructuredData,
  websiteStructuredData,
} from './seo'

describe('localized SEO', () => {
  it.each([
    ['en', 'https://ozastra.com/about', 'en_US'],
    ['fr', 'https://ozastra.com/fr/about', 'fr_FR'],
  ] as const)(
    'builds canonical metadata for %s',
    (locale, canonical, ogLocale) => {
      const head = createSeoHead({
        locale,
        ...getSeoCopy(locale).about,
        path: '/about',
      })

      expect(head.links).toContainEqual({ rel: 'canonical', href: canonical })
      expect(head.links).toContainEqual({
        rel: 'alternate',
        hrefLang: 'x-default',
        href: 'https://ozastra.com/about',
      })
      expect(head.links).toContainEqual({
        rel: 'alternate',
        hrefLang: 'fr',
        href: 'https://ozastra.com/fr/about',
      })
      expect(head.meta).toContainEqual({
        property: 'og:locale',
        content: ogLocale,
      })
    },
  )

  it('localizes organization and website structured data', () => {
    expect(organizationStructuredData('fr').inLanguage).toBe('fr')
    expect(websiteStructuredData('fr').url).toBe('https://ozastra.com/fr')
    expect(websiteStructuredData('en').url).toBe('https://ozastra.com/')
  })
})
