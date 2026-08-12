import {
  HeadContent,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { PrivacyAnalytics } from '../components/PrivacyAnalytics'
import { getLocaleDefinition, localizePath } from '../i18n/locales'
import type { Locale } from '../i18n/locales'
import { resolvePathLocale } from '../i18n/navigation'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      { title: 'Ozastra — Product engineering studio' },
      {
        name: 'description',
        content:
          'Ozastra designs and builds web experiences, SaaS products, mobile applications and applied AI solutions.',
      },
      { name: 'theme-color', content: '#07090F' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function NotFoundPage() {
  const locale = resolvePathLocale(useLocation().pathname)
  const content = notFoundFallback[locale] ?? defaultNotFoundFallback

  return (
    <main className="not-found">
      <p className="eyebrow">{content.eyebrow}</p>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      <a className="button-primary" href={localizePath(locale, '/')}>
        {content.action}
      </a>
    </main>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const locale = resolvePathLocale(useLocation().pathname)
  const definition = getLocaleDefinition(locale)

  return (
    <html lang={definition.htmlLang} dir={definition.direction}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <PrivacyAnalytics />
        <Scripts />
      </body>
    </html>
  )
}

const defaultNotFoundFallback = {
  eyebrow: 'Error 404',
  title: 'This orbit leads nowhere.',
  description: 'The page you are looking for may have changed trajectory.',
  action: 'Return home',
}

const notFoundFallback: Partial<
  Record<
    Locale,
    { eyebrow: string; title: string; description: string; action: string }
  >
> = {
  en: defaultNotFoundFallback,
  fr: {
    eyebrow: 'Erreur 404',
    title: 'Cette orbite ne mène nulle part.',
    description: 'La page recherchée a peut-être changé de trajectoire.',
    action: 'Revenir à l’accueil',
  },
}
