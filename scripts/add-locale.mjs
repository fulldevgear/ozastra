#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(scriptDirectory, '..')
const registryPath = join(projectRoot, 'src', 'i18n', 'locales.json')

function usage() {
  console.log(`Usage:
  pnpm locale:add -- <locale> <native-label> <og-locale> [ltr|rtl] [--dry-run]

Example:
  pnpm locale:add -- es "Español" es_ES ltr`)
}

function canonicalizeLocale(value) {
  try {
    return Intl.getCanonicalLocales(value)[0]
  } catch {
    return undefined
  }
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const rawArguments = process.argv
    .slice(2)
    .filter((argument) => argument !== '--')
  const dryRun = rawArguments.includes('--dry-run')
  const [rawLocale, nativeLabel, ogLocale, direction = 'ltr'] =
    rawArguments.filter((argument) => argument !== '--dry-run')

  if (!rawLocale || !nativeLabel || !ogLocale) {
    usage()
    process.exitCode = 1
    return
  }

  const locale = canonicalizeLocale(rawLocale)
  if (!locale || locale !== rawLocale) {
    throw new Error(
      `Locale must use its canonical BCP 47 form${locale ? `: ${locale}` : ''}.`,
    )
  }
  if (!ogLocale.match(/^[a-z]{2,3}_[A-Z]{2}$/)) {
    throw new Error('Open Graph locale must look like es_ES or pt_BR.')
  }
  if (!['ltr', 'rtl'].includes(direction)) {
    throw new Error('Direction must be ltr or rtl.')
  }

  const registry = JSON.parse(await readFile(registryPath, 'utf8'))
  if (registry.locales[locale]) {
    throw new Error(`Locale "${locale}" already exists.`)
  }

  registry.locales[locale] = {
    label: nativeLabel,
    nativeLabel,
    prefix: locale.toLowerCase(),
    htmlLang: locale,
    ogLocale,
    direction,
    status: 'draft',
  }

  const catalogDirectory = join(projectRoot, 'src', 'locales', locale)
  const catalogPath = join(catalogDirectory, 'messages.po')
  const contentDirectory = join(
    projectRoot,
    'src',
    'content',
    'projects',
    locale,
  )
  const contentReadmePath = join(contentDirectory, 'README.md')
  const manifestPath = join(contentDirectory, 'manifest.json')

  if (await exists(catalogPath)) {
    throw new Error(`Catalog already exists at ${catalogPath}.`)
  }
  if (await exists(contentReadmePath)) {
    throw new Error(`Content scaffold already exists at ${contentReadmePath}.`)
  }
  if (await exists(manifestPath)) {
    throw new Error(`Project manifest already exists at ${manifestPath}.`)
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          locale,
          definition: registry.locales[locale],
          files: [catalogPath, manifestPath, contentReadmePath],
        },
        null,
        2,
      ),
    )
    return
  }

  await mkdir(catalogDirectory, { recursive: true })
  await mkdir(contentDirectory, { recursive: true })
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
  await writeFile(
    catalogPath,
    `msgid ""\nmsgstr ""\n"Content-Type: text/plain; charset=utf-8\\n"\n"Language: ${locale}\\n"\n`,
  )
  await writeFile(manifestPath, '[]\n')
  await writeFile(
    contentReadmePath,
    `# ${nativeLabel} project translations\n\nAdd one localized MDX file for every published project before promoting this locale from \`draft\` to \`published\`.\n`,
  )

  console.log(`Created draft locale "${locale}".`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
