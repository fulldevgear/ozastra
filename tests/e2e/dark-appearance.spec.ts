import { expect, test } from '@playwright/test'

test.beforeEach(({ page }, testInfo) => {
  void page
  test.skip(testInfo.project.name !== 'chromium')
})

test('keeps the site dark when the system and an old preference request light', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => localStorage.setItem('ozastra-theme', 'light'))
  await page.goto('/')

  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(7, 9, 15)',
  )
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    'content',
    '#07090F',
  )
  await expect(page.locator('.theme-toggle')).toHaveCount(0)
})

test('keeps the reduced-motion fallback on the dark palette', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await page.goto('/')

  await expect(page.locator('.orbital-fallback__atmosphere').first()).toHaveCSS(
    'border-top-color',
    'rgba(91, 124, 255, 0.12)',
  )
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('serves the dark appearance without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    colorScheme: 'light',
    javaScriptEnabled: false,
  })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(7, 9, 15)',
  )
  await expect(page.locator('.theme-toggle')).toHaveCount(0)

  await context.close()
})
