import mdx from '@mdx-js/rollup'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    { ...mdx(), enforce: 'pre' },
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    nitro({ preset: 'node-server' }),
    viteReact({ include: /\.(js|jsx|md|mdx|ts|tsx)$/ }),
  ],
})
