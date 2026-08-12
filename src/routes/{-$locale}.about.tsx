import { Link, createFileRoute } from '@tanstack/react-router'

import { PageIntro, PageShell } from '../components/SiteChrome'
import { routeLocaleParam } from '../i18n/navigation'
import { useLocale } from '../i18n/use-locale'
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

  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow="About Ozastra"
          title="Une pratique indépendante, du niveau stratégique jusqu’au détail livré."
          description="Ozastra est une LLC dédiée à la conception et au développement de produits numériques ambitieux. Un interlocuteur impliqué, une méthode lisible et le bon réseau de spécialistes lorsque le projet l’exige."
        />
        <section className="editorial-grid">
          <div>
            <p className="eyebrow">Notre conviction</p>
          </div>
          <div>
            <h2>La qualité se construit dans la continuité.</h2>
            <p>
              Les décisions produit, la direction visuelle et l’architecture
              technique ne devraient pas vivre dans des silos. Ozastra les
              considère comme les différentes faces d’un même système.
            </p>
            <p>
              Cette continuité réduit les pertes d’intention, accélère les
              arbitrages et produit des expériences plus nettes — à l’écran
              comme dans le code qui les soutient.
            </p>
          </div>
        </section>
        <section className="values-grid" aria-label="Principes de travail">
          {[
            [
              '01',
              'Clarté avant volume',
              'Comprendre le vrai problème avant d’ajouter des écrans, des modèles ou des fonctionnalités.',
            ],
            [
              '02',
              'Goût et rigueur',
              'Traiter la précision visuelle et la solidité technique comme deux exigences inséparables.',
            ],
            [
              '03',
              'Collaboration directe',
              'Partager les arbitrages, les risques et l’avancement sans couche de communication inutile.',
            ],
          ].map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <div className="page-cta">
          <h2>Vous avez une ambition claire — ou un problème encore flou ?</h2>
          <Link
            className="button-primary"
            to="/{-$locale}/contact"
            params={{ locale: routeLocaleParam(locale) }}
          >
            Parlons-en ↗
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
