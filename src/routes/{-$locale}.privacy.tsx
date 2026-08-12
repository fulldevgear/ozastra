import { createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/privacy')({
  head: () =>
    createSeoHead({
      title: 'Confidentialité — Ozastra',
      description:
        'Découvrez quelles données Ozastra collecte, pourquoi elles sont traitées et comment exercer vos droits.',
      path: '/privacy',
    }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <PageShell>
      <div className="page-container legal-copy">
        <PageIntro
          eyebrow="Privacy"
          title="Politique de confidentialité"
          description="Une collecte minimale, expliquée simplement."
        />
        <section>
          <h2>Données collectées</h2>
          <p>
            Lorsque vous contactez Ozastra, les informations que vous
            transmettez volontairement — identité, adresse email et contenu de
            la demande — servent uniquement à traiter votre message et à assurer
            le suivi de la relation.
          </p>
        </section>
        <section>
          <h2>Base et durée de conservation</h2>
          <p>
            Le traitement repose sur votre demande de contact et, le cas
            échéant, sur l’intérêt légitime à assurer le suivi commercial. Les
            données sont conservées pendant la durée nécessaire à ces échanges,
            puis supprimées ou archivées selon les obligations applicables.
          </p>
        </section>
        <section>
          <h2>Destinataires et sous-traitants</h2>
          <p>
            Les données ne sont ni vendues ni louées. Les prestataires
            techniques strictement nécessaires à l’hébergement ou à
            l’acheminement des messages pourront les traiter selon leurs propres
            garanties contractuelles. La liste sera précisée avant le lancement
            public.
          </p>
        </section>
        <section>
          <h2>Vos droits</h2>
          <p>
            Vous pouvez demander l’accès, la rectification ou la suppression de
            vos données en écrivant à{' '}
            <a href="mailto:hello@ozastra.com">hello@ozastra.com</a>. Selon
            votre juridiction, d’autres droits peuvent s’appliquer.
          </p>
        </section>
        <section>
          <h2>Mesure d’audience et cookies</h2>
          <p>
            Ozastra mesure uniquement les pages consultées au moyen d’un
            endpoint interne. Cette mesure n’envoie ni paramètre d’URL, ni
            identifiant, ni empreinte du navigateur, ne dépose aucun cookie et
            respecte les signaux Do Not Track et Global Privacy Control. Les
            événements techniques sont conservés dans des journaux rotatifs à
            durée limitée. Aucun cookie publicitaire n’est utilisé.
          </p>
        </section>
      </div>
    </PageShell>
  )
}
