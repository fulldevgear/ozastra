#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { format } from 'prettier'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registryPath = join(root, 'src', 'i18n', 'locales.json')
const seoCopyPath = join(root, 'src', 'i18n', 'seo-copy.json')
const generatedPath = join(root, 'src', 'generated', 'public-pages.json')
const catalogLoadersPath = join(root, 'src', 'generated', 'catalog-loaders.ts')
const sitemapPath = join(root, 'public', 'sitemap.xml')
const robotsPath = join(root, 'public', 'robots.txt')
const staticPaths = [
  '/',
  '/about',
  '/services',
  '/work',
  '/contact',
  '/legal',
  '/privacy',
]
const technicalRoutes = [
  '/sitemap.xml',
  '/robots.txt',
  '/site.webmanifest',
  '/og/ozastra-og.png',
  '/api/health',
]

function localizePath(definition, path) {
  if (!definition.prefix) return path
  return path === '/' ? `/${definition.prefix}` : `/${definition.prefix}${path}`
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function createOutput() {
  const registry = JSON.parse(await readFile(registryPath, 'utf8'))
  const seoCopy = JSON.parse(await readFile(seoCopyPath, 'utf8'))
  const publishedLocales = Object.entries(registry.locales).filter(
    ([, definition]) => definition.status === 'published',
  )
  if (publishedLocales.length === 0) {
    throw new Error('At least one locale must be published.')
  }

  const projectsByLocale = new Map()
  let sourceMessageIds
  for (const [locale] of publishedLocales) {
    const localizedSeo = seoCopy[locale]
    const requiredSeoKeys = [
      'home',
      'about',
      'services',
      'work',
      'contact',
      'legal',
      'privacy',
      'imageAlt',
      'projectsBreadcrumb',
      'organizationDescription',
    ]
    if (
      !localizedSeo ||
      requiredSeoKeys.some((key) => !localizedSeo[key]) ||
      requiredSeoKeys
        .filter((key) => typeof localizedSeo[key] === 'object')
        .some(
          (key) => !localizedSeo[key].title || !localizedSeo[key].description,
        )
    ) {
      throw new Error(`Published locale ${locale} has incomplete SEO copy.`)
    }

    const catalogPath = join(root, 'src', 'locales', locale, 'messages.po')
    const catalog = await readFile(catalogPath, 'utf8')
    const entries = catalog
      .split(/\n{2,}/)
      .map((block) => ({
        id: block.match(/^msgid "(.+)"$/m)?.[1],
        translation: block.match(/^msgstr "(.*)"$/m)?.[1],
      }))
      .filter((entry) => entry.id)
    const messageIds = entries.map((entry) => entry.id).sort()
    const missingMessages = entries
      .filter((entry) => !entry.translation)
      .map((entry) => entry.id)
    if (missingMessages.length) {
      throw new Error(
        `Published locale ${locale} has missing messages: ${missingMessages.join(', ')}.`,
      )
    }
    if (locale === registry.sourceLocale) sourceMessageIds = messageIds
    else if (
      sourceMessageIds &&
      JSON.stringify(messageIds) !== JSON.stringify(sourceMessageIds)
    ) {
      throw new Error(
        `Published locale ${locale} does not match the source catalog.`,
      )
    }

    const manifestPath = join(
      root,
      'src',
      'content',
      'projects',
      locale,
      'manifest.json',
    )
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (!Array.isArray(manifest)) {
      throw new Error(`${locale}/manifest.json must contain an array.`)
    }

    const slugs = manifest.map((project) => project.slug)
    if (new Set(slugs).size !== slugs.length) {
      throw new Error(`${locale}/manifest.json contains duplicate slugs.`)
    }
    for (const project of manifest) {
      if (project.locale !== locale || !project.slug) {
        throw new Error(`Invalid localized project entry in ${locale}.`)
      }
      const bodyPath = join(
        root,
        'src',
        'content',
        'projects',
        locale,
        `${project.slug}.mdx`,
      )
      if (!(await exists(bodyPath))) {
        throw new Error(`Missing ${locale} MDX body for ${project.slug}.`)
      }
    }
    projectsByLocale.set(locale, slugs.sort())
  }

  const sourceSlugs = projectsByLocale.get(registry.sourceLocale)
  if (!sourceSlugs) {
    throw new Error('The source locale must be published.')
  }
  for (const [locale] of publishedLocales) {
    const localizedSlugs = projectsByLocale.get(locale)
    if (JSON.stringify(localizedSlugs) !== JSON.stringify(sourceSlugs)) {
      throw new Error(
        `Published locale ${locale} must contain the same project slugs as ${registry.sourceLocale}.`,
      )
    }
  }

  const contentPaths = [
    ...staticPaths,
    ...sourceSlugs.map((slug) => `/work/${slug}`),
  ]
  const origin = (process.env.VITE_SITE_URL || 'https://ozastra.com').replace(
    /\/$/,
    '',
  )
  const pages = publishedLocales.flatMap(([locale, definition]) =>
    contentPaths.map((contentPath) => ({
      locale,
      path: localizePath(definition, contentPath),
      contentPath,
    })),
  )
  const alternates = (contentPath) => [
    ...publishedLocales.map(([locale, definition]) => ({
      hreflang: definition.htmlLang,
      href: `${origin}${localizePath(definition, contentPath)}`,
      locale,
    })),
    {
      hreflang: 'x-default',
      href: `${origin}${localizePath(
        registry.locales[registry.defaultLocale],
        contentPath,
      )}`,
      locale: registry.defaultLocale,
    },
  ]

  const generated = await format(
    JSON.stringify(
      {
        defaultLocale: registry.defaultLocale,
        publishedLocales: publishedLocales.map(([locale]) => locale),
        pages,
        technicalRoutes,
      },
      null,
      2,
    ),
    { parser: 'json' },
  )
  const catalogLoaders = await format(
    `// Generated by scripts/generate-i18n-output.mjs. Do not edit.\nexport const publishedCatalogLoaders = {\n${publishedLocales
      .map(
        ([locale]) =>
          `  '${locale}': () => import('../locales/${locale}/messages.po'),`,
      )
      .join('\n')}\n} as const\n`,
    { parser: 'typescript', semi: false, singleQuote: true },
  )
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(`${origin}${page.path}`)}</loc>
${alternates(page.contentPath)
  .map(
    (alternate) =>
      `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`,
  )
  .join('\n')}
  </url>`,
  )
  .join('\n')}
</urlset>
`

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`

  return {
    generated,
    catalogLoaders,
    sitemap,
    robots,
    pageCount: pages.length,
  }
}

async function main() {
  const check = process.argv.includes('--check')
  const output = await createOutput()

  if (check) {
    const [generated, catalogLoaders, sitemap, robots] = await Promise.all([
      readFile(generatedPath, 'utf8'),
      readFile(catalogLoadersPath, 'utf8'),
      readFile(sitemapPath, 'utf8'),
      readFile(robotsPath, 'utf8'),
    ])
    if (
      generated !== output.generated ||
      catalogLoaders !== output.catalogLoaders ||
      sitemap !== output.sitemap ||
      robots !== output.robots
    ) {
      throw new Error(
        'Generated i18n outputs are stale. Run pnpm generate:i18n-output.',
      )
    }
    console.log(`Validated ${output.pageCount} localized public pages.`)
    return
  }

  await mkdir(dirname(generatedPath), { recursive: true })
  await Promise.all([
    writeFile(generatedPath, output.generated),
    writeFile(catalogLoadersPath, output.catalogLoaders),
    writeFile(sitemapPath, output.sitemap),
    writeFile(robotsPath, output.robots),
  ])
  console.log(`Generated ${output.pageCount} localized public pages.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
