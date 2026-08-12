import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Suspense } from 'react'

import { ProjectVisual } from '../components/ProjectVisual'
import { PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { routeLocaleParam } from '../i18n/navigation'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'
import { getProject, getProjectComponent } from '../lib/content/projects'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/work/$slug')({
  loader: async ({ context, params }) => {
    const project = await getProject(context.locale, params.slug)
    if (!project) throw notFound()
    return project
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
  const locale = useLocale()
  const localeParam = routeLocaleParam(locale)
  const message = useMessage()
  const data = Route.useLoaderData()
  const Component = getProjectComponent(locale, data.slug)
  if (!Component) return null

  return (
    <PageShell>
      <article className="page-container case-study">
        <header className="case-study__header">
          <Link
            className="eyebrow case-study__back"
            to="/{-$locale}/work"
            params={{ locale: localeParam }}
          >
            {message(copy.work.allProjects)}
          </Link>
          <p className="eyebrow">
            {data.status === 'concept'
              ? message(copy.home.conceptProduct)
              : message(copy.work.clientWork)}{' '}
            · {data.year}
          </p>
          <h1>{data.title}</h1>
          <p className="case-study__summary">{data.summary}</p>
          <ul
            className="flex flex-wrap gap-2"
            aria-label={message(copy.work.servicesLabel)}
          >
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
            <dt>{message(copy.work.challenge)}</dt>
            <dd>{data.challenge}</dd>
          </div>
          <div>
            <dt>{message(copy.work.approach)}</dt>
            <dd>{data.approach}</dd>
          </div>
          <div>
            <dt>{message(copy.work.outcome)}</dt>
            <dd>{data.outcome}</dd>
          </div>
        </dl>

        <div className="case-content">
          <Suspense fallback={<div className="case-content__loading" />}>
            <Component />
          </Suspense>
        </div>

        <aside className="case-study__cta">
          <p className="eyebrow">{message(copy.work.ctaEyebrow)}</p>
          <h2>{message(copy.work.ctaTitle)}</h2>
          <Link
            className="button-primary"
            to="/{-$locale}/contact"
            params={{ locale: localeParam }}
          >
            {message(copy.work.ctaAction)}
          </Link>
        </aside>
      </article>
    </PageShell>
  )
}
