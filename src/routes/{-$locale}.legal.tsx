import { createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { resolveRouteLocale } from '../i18n/navigation'
import { seoCopy } from '../i18n/seo-copy'
import { useMessage } from '../i18n/use-message'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/legal')({
  head: ({ params }) => {
    const locale = resolveRouteLocale(params.locale)
    return createSeoHead({
      locale,
      ...seoCopy[locale].legal,
      path: '/legal',
    })
  },
  component: LegalPage,
})

function LegalPage() {
  const message = useMessage()

  return (
    <PageShell>
      <div className="page-container legal-copy">
        <PageIntro
          eyebrow={message(copy.legal.eyebrow)}
          title={message(copy.legal.title)}
          description={message(copy.legal.description)}
        />
        <section>
          <h2>{message(copy.legal.publisherTitle)}</h2>
          <p>{message(copy.legal.publisherText)}</p>
          <p>
            {message(copy.legal.contact)}{' '}
            <a href="mailto:hello@ozastra.com">hello@ozastra.com</a>
          </p>
        </section>
        <section>
          <h2>{message(copy.legal.hostingTitle)}</h2>
          <p>{message(copy.legal.hostingText)}</p>
        </section>
        <section>
          <h2>{message(copy.legal.intellectualTitle)}</h2>
          <p>{message(copy.legal.intellectualText)}</p>
        </section>
        <section>
          <h2>{message(copy.legal.liabilityTitle)}</h2>
          <p>{message(copy.legal.liabilityText)}</p>
        </section>
      </div>
    </PageShell>
  )
}
