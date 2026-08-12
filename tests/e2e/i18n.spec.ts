import { expect, test } from '@playwright/test'

test('switches language by keyboard while preserving the current project', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'webkit')
  await page.goto('/work/orbit')

  const switcher = page.getByRole('navigation', { name: 'Language selection' })
  const french = switcher.getByRole('link', { name: 'Français' })
  await french.focus()
  await expect(french).toBeFocused()
  await french.press('Enter')

  await expect(page).toHaveURL(/\/fr\/work\/orbit$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(
    page.getByRole('heading', { name: 'Le signal avant le volume' }),
  ).toBeVisible()

  const englishSwitcher = page.getByRole('navigation', {
    name: 'Choix de la langue',
  })
  await englishSwitcher.getByRole('link', { name: 'English' }).press('Enter')
  await expect(page).toHaveURL(/\/work\/orbit$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('keeps locale switching available in the mobile header', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome')
  await page.goto('/fr/services')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

  const switcher = page.getByRole('navigation', { name: 'Choix de la langue' })
  await expect(switcher).toBeVisible()
  await switcher.getByRole('link', { name: 'English' }).tap()
  await expect(page).toHaveURL(/\/services$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'One product vision',
  )
})

test('serves meaningful English and French pages without JavaScript', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()

  for (const expectation of [
    { path: '/', lang: 'en', text: 'Digital products,' },
    { path: '/fr', lang: 'fr', text: 'Des produits numériques,' },
    { path: '/work/orbit', lang: 'en', text: 'Signal before volume' },
    { path: '/fr/work/orbit', lang: 'fr', text: 'Le signal avant le volume' },
  ]) {
    await page.goto(expectation.path)
    await expect(page.locator('html')).toHaveAttribute('lang', expectation.lang)
    await expect(
      page.getByText(expectation.text, { exact: false }).first(),
    ).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  }

  await context.close()
})

test('resists expanded pseudo-localized copy on narrow screens', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  await page.setViewportSize({ width: 360, height: 780 })

  for (const route of ['/services', '/contact', '/work/orbit']) {
    await page.goto(route)
    await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      )
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      for (const node of nodes) {
        const value = node.textContent.trim()
        if (value && value.length > 2) {
          node.textContent = `［${value.replaceAll(' ', ' · ')} — ${value}］`
        }
      }
    })

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    )
    expect(
      overflow,
      `${route} overflows with expanded copy`,
    ).toBeLessThanOrEqual(1)
  }
})

test('keeps the interface operable when document direction is RTL', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium')
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto('/services')
  await page.locator('html').evaluate((element) => {
    element.setAttribute('lang', 'ar')
    element.setAttribute('dir', 'rtl')
  })

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('body')).toHaveCSS('direction', 'rtl')
  const switcher = page.getByRole('navigation', { name: 'Language selection' })
  await switcher.getByRole('link', { name: 'English' }).focus()
  await expect(switcher.getByRole('link', { name: 'English' })).toBeFocused()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})
