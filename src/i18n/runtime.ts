import { setupI18n } from '@lingui/core'
import type { I18n, Messages } from '@lingui/core'

import { publishedCatalogLoaders } from '../generated/catalog-loaders'
import { isLocale } from './locales'
import type { Locale } from './locales'

type CatalogModule = {
  messages: Messages
}

const catalogCache = new Map<Locale, Promise<Messages>>()

export async function loadCatalog(locale: Locale) {
  const cached = catalogCache.get(locale)
  if (cached) return cached

  const loader = (
    publishedCatalogLoaders as Partial<
      Record<string, () => Promise<CatalogModule>>
    >
  )[locale]
  if (!loader) {
    throw new Error(
      `No compiled message catalog exists for locale "${locale}".`,
    )
  }

  const messages = loader().then((catalog) => catalog.messages)
  catalogCache.set(locale, messages)
  return messages
}

export async function createI18n(locale: Locale): Promise<I18n> {
  const messages = await loadCatalog(locale)

  return setupI18n({
    locale,
    messages: { [locale]: messages },
  })
}

export async function createI18nFromLocale(value: string) {
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale "${value}".`)
  }
  return createI18n(value)
}
