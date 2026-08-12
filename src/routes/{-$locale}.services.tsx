import { Link, createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { resolveRouteLocale, routeLocaleParam } from '../i18n/navigation'
import { seoCopy } from '../i18n/seo-copy'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/services')({
  head: ({ params }) => {
    const locale = resolveRouteLocale(params.locale)
    return createSeoHead({
      locale,
      ...seoCopy[locale].services,
      path: '/services',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@type': 'Organization', name: 'Ozastra' },
          serviceType: 'Product engineering',
          areaServed: 'Worldwide',
          inLanguage: locale,
        },
      ],
    })
  },
  component: ServicesPage,
})

const services = [
  {
    number: '01',
    title: 'Web experiences',
    promise: copy.services.webPromise,
    scope: [
      copy.services.webScope1,
      copy.services.webScope2,
      copy.services.webScope3,
      copy.services.webScope4,
    ],
  },
  {
    number: '02',
    title: 'Applied AI',
    promise: copy.services.aiPromise,
    scope: [
      copy.services.aiScope1,
      copy.services.aiScope2,
      copy.services.aiScope3,
      copy.services.aiScope4,
    ],
  },
  {
    number: '03',
    title: 'SaaS products',
    promise: copy.services.saasPromise,
    scope: [
      copy.services.saasScope1,
      copy.services.saasScope2,
      copy.services.saasScope3,
      copy.services.saasScope4,
    ],
  },
  {
    number: '04',
    title: 'Mobile apps',
    promise: copy.services.mobilePromise,
    scope: [
      copy.services.mobileScope1,
      copy.services.mobileScope2,
      copy.services.mobileScope3,
      copy.services.mobileScope4,
    ],
  },
  {
    number: '05',
    title: 'Product partnership',
    promise: copy.services.partnershipPromise,
    scope: [
      copy.services.partnershipScope1,
      copy.services.partnershipScope2,
      copy.services.partnershipScope3,
      copy.services.partnershipScope4,
    ],
  },
] as const

function ServicesPage() {
  const locale = useLocale()
  const message = useMessage()

  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow={message(copy.services.eyebrow)}
          title={message(copy.services.title)}
          description={message(copy.services.description)}
        />

        <section
          className="service-index"
          aria-label={message(copy.services.label)}
        >
          {services.map((service) => (
            <article key={service.number}>
              <span className="service-index__number">{service.number}</span>
              <div>
                <h2>{service.title}</h2>
                <p>{message(service.promise)}</p>
              </div>
              <ul>
                {service.scope.map((item) => (
                  <li key={item.id}>{message(item)}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="engagements">
          <div>
            <p className="eyebrow">{message(copy.services.waysEyebrow)}</p>
            <h2>{message(copy.services.waysTitle)}</h2>
          </div>
          <div className="engagements__list">
            <article>
              <h3>Focus sprint</h3>
              <p>{message(copy.services.sprintText)}</p>
            </article>
            <article>
              <h3>Build partnership</h3>
              <p>{message(copy.services.buildText)}</p>
            </article>
            <article>
              <h3>Embedded expertise</h3>
              <p>{message(copy.services.embeddedText)}</p>
            </article>
          </div>
        </section>

        <div className="page-cta">
          <p className="eyebrow">{message(copy.services.ctaEyebrow)}</p>
          <h2>{message(copy.services.ctaTitle)}</h2>
          <Link
            className="button-primary"
            to="/{-$locale}/contact"
            params={{ locale: routeLocaleParam(locale) }}
          >
            {message(copy.services.ctaAction)}
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
