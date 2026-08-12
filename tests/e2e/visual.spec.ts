import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function activateOrbital(page: Page) {
  await expect
    .poll(
      async () => {
        await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
        return page.locator('canvas').count()
      },
      { timeout: 15_000 },
    )
    .toBe(1)
}

async function settleStage(page: Page, stage: 'hero' | 'web' | 'convergence') {
  await page.evaluate(() =>
    window.dispatchEvent(new Event('ozastra:resume-orbital')),
  )

  if (stage === 'convergence') {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    )
  } else {
    await page
      .locator(`main [data-orbital-stage="${stage}"]`)
      .evaluate((element) => {
        document.documentElement.style.scrollBehavior = 'auto'
        const top = element.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.52))
      })
  }

  await expect(page.locator('html')).toHaveAttribute(
    'data-orbital-stage',
    stage,
    {
      timeout: 10_000,
    },
  )
  await page.waitForTimeout(1_200)
  await page.evaluate(() =>
    window.dispatchEvent(new Event('ozastra:freeze-orbital')),
  )
  await page.waitForTimeout(100)
}

test('keeps the orbital keyframes visually stable', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  test.skip(
    process.platform !== 'darwin',
    'Golden images are calibrated on macOS',
  )
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?visual-test=1')
  await page.waitForLoadState('networkidle')
  await page.locator('.orbital-layer').evaluate((element) => {
    element.style.background = 'var(--color-ink)'
  })
  await activateOrbital(page)

  for (const stage of ['hero', 'web', 'convergence'] as const) {
    await settleStage(page, stage)
    await expect(page.locator('.orbital-layer')).toHaveScreenshot(
      `orbital-${stage}.png`,
      { maxDiffPixelRatio: 0.03 },
    )
  }
})
