import { defineConfig } from '@lingui/cli'
import { formatter } from '@lingui/format-po'
import { readFileSync } from 'node:fs'

type LocaleRegistryFile = {
  sourceLocale: string
  locales: Record<string, unknown>
}

const localeRegistry = JSON.parse(
  readFileSync(new URL('./src/i18n/locales.json', import.meta.url), 'utf8'),
) as LocaleRegistryFile

export default defineConfig({
  sourceLocale: localeRegistry.sourceLocale,
  locales: Object.keys(localeRegistry.locales),
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['<rootDir>/src'],
      exclude: ['<rootDir>/src/**/*.test.*', '<rootDir>/src/routeTree.gen.ts'],
    },
  ],
  format: formatter({ lineNumbers: false }),
})
