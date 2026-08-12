import { describe, expect, it } from 'vitest'

import { createI18n, createI18nFromLocale, loadCatalog } from './runtime'

describe('Lingui runtime', () => {
  it('creates isolated locale instances for concurrent rendering', async () => {
    const [english, french] = await Promise.all([
      createI18n('en'),
      createI18n('fr'),
    ])

    expect(english).not.toBe(french)
    expect(english.locale).toBe('en')
    expect(french.locale).toBe('fr')
  })

  it('caches immutable catalog loading without sharing i18n state', async () => {
    const [first, second] = await Promise.all([
      loadCatalog('en'),
      loadCatalog('en'),
    ])

    expect(first).toBe(second)
  })

  it('rejects unsupported locale values', async () => {
    await expect(createI18nFromLocale('es')).rejects.toThrow(
      'Unsupported locale',
    )
  })
})
