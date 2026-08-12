import { Link, createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/services')({
  head: () =>
    createSeoHead({
      title: 'Services — Ozastra',
      description:
        'Product engineering, web, SaaS, IA appliquée, mobile et renfort produit : découvrez comment Ozastra peut intervenir.',
      path: '/services',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          provider: { '@type': 'Organization', name: 'Ozastra' },
          serviceType: 'Product engineering',
          areaServed: 'Worldwide',
        },
      ],
    }),
  component: ServicesPage,
})

const services = [
  {
    number: '01',
    title: 'Web experiences',
    promise:
      'Des sites et plateformes rapides, accessibles et mémorables qui rendent une proposition de valeur immédiatement lisible.',
    scope: [
      'Direction produit et architecture de l’information',
      'Design d’interface et prototypage',
      'Développement React et intégrations',
      'Performance, accessibilité et SEO technique',
    ],
  },
  {
    number: '02',
    title: 'Applied AI',
    promise:
      'Des fonctionnalités IA focalisées sur une tâche réelle, avec des limites compréhensibles et des points de contrôle humains.',
    scope: [
      'Cadrage des cas d’usage et évaluation',
      'Agents, recherche augmentée et automatisations',
      'Interfaces de supervision et feedback',
      'Observabilité, sécurité et maîtrise des coûts',
    ],
  },
  {
    number: '03',
    title: 'SaaS products',
    promise:
      'Une expérience produit et une base technique cohérentes, capables de passer du premier usage à un système qui grandit proprement.',
    scope: [
      'Discovery et définition du MVP',
      'Workflows, permissions et logique métier',
      'Design system et développement full-stack',
      'Instrumentation et amélioration continue',
    ],
  },
  {
    number: '04',
    title: 'Mobile apps',
    promise:
      'Des applications fluides, tactiles et économes qui respectent les usages propres à chaque plateforme.',
    scope: [
      'Architecture des parcours mobiles',
      'Prototypage et interactions natives',
      'Développement cross-platform raisonné',
      'Préparation stores, qualité et suivi',
    ],
  },
  {
    number: '05',
    title: 'Product partnership',
    promise:
      'Un renfort senior autonome pour débloquer un chantier, élever le niveau d’exécution ou porter une initiative de bout en bout.',
    scope: [
      'Audit produit, design ou frontend',
      'Prototype stratégique et validation',
      'Mission freelance intégrée à l’équipe',
      'Accompagnement technique et transmission',
    ],
  },
] as const

function ServicesPage() {
  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow="Capabilities"
          title="Une vision produit, plusieurs disciplines mobilisées au bon moment."
          description="Ozastra intervient du cadrage au lancement. Le périmètre s’adapte au niveau de maturité du projet, sans transformer une mission claire en dispositif inutilement lourd."
        />

        <section className="service-index" aria-label="Services Ozastra">
          {services.map((service) => (
            <article key={service.number}>
              <span className="service-index__number">{service.number}</span>
              <div>
                <h2>{service.title}</h2>
                <p>{service.promise}</p>
              </div>
              <ul>
                {service.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="engagements">
          <div>
            <p className="eyebrow">Ways of working</p>
            <h2>Un format adapté au niveau d’incertitude.</h2>
          </div>
          <div className="engagements__list">
            <article>
              <h3>Focus sprint</h3>
              <p>
                Une à trois semaines pour clarifier, auditer ou matérialiser une
                direction avant un investissement plus important.
              </p>
            </article>
            <article>
              <h3>Build partnership</h3>
              <p>
                Un engagement par étapes pour concevoir, construire et mettre en
                production un produit ou une expérience complète.
              </p>
            </article>
            <article>
              <h3>Embedded expertise</h3>
              <p>
                Une mission ciblée au sein de votre équipe pour accélérer un
                chantier et laisser une base plus solide qu’à l’arrivée.
              </p>
            </article>
          </div>
        </section>

        <div className="page-cta">
          <p className="eyebrow">Un besoin ne rentre pas dans une case ?</p>
          <h2>Commençons par le résultat que vous cherchez.</h2>
          <Link className="button-primary" to="/contact">
            Présenter le projet ↗
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
