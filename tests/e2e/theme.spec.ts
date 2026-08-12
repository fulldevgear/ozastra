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

test.beforeEach(({ page }, testInfo) => {
  void page
  test.skip(testInfo.project.name !== 'chromium')
})

test('uses the system light preference when no choice is stored', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(
    page.getByRole('button', { name: 'Activer le thème sombre' }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    )
    .toBe('rgb(243, 240, 232)')
})

test('persists a keyboard theme choice across navigation and reload', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  const toggle = page.getByRole('button', { name: 'Activer le thème clair' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toBeEnabled()
  await toggle.focus()
  await expect(toggle).toBeFocused()
  await toggle.press('Enter')

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ozastra-theme')))
    .toBe('light')

  await page.goto('/about')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('applies a stored choice before hydration even when the system differs', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => localStorage.setItem('ozastra-theme', 'light'))
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')
})

test('keeps the WebGL artifact synchronized with a live theme change', async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
  })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Activer le thème clair' })
  await expect(toggle).toBeEnabled()
  await page.mouse.move(10, 10)
  await page.mouse.move(240, 240)

  const artifact = page.locator('[data-orbital-canvas="true"]')
  await expect(artifact).toHaveAttribute('data-orbital-theme', 'dark', {
    timeout: 15_000,
  })
  await expect(artifact.locator('canvas')).toBeVisible()

  await toggle.click()

  await expect(artifact).toHaveAttribute('data-orbital-theme', 'light')
})

test('styles the reduced-motion fallback from the light palette', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await page.goto('/')

  await expect(page.locator('.orbital-fallback__ring--two').first()).toHaveCSS(
    'border-color',
    'rgba(52, 87, 213, 0.56)',
  )
  await expect(page.locator('canvas')).toHaveCount(0)
})

for (const viewport of [
  { name: 'mobile', width: 360, height: 780 },
  { name: 'desktop', width: 1440, height: 900 },
] as const) {
  test(`keeps every light route readable without overflow on ${viewport.name}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.setViewportSize(viewport)

    for (const route of publicRoutes) {
      await page.goto(route)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
      await expect(page.locator('main')).toBeVisible()

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      )
      expect(
        overflow,
        `${route} overflows in light mode on ${viewport.name}`,
      ).toBeLessThanOrEqual(1)
    }
  })
}

test('has no detectable WCAG A/AA violations in light mode', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })

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
