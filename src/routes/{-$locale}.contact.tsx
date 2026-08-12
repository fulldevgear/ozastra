import { createFileRoute } from '@tanstack/react-router'

import { ContactForm } from '../components/ContactForm'
import { PageIntro, PageShell } from '../components/SiteChrome'
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
  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow="Start a conversation"
          title="Parlons de ce que vous voulez rendre possible."
          description="Un contexte, un objectif et même quelques incertitudes suffisent pour commencer. Ozastra répond généralement sous deux jours ouvrés."
        />
        <section className="contact-panel">
          <div>
            <ContactForm />
          </div>
          <div>
            <p className="eyebrow">Pour gagner du temps</p>
            <ul>
              <li>Le problème ou l’opportunité</li>
              <li>L’état actuel du projet</li>
              <li>Le calendrier envisagé</li>
              <li>Une enveloppe budgétaire, si elle est définie</li>
            </ul>
            <p className="contact-alternative">
              Vous préférez votre messagerie ? Écrivez directement à{' '}
              <a href="mailto:hello@ozastra.com?subject=Projet%20Ozastra">
                hello@ozastra.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
