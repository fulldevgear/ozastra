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

const routes = [
  '/',
  '/about',
  '/services',
  '/work',
  '/work/orbit',
  '/work/axiom',
  '/contact',
  '/legal',
  '/privacy',
  '/sitemap.xml',
  '/robots.txt',
  '/site.webmanifest',
  '/og/ozastra-og.png',
  '/api/health',
]

const failures = []

for (const route of routes) {
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
const expectedCanonical = `${expectedSiteUrl}/`

if (!homeHtml.includes(`rel="canonical" href="${expectedCanonical}"`)) {
  failures.push(`/: canonical URL is not ${expectedCanonical}`)
}

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

console.log(`Production smoke test passed for ${routes.length} endpoints.`)
