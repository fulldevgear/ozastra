import registryData from './locales.json'

export type Locale = keyof typeof registryData.locales
export type LocaleDirection = 'ltr' | 'rtl'
export type LocaleStatus = 'draft' | 'published'

export type LocaleDefinition = {
  label: string
  nativeLabel: string
  prefix: string
  htmlLang: string
  ogLocale: string
  direction: LocaleDirection
  status: LocaleStatus
}

type LocaleRegistry = {
  defaultLocale: Locale
  sourceLocale: Locale
  locales: Record<Locale, LocaleDefinition>
}

function canonicalLocale(code: string) {
  try {
    return Intl.getCanonicalLocales(code)[0]
  } catch {
    return undefined
  }
}

export function validateLocaleRegistry(value: unknown): LocaleRegistry {
  if (!value || typeof value !== 'object') {
    throw new Error('Locale registry must be an object.')
  }

  const candidate = value as {
    defaultLocale?: unknown
    sourceLocale?: unknown
    locales?: unknown
  }
  if (!candidate.locales || typeof candidate.locales !== 'object') {
    throw new Error('Locale registry must declare locales.')
  }

  const localeRecord = candidate.locales as Record<string, unknown>
  const localeEntries = Object.entries(localeRecord)
  if (localeEntries.length === 0) {
    throw new Error('Locale registry must contain at least one locale.')
  }

  if (
    typeof candidate.defaultLocale !== 'string' ||
    !(candidate.defaultLocale in localeRecord)
  ) {
    throw new Error('Default locale must reference a registered locale.')
  }

  if (
    typeof candidate.sourceLocale !== 'string' ||
    !(candidate.sourceLocale in localeRecord)
  ) {
    throw new Error('Source locale must reference a registered locale.')
  }

  const prefixes = new Set<string>()
  for (const [code, rawDefinition] of localeEntries) {
    if (canonicalLocale(code) !== code) {
      throw new Error(`Locale "${code}" must use its canonical BCP 47 form.`)
    }
    if (!rawDefinition || typeof rawDefinition !== 'object') {
      throw new Error(`Locale "${code}" must define its metadata.`)
    }

    const definition = rawDefinition as Partial<LocaleDefinition>
    if (!definition.label?.trim() || !definition.nativeLabel?.trim()) {
      throw new Error(`Locale "${code}" must define both labels.`)
    }
    if (definition.htmlLang !== code) {
      throw new Error(`Locale "${code}" must use the same htmlLang.`)
    }
    if (!definition.ogLocale?.match(/^[a-z]{2,3}_[A-Z]{2}$/)) {
      throw new Error(`Locale "${code}" has an invalid Open Graph locale.`)
    }
    if (!['ltr', 'rtl'].includes(definition.direction ?? '')) {
      throw new Error(`Locale "${code}" has an invalid text direction.`)
    }
    if (!['draft', 'published'].includes(definition.status ?? '')) {
      throw new Error(`Locale "${code}" has an invalid publication status.`)
    }

    const expectedPrefix =
      code === candidate.defaultLocale ? '' : code.toLowerCase()
    if (definition.prefix !== expectedPrefix) {
      throw new Error(`Locale "${code}" must use prefix "${expectedPrefix}".`)
    }
    if (prefixes.has(definition.prefix)) {
      throw new Error(`Locale prefix "${definition.prefix}" is duplicated.`)
    }
    prefixes.add(definition.prefix)
  }

  return candidate as LocaleRegistry
}

export const localeRegistry = validateLocaleRegistry(registryData)
export const defaultLocale = localeRegistry.defaultLocale
export const sourceLocale = localeRegistry.sourceLocale
export const locales = Object.keys(localeRegistry.locales) as Locale[]
export const publishedLocales = locales.filter(
  (locale) => localeRegistry.locales[locale].status === 'published',
)

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && value in localeRegistry.locales
}

export function isPublishedLocale(value: string | undefined): value is Locale {
  return isLocale(value) && localeRegistry.locales[value].status === 'published'
}

export function getLocaleDefinition(locale: Locale) {
  return localeRegistry.locales[locale]
}

export function localizePath(locale: Locale, path: string) {
  const normalizedPath =
    path === '' ? '/' : path.startsWith('/') ? path : `/${path}`
  const { prefix } = getLocaleDefinition(locale)

  if (!prefix) return normalizedPath
  if (normalizedPath === '/') return `/${prefix}`
  return `/${prefix}${normalizedPath}`
}
