#!/usr/bin/env node

import { readFile } from 'node:fs/promises'

const baseUrl = (process.env.OZASTRA_SMOKE_BASE_URL || '').replace(/\/$/, '')
if (!baseUrl || !URL.canParse(baseUrl)) {
  console.error(
    'Set OZASTRA_SMOKE_BASE_URL to the public origin, for example https://ozastra.com.',
  )
  process.exit(1)
}

const expectedSiteUrl = (
  process.env.OZASTRA_EXPECTED_SITE_URL || baseUrl
).replace(/\/$/, '')
const generated = JSON.parse(
  await readFile(
    new URL('../src/generated/public-pages.json', import.meta.url),
    'utf8',
  ),
)
const failures = []

for (const page of generated.pages) {
  const response = await fetch(`${baseUrl}${page.path}`, {
    headers: { 'User-Agent': 'Ozastra GitHub Pages smoke test' },
  })
  if (response.status !== 200) {
    failures.push(`${page.path}: expected 200, received ${response.status}`)
    continue
  }

  const html = await response.text()
  const expectedCanonical = `${expectedSiteUrl}${page.path}`
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) {
    failures.push(`${page.path}: canonical URL is not ${expectedCanonical}`)
  }
  if (!html.includes(`<html lang="${page.locale}"`)) {
    failures.push(`${page.path}: html language is not ${page.locale}`)
  }
}

for (const route of [
  '/sitemap.xml',
  '/robots.txt',
  '/site.webmanifest',
  '/og/ozastra-og.png',
]) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: { 'User-Agent': 'Ozastra GitHub Pages smoke test' },
  })
  if (response.status !== 200) {
    failures.push(`${route}: expected 200, received ${response.status}`)
  }
}

const missing = await fetch(`${baseUrl}/this-route-must-not-exist`)
if (missing.status !== 404) {
  failures.push(
    `/this-route-must-not-exist: expected 404, received ${missing.status}`,
  )
}

const analytics = await fetch(`${baseUrl}/api/analytics`)
if (analytics.status !== 404) {
  failures.push(
    `/api/analytics: expected no static endpoint (404), received ${analytics.status}`,
  )
}

if (failures.length) {
  console.error(`GitHub Pages smoke test failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `GitHub Pages smoke test passed for ${generated.pages.length} localized pages and the static technical assets.`,
)
