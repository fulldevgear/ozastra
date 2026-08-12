import { describe, expect, it } from 'vitest'

import {
  defaultLocale,
  isLocale,
  isPublishedLocale,
  localeRegistry,
  localizePath,
  publishedLocales,
  sourceLocale,
  validateLocaleRegistry,
} from './locales'

describe('locale registry', () => {
  it('uses English as source and unprefixed default', () => {
    expect(defaultLocale).toBe('en')
    expect(sourceLocale).toBe('en')
    expect(localeRegistry.locales.en.prefix).toBe('')
    expect(publishedLocales).toEqual(['en', 'fr'])
  })

  it('localizes paths without branching outside the registry', () => {
    expect(localizePath('en', '/services')).toBe('/services')
    expect(localizePath('fr', '/services')).toBe('/fr/services')
    expect(localizePath('fr', '/')).toBe('/fr')
    expect(localizePath('en', '')).toBe('/')
  })

  it('distinguishes registered and published locales', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isPublishedLocale('fr')).toBe(true)
    expect(isLocale('es')).toBe(false)
  })

  it('rejects an invalid default prefix', () => {
    expect(() =>
      validateLocaleRegistry({
        defaultLocale: 'en',
        sourceLocale: 'en',
        locales: {
          en: {
            ...localeRegistry.locales.en,
            prefix: 'en',
          },
        },
      }),
    ).toThrow('must use prefix')
  })

  it('rejects incomplete published locale metadata', () => {
    expect(() =>
      validateLocaleRegistry({
        defaultLocale: 'en',
        sourceLocale: 'en',
        locales: {
          en: {
            ...localeRegistry.locales.en,
            ogLocale: 'en',
          },
        },
      }),
    ).toThrow('invalid Open Graph locale')
  })

  it('accepts an RTL draft locale without publishing it', () => {
    const registry = validateLocaleRegistry({
      defaultLocale: 'en',
      sourceLocale: 'en',
      locales: {
        en: localeRegistry.locales.en,
        ar: {
          label: 'Arabic',
          nativeLabel: 'العربية',
          prefix: 'ar',
          htmlLang: 'ar',
          ogLocale: 'ar_AE',
          direction: 'rtl',
          status: 'draft',
        },
      },
    })

    const arabic = (
      registry.locales as unknown as Record<
        string,
        { direction: string; status: string }
      >
    ).ar
    expect(arabic).toMatchObject({ direction: 'rtl', status: 'draft' })
  })
})
