import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { PrivacyAnalytics } from '../components/PrivacyAnalytics'
import { organizationStructuredData } from '../lib/seo'
import { themeBootstrapScript } from '../lib/theme'
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
          'Ozastra conçoit et développe des expériences web, des produits SaaS, des applications mobiles et des solutions IA.',
      },
      { name: 'theme-color', content: '#07090F' },
    ],
    scripts: [
      {
        children: themeBootstrapScript,
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationStructuredData),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Ozastra',
          url: 'https://ozastra.com',
          inLanguage: 'fr-FR',
        }),
      },
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
  return (
    <main className="not-found">
      <p className="eyebrow">Erreur 404</p>
      <h1>Cette orbite ne mène nulle part.</h1>
      <p>La page recherchée a peut-être changé de trajectoire.</p>
      <Link className="button-primary" to="/">
        Revenir à l’accueil
      </Link>
    </main>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
