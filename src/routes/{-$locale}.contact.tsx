import { createFileRoute } from '@tanstack/react-router'

import { ContactForm } from '../components/ContactForm'
import { PageIntro, PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { useMessage } from '../i18n/use-message'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/contact')({
  head: () =>
    createSeoHead({
      title: 'Contact — Ozastra',
      description:
        'Présentez votre projet web, IA, SaaS ou mobile à Ozastra et recevez une première réponse structurée.',
      path: '/contact',
    }),
  component: ContactPage,
})

function ContactPage() {
  const message = useMessage()

  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow={message(copy.contact.eyebrow)}
          title={message(copy.contact.title)}
          description={message(copy.contact.description)}
        />
        <section className="contact-panel">
          <div>
            <ContactForm />
          </div>
          <div>
            <p className="eyebrow">{message(copy.contact.prepare)}</p>
            <ul>
              <li>{message(copy.contact.prepareProblem)}</li>
              <li>{message(copy.contact.prepareState)}</li>
              <li>{message(copy.contact.prepareTimeline)}</li>
              <li>{message(copy.contact.prepareBudget)}</li>
            </ul>
            <p className="contact-alternative">
              {message(copy.contact.alternativeBefore)}{' '}
              <a href="mailto:hello@ozastra.com?subject=Ozastra%20project">
                hello@ozastra.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
