import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const publicRoutes = [
  '/',
  '/about',
  '/services',
  '/work',
  '/work/orbit',
  '/work/axiom',
  '/contact',
  '/legal',
  '/privacy',
] as const

const viewports = [
  { name: 'mobile', width: 360, height: 780 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const

test('serves the browser security policy on public pages', async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')

  const response = await request.get('/')

  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  )
  expect(response.headers()['permissions-policy']).toBe(
    'camera=(), geolocation=(), microphone=()',
  )
  expect(response.headers()['referrer-policy']).toBe(
    'strict-origin-when-cross-origin',
  )
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['x-frame-options']).toBe('DENY')
})

for (const viewport of viewports) {
  test(`keeps every route readable without horizontal overflow at ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium')
    await page.setViewportSize(viewport)

    for (const route of publicRoutes) {
      await page.goto(route)
      await expect(page.locator('main')).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      )
      expect(
        overflow,
        `${route} overflows at ${viewport.name}`,
      ).toBeLessThanOrEqual(1)
    }
  })
}

test('has no automatically detectable WCAG A/AA violations', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')

  for (const route of publicRoutes) {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(
      results.violations,
      `${route}: ${results.violations
        .map((violation) => `${violation.id} (${violation.nodes.length})`)
        .join(', ')}`,
    ).toEqual([])
  }
})
