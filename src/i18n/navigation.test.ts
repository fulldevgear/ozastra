import { describe, expect, it } from 'vitest'

import {
  resolvePathLocale,
  resolveRouteLocale,
  routeLocaleParam,
  switchLocalePath,
  unlocalizePath,
} from './navigation'

describe('localized navigation', () => {
  it('uses an omitted route parameter for English', () => {
    expect(routeLocaleParam('en')).toBeUndefined()
    expect(routeLocaleParam('fr')).toBe('fr')
  })

  it('resolves route and document locales with an English fallback', () => {
    expect(resolveRouteLocale(undefined)).toBe('en')
    expect(resolveRouteLocale('fr')).toBe('fr')
    expect(resolvePathLocale('/fr/work/orbit')).toBe('fr')
    expect(resolvePathLocale('/work/orbit')).toBe('en')
  })

  it('removes only published locale prefixes', () => {
    expect(unlocalizePath('/fr/services')).toBe('/services')
    expect(unlocalizePath('/fr')).toBe('/')
    expect(unlocalizePath('/services')).toBe('/services')
    expect(unlocalizePath('/es/services')).toBe('/es/services')
  })

  it('switches locale while preserving the route', () => {
    expect(switchLocalePath('/work/orbit', 'fr')).toBe('/fr/work/orbit')
    expect(switchLocalePath('/fr/work/orbit', 'en')).toBe('/work/orbit')
  })
})
