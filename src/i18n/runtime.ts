import { setupI18n } from '@lingui/core'
import type { I18n, Messages } from '@lingui/core'

import { isLocale } from './locales'
import type { Locale } from './locales'

type CatalogModule = {
  messages: Messages
}

const catalogLoaders = import.meta.glob<CatalogModule>(
  '../locales/*/messages.po',
)
const catalogCache = new Map<Locale, Promise<Messages>>()
const loadedCatalogs = new Map<Locale, Messages>()

function catalogPath(locale: Locale) {
  return `../locales/${locale}/messages.po`
}

export async function loadCatalog(locale: Locale) {
  const cached = catalogCache.get(locale)
  if (cached) return cached

  const loader = (
    catalogLoaders as Partial<Record<string, () => Promise<CatalogModule>>>
  )[catalogPath(locale)]
  if (!loader) {
    throw new Error(
      `No compiled message catalog exists for locale "${locale}".`,
    )
  }

  const messages = loader().then((catalog) => {
    loadedCatalogs.set(locale, catalog.messages)
    return catalog.messages
  })
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

export function createLoadedI18n(locale: Locale): I18n {
  const messages = loadedCatalogs.get(locale)
  if (!messages) {
    throw new Error(
      `Catalog for locale "${locale}" must be loaded before rendering.`,
    )
  }

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
