import { Link, createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { routeLocaleParam } from '../i18n/navigation'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/about')({
  head: () =>
    createSeoHead({
      title: 'À propos — Ozastra',
      description:
        'Ozastra est un studio indépendant de product engineering qui réunit stratégie, design et développement.',
      path: '/about',
    }),
  component: AboutPage,
})

function AboutPage() {
  const locale = useLocale()
  const message = useMessage()

  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow={message(copy.about.eyebrow)}
          title={message(copy.about.title)}
          description={message(copy.about.description)}
        />
        <section className="editorial-grid">
          <div>
            <p className="eyebrow">{message(copy.about.conviction)}</p>
          </div>
          <div>
            <h2>{message(copy.about.continuityTitle)}</h2>
            <p>{message(copy.about.continuityP1)}</p>
            <p>{message(copy.about.continuityP2)}</p>
          </div>
        </section>
        <section
          className="values-grid"
          aria-label={message(copy.about.principlesLabel)}
        >
          {[
            {
              number: '01',
              title: copy.about.clarityTitle,
              text: copy.about.clarityText,
            },
            {
              number: '02',
              title: copy.about.rigorTitle,
              text: copy.about.rigorText,
            },
            {
              number: '03',
              title: copy.about.collaborationTitle,
              text: copy.about.collaborationText,
            },
          ].map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <h3>{message(item.title)}</h3>
              <p>{message(item.text)}</p>
            </article>
          ))}
        </section>
        <div className="page-cta">
          <h2>{message(copy.about.ctaTitle)}</h2>
          <Link
            className="button-primary"
            to="/{-$locale}/contact"
            params={{ locale: routeLocaleParam(locale) }}
          >
            {message(copy.about.ctaAction)}
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
