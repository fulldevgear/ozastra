import {
  defaultLocale,
  getLocaleDefinition,
  isPublishedLocale,
  localizePath,
} from './locales'
import type { Locale } from './locales'

export function routeLocaleParam(locale: Locale) {
  return locale === defaultLocale ? undefined : locale
}

export function resolveRouteLocale(locale: string | undefined): Locale {
  return isPublishedLocale(locale) ? locale : defaultLocale
}

export function resolvePathLocale(pathname: string): Locale {
  const [firstSegment] = pathname.split('/').filter(Boolean)
  return resolveRouteLocale(firstSegment)
}

export function unlocalizePath(pathname: string) {
  const [firstSegment] = pathname.split('/').filter(Boolean)
  if (!isPublishedLocale(firstSegment) || firstSegment === defaultLocale) {
    return pathname || '/'
  }

  const prefix = `/${getLocaleDefinition(firstSegment).prefix}`
  const unprefixed = pathname.slice(prefix.length)
  return unprefixed || '/'
}

export function switchLocalePath(pathname: string, locale: Locale) {
  return localizePath(locale, unlocalizePath(pathname))
}
