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

test('supports the main keyboard navigation path', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'webkit')

  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByText('Aller au contenu')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#content')).toBeFocused()
})

test('exposes the complete mobile navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome')

  await page.goto('/')
  await page.getByText('Menu', { exact: true }).click()
  const navigation = page.getByRole('navigation', { name: 'Navigation mobile' })
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link')).toHaveCount(4)
  await navigation.getByRole('link', { name: 'À propos' }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Une pratique indépendante',
  )
})

test('renders project routes and their unique metadata', async ({ page }) => {
  await page.goto('/work')
  await expect(page).toHaveTitle('Projets — Ozastra')
  await page.getByRole('link', { name: 'Découvrir Orbit' }).click()
  await expect(page).toHaveURL(/\/work\/orbit$/)
  await expect(page).toHaveTitle('Orbit — Concept SaaS par Ozastra')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Orbit')
})

test('cleans up and recreates the WebGL canvas across routes', async ({
  page,
}, testInfo) => {
  test.skip(['firefox', 'webkit'].includes(testInfo.project.name))

  await page.goto('/')
  const orbitalRender = page.locator(
    '.orbital-layer canvas, .orbital-layer .orbital-fallback',
  )
  await expect.poll(() => orbitalRender.count()).toBeGreaterThan(0)
  await page.goto('/about')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.orbital-fallback')).toHaveCount(0)
  await page.goto('/')
  await expect.poll(() => orbitalRender.count()).toBeGreaterThan(0)
})

test('uses the static artifact when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.orbital-layer .orbital-fallback')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
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

test('validates and submits the contact form through the server function', async ({
  page,
}) => {
  await page.goto('/contact')
  await expect(
    page.getByRole('button', { name: 'Envoyer la demande' }),
  ).toBeEnabled()
  await page.getByLabel('Nom').fill('Ada Lovelace')
  await page.getByLabel('Email professionnel').fill('ada@example.com')
  await page.getByLabel('Type de projet').selectOption('ai')
  await page
    .getByLabel('Votre projet')
    .fill('Nous voulons transformer un workflow métier complexe en produit.')
  await page.waitForTimeout(850)
  await page.getByRole('button', { name: 'Envoyer la demande' }).click()

  await expect(page.getByRole('alert')).toContainText(
    'L’envoi automatique est indisponible',
  )
  await expect(
    page.getByRole('link', { name: 'hello@ozastra.com' }).first(),
  ).toHaveAttribute('href', /mailto:/)
})
