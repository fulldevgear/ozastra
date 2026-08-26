import { expect, test } from '@playwright/test'

test('renders the Ozastra proposition and core sections', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Ozastra/)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /Digital products, engineered with taste/i,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /Selected work/i }),
  ).toHaveCount(0)
  await expect(page.locator('#work')).toBeVisible()
  await expect(page.locator('#expertise')).toBeVisible()
  await expect(page.locator('#contact')).toBeVisible()
})

test('keeps the wrapped editorial hero lines visually separated', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  const viewports = [
    { width: 1117, height: 837 },
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.goto('/')

    const editorialLine = page.locator('#top h1 span.font-editorial')
    const metrics = await editorialLine.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      }
    })

    expect(metrics.lineHeight / metrics.fontSize).toBeGreaterThanOrEqual(0.97)
    expect(metrics.horizontalOverflow).toBe(false)
  }
})

test('supports the main keyboard navigation path', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'webkit')

  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByText('Skip to content')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#content')).toBeFocused()
})

test('exposes the complete mobile navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome')

  await page.goto('/')
  await page.getByText('Menu', { exact: true }).click()
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link')).toHaveCount(4)
  await navigation.getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'An independent practice',
  )
})

test('renders project routes and their unique metadata', async ({ page }) => {
  await page.goto('/work')
  await expect(page).toHaveTitle('Work — Ozastra')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: 'Discover Orbit' }).click()
  await expect(page).toHaveURL(/\/work\/orbit$/)
  await expect(page).toHaveTitle('Orbit — SaaS product concept by Ozastra')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Orbit')
})

test('cleans up and recreates the WebGL canvas across routes', async ({
  page,
}, testInfo) => {
  test.skip(['firefox', 'webkit'].includes(testInfo.project.name))

  await page.goto('/')
  const orbitalRender = page.locator(
    '.orbital-layer canvas, .orbital-layer .orbital-fallback, .orbital-layer [data-orbital-loading="true"]',
  )
  await expect
    .poll(() => orbitalRender.count(), { timeout: 15_000 })
    .toBeGreaterThan(0)
  await page.goto('/about')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.orbital-fallback')).toHaveCount(0)
  await page.goto('/')
  await expect.poll(() => orbitalRender.count()).toBeGreaterThan(0)
})

test('starts Three.js automatically after a refresh without user input', async ({
  page,
}, testInfo) => {
  test.skip(['firefox', 'webkit'].includes(testInfo.project.name))
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const canvas = page.locator('.orbital-layer canvas')
  const canvasShell = page.locator('[data-orbital-canvas="true"]')
  const fallback = page.locator('.orbital-layer .orbital-fallback')
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  await expect(canvasShell).toHaveAttribute('data-orbital-ready', 'true', {
    timeout: 15_000,
  })
  await expect
    .poll(
      () =>
        canvasShell.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).opacity),
        ),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0.99)
  await expect
    .poll(
      () =>
        canvasShell.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            transform: style.transform,
            willChange: style.willChange,
          }
        }),
      { timeout: 15_000 },
    )
    .toEqual({ transform: 'none', willChange: 'auto' })
  await expect(fallback).toBeHidden()

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  await expect(canvasShell).toHaveAttribute('data-orbital-ready', 'true', {
    timeout: 15_000,
  })
  await expect
    .poll(
      () =>
        canvasShell.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).opacity),
        ),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0.99)
  await expect(fallback).toBeHidden()
})

test('keeps the loading frame neutral on load and refresh while Three.js is delayed', async ({
  page,
}, testInfo) => {
  test.skip(['firefox', 'webkit'].includes(testInfo.project.name))
  await page.emulateMedia({ reducedMotion: 'no-preference' })

  let releaseChunk = () => {}
  let chunkGate: Promise<void>
  const resetChunkGate = () => {
    chunkGate = new Promise<void>((resolve) => {
      releaseChunk = resolve
    })
  }
  resetChunkGate()

  await page.route(
    '**/src/features/orbital/OrbitalExperience.tsx*',
    async (route) => {
      await chunkGate
      await route.continue()
    },
  )

  const loadingPlaceholder = page.locator('[data-orbital-loading="true"]')
  const canvas = page.locator('.orbital-layer canvas')
  const canvasShell = page.locator('[data-orbital-canvas="true"]')

  for (const load of [
    () => page.goto('/', { waitUntil: 'domcontentloaded' }),
    () => page.reload({ waitUntil: 'domcontentloaded' }),
  ]) {
    await load()
    await expect(loadingPlaceholder).toBeVisible()
    await expect(page.locator('.orbital-fallback')).toHaveCount(0)
    await expect(page.locator('.orbital-fallback__planet')).toHaveCount(0)

    releaseChunk()
    await expect(canvas).toBeVisible({ timeout: 15_000 })
    await expect(canvasShell).toHaveAttribute('data-orbital-ready', 'true')
    const revealStart = await canvasShell.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        transitionDuration: style.transitionDuration,
        transitionProperty: style.transitionProperty,
      }
    })
    expect(revealStart.transitionDuration).toContain('1.6s')
    expect(revealStart.transitionProperty).toBe('opacity')
    await expect
      .poll(() =>
        canvasShell.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).opacity),
        ),
      )
      .toBeGreaterThan(0.99)
    await expect
      .poll(() =>
        canvasShell.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            transform: style.transform,
            willChange: style.willChange,
          }
        }),
      )
      .toEqual({ transform: 'none', willChange: 'auto' })
    await expect(loadingPlaceholder).toHaveCount(0)
    resetChunkGate()
  }
})

test('uses the static artifact when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const fallback = page.locator('.orbital-layer .orbital-fallback')
  await expect(fallback).toBeVisible({ timeout: 15_000 })
  await expect(fallback).toHaveAttribute('data-orbital-fallback-state', 'hero')
  await expect(fallback.locator('.orbital-fallback__planet')).toBeVisible()
  await expect(fallback.locator('.orbital-fallback__seed')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('keeps the initial HTML neutral before Three.js starts', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')

  await expect(page.locator('[data-orbital-pre-hydration="true"]')).toBeHidden()
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /Digital products, engineered with taste/i,
    }),
  ).toBeVisible()

  await context.close()
})

test('serves the static orbital fallback before hydration for reduced motion', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/')

  const fallback = page.locator('[data-orbital-pre-hydration="true"]')
  await expect(fallback).toBeVisible()
  await expect(fallback.locator('.orbital-fallback__planet')).toBeVisible()
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /Digital products, engineered with taste/i,
    }),
  ).toBeVisible()

  await context.close()
})

test('maps real section positions to orbital story stages', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome')

  await page.goto('/')
  await expect
    .poll(
      async () => {
        await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
        return page.locator('html').getAttribute('data-orbital-stage')
      },
      { timeout: 15_000 },
    )
    .not.toBeNull()
  await page.locator('[data-orbital-stage="web"]').evaluate((element) => {
    document.documentElement.style.scrollBehavior = 'auto'
    const top = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top - window.innerHeight * 0.52)
  })
  await expect(page.locator('html')).toHaveAttribute(
    'data-orbital-stage',
    'web',
    {
      timeout: 10_000,
    },
  )

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  )
  await expect(page.locator('html')).toHaveAttribute(
    'data-orbital-stage',
    'convergence',
    { timeout: 10_000 },
  )
})

test('exposes a valid static contact email form without an API call', async ({
  page,
}) => {
  const apiRequests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/')) {
      apiRequests.push(request.url())
    }
  })

  await page.goto('/contact')
  const form = page.locator('form')
  await expect(
    page.getByRole('button', { name: 'Prepare email' }),
  ).toBeEnabled()
  await expect(form).toHaveAttribute('action', 'mailto:hello@ozastra.com')
  await expect(form).toHaveAttribute('method', 'post')
  await expect(form).toHaveAttribute('enctype', 'text/plain')
  await page.getByLabel('Name').fill('Ada Lovelace')
  await page.getByLabel('Work email').fill('ada@example.com')
  await page.getByLabel('Project type').selectOption('ai')
  await page
    .getByLabel('Your project')
    .fill('We want to turn a complex business workflow into a clear product.')

  expect(
    await form.evaluate((element) =>
      (element as HTMLFormElement).checkValidity(),
    ),
  ).toBe(true)
  expect(apiRequests).toEqual([])
})
