import { readFile } from 'node:fs/promises'

const baseUrl = (process.env.OZASTRA_SMOKE_BASE_URL || '').replace(/\/$/, '')
const expectedSiteUrl = (
  process.env.OZASTRA_EXPECTED_SITE_URL || baseUrl
).replace(/\/$/, '')

if (!baseUrl || !URL.canParse(baseUrl)) {
  console.error(
    'Set OZASTRA_SMOKE_BASE_URL to the public origin, for example https://ozastra.com.',
  )
  process.exit(1)
}

const generated = JSON.parse(
  await readFile(
    new URL('../src/generated/public-pages.json', import.meta.url),
  ),
)
const failures = []

for (const page of generated.pages) {
  const response = await fetch(`${baseUrl}${page.path}`, {
    headers: { 'User-Agent': 'Ozastra production smoke test' },
    redirect: 'manual',
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

for (const route of generated.technicalRoutes) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: { 'User-Agent': 'Ozastra production smoke test' },
    redirect: 'manual',
  })
  if (response.status !== 200) {
    failures.push(`${route}: expected 200, received ${response.status}`)
  }
}

const home = await fetch(`${baseUrl}/`)
const homeHtml = await home.text()
if (!homeHtml.includes(`${expectedSiteUrl}/og/ozastra-og.png`)) {
  failures.push('/: Open Graph image does not use the production origin')
}

for (const header of [
  'content-security-policy',
  'permissions-policy',
  'referrer-policy',
  'x-content-type-options',
]) {
  if (!home.headers.has(header)) {
    failures.push(`/: missing ${header} response header`)
  }
}

const englishPrefix = await fetch(`${baseUrl}/en/about`, {
  redirect: 'manual',
})
if (
  englishPrefix.status !== 301 ||
  englishPrefix.headers.get('location') !== '/about'
) {
  failures.push('/en/about: expected a permanent redirect to /about')
}

const missing = await fetch(`${baseUrl}/this-route-must-not-exist`, {
  redirect: 'manual',
})
if (missing.status !== 404) {
  failures.push(
    `/this-route-must-not-exist: expected 404, received ${missing.status}`,
  )
}

const analytics = await fetch(`${baseUrl}/api/analytics`, {
  body: JSON.stringify({ path: '/smoke-test' }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
})
if (analytics.status !== 204) {
  failures.push(`/api/analytics: expected 204, received ${analytics.status}`)
}

if (failures.length > 0) {
  console.error(`Production smoke test failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `Production smoke test passed for ${generated.pages.length} localized pages and ${generated.technicalRoutes.length} technical endpoints.`,
)
