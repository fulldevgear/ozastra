import { I18nProvider } from '@lingui/react'
import {
  Outlet,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { useMemo } from 'react'

import { defaultLocale, isPublishedLocale } from '../i18n/locales'
import { createLoadedI18n, loadCatalog } from '../i18n/runtime'

export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: async ({ location, params }) => {
    if (params.locale === defaultLocale) {
      const canonicalPath =
        location.pathname.replace(
          new RegExp(`^/${defaultLocale}(?=/|$)`),
          '',
        ) || '/'

      throw redirect({
        href: `${canonicalPath}${location.searchStr}${location.hash}`,
        statusCode: 301,
      })
    }

    const locale = params.locale ?? defaultLocale
    if (!isPublishedLocale(locale)) throw notFound()
    await loadCatalog(locale)

    return { locale }
  },
  component: LocaleLayout,
})

function LocaleLayout() {
  const { locale } = Route.useRouteContext()
  const i18n = useMemo(() => createLoadedI18n(locale), [locale])

  return (
    <I18nProvider i18n={i18n}>
      <Outlet />
    </I18nProvider>
  )
}
