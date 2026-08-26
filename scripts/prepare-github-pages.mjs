#!/usr/bin/env node

import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const publicDirectory = new URL('../.output/public/', import.meta.url)
const generated = JSON.parse(
  await readFile(
    new URL('../src/generated/public-pages.json', import.meta.url),
    'utf8',
  ),
)

const pageOutputPath = (path) =>
  path === '/'
    ? join(publicDirectory.pathname, 'index.html')
    : join(publicDirectory.pathname, path.slice(1), 'index.html')

const missingPages = []
for (const page of generated.pages) {
  try {
    await readFile(pageOutputPath(page.path), 'utf8')
  } catch {
    missingPages.push(page.path)
  }
}

if (missingPages.length) {
  throw new Error(
    `GitHub Pages artifact is missing: ${missingPages.join(', ')}`,
  )
}

const indexPath = join(publicDirectory.pathname, 'index.html')
const indexHtml = await readFile(indexPath, 'utf8')
if (!indexHtml.includes('https://ozastra.com/')) {
  throw new Error('The Pages artifact does not target https://ozastra.com.')
}

await copyFile(indexPath, join(publicDirectory.pathname, '404.html'))
await writeFile(join(publicDirectory.pathname, '.nojekyll'), '', 'utf8')

console.log(
  `Prepared GitHub Pages artifact with ${generated.pages.length} localized pages, 404 fallback and .nojekyll.`,
)
