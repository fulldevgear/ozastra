import { I18nProvider } from '@lingui/react'
import { setupI18n } from '@lingui/core'
import type { Messages } from '@lingui/core'
import {
  Outlet,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { useMemo } from 'react'

import { defaultLocale, isPublishedLocale } from '../i18n/locales'
import { loadCatalog } from '../i18n/runtime'

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue }
type SerializableMessages = Record<string, SerializableValue>

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
    const messages = await loadCatalog(locale)

    return {
      locale,
      messages: messages as unknown as SerializableMessages,
    }
  },
  component: LocaleLayout,
})

function LocaleLayout() {
  const { locale, messages } = Route.useRouteContext()
  const i18n = useMemo(
    () =>
      setupI18n({
        locale,
        messages: { [locale]: messages as unknown as Messages },
      }),
    [locale, messages],
  )

  return (
    <I18nProvider i18n={i18n}>
      <Outlet />
    </I18nProvider>
  )
}
