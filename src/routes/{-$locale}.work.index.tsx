import { Link, createFileRoute } from '@tanstack/react-router'

import { ProjectVisual } from '../components/ProjectVisual'
import { PageIntro, PageShell } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { resolveRouteLocale, routeLocaleParam } from '../i18n/navigation'
import { seoCopy } from '../i18n/seo-copy'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'
import { getProjects } from '../lib/content/projects'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/{-$locale}/work/')({
  loader: ({ context }) => getProjects(context.locale),
  head: ({ params }) => {
    const locale = resolveRouteLocale(params.locale)
    return createSeoHead({
      locale,
      ...seoCopy[locale].work,
      path: '/work',
    })
  },
  component: WorkPage,
})

function WorkPage() {
  const locale = useLocale()
  const localeParam = routeLocaleParam(locale)
  const message = useMessage()
  const projects = Route.useLoaderData()

  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow={message(copy.work.eyebrow)}
          title={message(copy.work.title)}
          description={message(copy.work.description)}
        />
        <div className="project-index">
          {projects.map((project, index) => (
            <article className="project-card group" key={project.slug}>
              <Link
                className="block"
                to="/{-$locale}/work/$slug"
                params={{ locale: localeParam, slug: project.slug }}
                aria-label={message(copy.work.discover, {
                  project: project.title,
                })}
              >
                <ProjectVisual tone={project.coverTone} />
              </Link>
              <div className="flex items-start justify-between gap-6 border-t border-line pt-6">
                <div>
                  <p className="text-xs tracking-[0.15em] text-muted uppercase">
                    {project.status === 'concept'
                      ? message(copy.home.conceptProduct)
                      : message(copy.work.clientWork)}
                  </p>
                  <h2 className="mt-3 text-3xl tracking-[-0.04em]">
                    <Link
                      className="project-title-link"
                      to="/{-$locale}/work/$slug"
                      params={{ locale: localeParam, slug: project.slug }}
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">
                    {project.summary}
                  </p>
                  <ul
                    className="mt-5 flex flex-wrap gap-2"
                    aria-label={message(copy.work.servicesLabel)}
                  >
                    {project.services.map((service) => (
                      <li className="tag" key={service}>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
