import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { ProjectVisual } from '../components/ProjectVisual'
import { PageShell } from '../components/SiteChrome'
import { getProject } from '../lib/content/projects'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    const project = getProject(params.slug)
    if (!project) throw notFound()
    return project.data
  },
  head: ({ loaderData }) =>
    loaderData
      ? createSeoHead({
          title: loaderData.seoTitle,
          description: loaderData.seoDescription,
          path: `/work/${loaderData.slug}`,
          type: 'article',
          structuredData: [
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Projets',
                  item: 'https://ozastra.com/work',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: loaderData.title,
                  item: `https://ozastra.com/work/${loaderData.slug}`,
                },
              ],
            },
          ],
        })
      : { meta: [] },
  component: ProjectPage,
})

function ProjectPage() {
  const data = Route.useLoaderData()
  const { slug } = Route.useParams()
  const project = getProject(slug)

  if (!project) return null

  const { Component } = project

  return (
    <PageShell>
      <article className="page-container case-study">
        <header className="case-study__header">
          <Link className="eyebrow case-study__back" to="/work">
            ← Tous les projets
          </Link>
          <p className="eyebrow">
            {data.status === 'concept' ? 'Concept product' : 'Client work'} ·{' '}
            {data.year}
          </p>
          <h1>{data.title}</h1>
          <p className="case-study__summary">{data.summary}</p>
          <ul className="flex flex-wrap gap-2" aria-label="Services">
            {data.services.map((service) => (
              <li className="tag" key={service}>
                {service}
              </li>
            ))}
          </ul>
        </header>

        <ProjectVisual tone={data.coverTone} />

        <dl className="case-study__facts">
          <div>
            <dt>Enjeu</dt>
            <dd>{data.challenge}</dd>
          </div>
          <div>
            <dt>Approche</dt>
            <dd>{data.approach}</dd>
          </div>
          <div>
            <dt>Résultat</dt>
            <dd>{data.outcome}</dd>
          </div>
        </dl>

        <div className="case-content">
          <Component />
        </div>

        <aside className="case-study__cta">
          <p className="eyebrow">Votre produit mérite la même précision</p>
          <h2>Passons de l’idée au système.</h2>
          <Link className="button-primary" to="/contact">
            Démarrer une conversation ↗
          </Link>
        </aside>
      </article>
    </PageShell>
  )
}
