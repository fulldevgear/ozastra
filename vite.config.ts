import mdx from '@mdx-js/rollup'
import babel from '@rolldown/plugin-babel'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

import publicPages from './src/generated/public-pages.json' with { type: 'json' }

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    { ...mdx(), enforce: 'pre' },
    tailwindcss(),
    tanstackStart({
      pages: publicPages.pages.map(({ path }) => ({
        path,
        prerender: { enabled: true, crawlLinks: false },
      })),
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
    }),
    nitro({ preset: 'node-server' }),
    viteReact({ include: /\.(js|jsx|md|mdx|ts|tsx)$/ }),
    lingui({ failOnCompileError: true, failOnMissing: true }),
    babel({ presets: [linguiTransformerBabelPreset()] }),
  ],
})
