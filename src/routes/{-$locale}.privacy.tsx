import { createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { resolveRouteLocale } from '../i18n/navigation'
import { seoCopy } from '../i18n/seo-copy'
import { useMessage } from '../i18n/use-message'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/privacy')({
  head: ({ params }) => {
    const locale = resolveRouteLocale(params.locale)
    return createSeoHead({
      locale,
      ...seoCopy[locale].privacy,
      path: '/privacy',
    })
  },
  component: PrivacyPage,
})

function PrivacyPage() {
  const message = useMessage()

  return (
    <PageShell>
      <div className="page-container legal-copy">
        <PageIntro
          eyebrow={message(copy.privacy.eyebrow)}
          title={message(copy.privacy.title)}
          description={message(copy.privacy.description)}
        />
        <section>
          <h2>{message(copy.privacy.collectedTitle)}</h2>
          <p>{message(copy.privacy.collectedText)}</p>
        </section>
        <section>
          <h2>{message(copy.privacy.basisTitle)}</h2>
          <p>{message(copy.privacy.basisText)}</p>
        </section>
        <section>
          <h2>{message(copy.privacy.recipientsTitle)}</h2>
          <p>{message(copy.privacy.recipientsText)}</p>
        </section>
        <section>
          <h2>{message(copy.privacy.rightsTitle)}</h2>
          <p>
            {message(copy.privacy.rightsBefore)}{' '}
            <a href="mailto:hello@ozastra.com">hello@ozastra.com</a>.{' '}
            {message(copy.privacy.rightsAfter)}
          </p>
        </section>
        <section>
          <h2>{message(copy.privacy.analyticsTitle)}</h2>
          <p>{message(copy.privacy.analyticsText)}</p>
        </section>
      </div>
    </PageShell>
  )
}
