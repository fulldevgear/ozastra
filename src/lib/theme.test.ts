import { describe, expect, it } from 'vitest'

import { isTheme, resolveTheme, themeBootstrapScript } from './theme'

describe('theme preference', () => {
  it('keeps an explicit stored choice ahead of the system preference', () => {
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('light', false)).toBe('light')
  })

  it('falls back to the system preference when no choice is stored', () => {
    expect(resolveTheme(null, true)).toBe('light')
    expect(resolveTheme(null, false)).toBe('dark')
  })

  it('rejects unknown values and emits a bootstrap script without dependencies', () => {
    expect(isTheme('sepia')).toBe(false)
    expect(themeBootstrapScript).toContain('prefers-color-scheme: light')
    expect(themeBootstrapScript).toContain('ozastra-theme')
  })
})
