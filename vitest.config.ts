import mdx from '@mdx-js/rollup'
import babel from '@rolldown/plugin-babel'
import react from '@vitejs/plugin-react'
import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    { ...mdx(), enforce: 'pre' },
    react({ include: /\.(js|jsx|md|mdx|ts|tsx)$/ }),
    lingui({ failOnCompileError: true, failOnMissing: true }),
    babel({ presets: [linguiTransformerBabelPreset()] }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json-summary'],
    },
  },
})
