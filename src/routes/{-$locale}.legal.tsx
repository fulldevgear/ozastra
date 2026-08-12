import { createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/legal')({
  head: () =>
    createSeoHead({
      title: 'Mentions légales — Ozastra',
      description:
        'Informations légales, propriété intellectuelle et responsabilité relatives au site Ozastra.',
      path: '/legal',
    }),
  component: LegalPage,
})

function LegalPage() {
  return (
    <PageShell>
      <div className="page-container legal-copy">
        <PageIntro
          eyebrow="Legal"
          title="Mentions légales"
          description="Informations relatives à l’éditeur du site Ozastra."
        />
        <section>
          <h2>Éditeur</h2>
          <p>
            Le présent site est édité par Ozastra LLC. Les informations
            d’immatriculation et l’adresse du siège seront complétées avant la
            mise en production publique.
          </p>
          <p>
            Contact : <a href="mailto:hello@ozastra.com">hello@ozastra.com</a>
          </p>
        </section>
        <section>
          <h2>Hébergement</h2>
          <p>
            Les coordonnées de l’hébergeur seront ajoutées dès la plateforme de
            production sélectionnée.
          </p>
        </section>
        <section>
          <h2>Propriété intellectuelle</h2>
          <p>
            Les textes, éléments graphiques, interfaces et créations présentés
            sur ce site sont protégés. Toute reproduction ou adaptation
            nécessite l’autorisation écrite préalable d’Ozastra LLC, sauf
            disposition légale contraire.
          </p>
        </section>
        <section>
          <h2>Responsabilité</h2>
          <p>
            Ozastra s’efforce de fournir des informations exactes et à jour. Les
            contenus conceptuels présentés ne constituent ni une promesse de
            résultat ni la représentation d’une mission client réelle.
          </p>
        </section>
      </div>
    </PageShell>
  )
}
