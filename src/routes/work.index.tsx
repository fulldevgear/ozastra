import { Link, createFileRoute } from '@tanstack/react-router'

import { ProjectVisual } from '../components/ProjectVisual'
import { PageIntro, PageShell } from '../components/SiteChrome'
import { projects } from '../lib/content/projects'
import { createSeoHead } from '../lib/seo'

export const Route = createFileRoute('/work/')({
  head: () =>
    createSeoHead({
      title: 'Projets — Ozastra',
      description:
        'Découvrez les études et concepts Ozastra en product engineering, SaaS, IA appliquée et expérience web.',
      path: '/work',
    }),
  component: WorkPage,
})

function WorkPage() {
  return (
    <PageShell>
      <div className="page-container">
        <PageIntro
          eyebrow="Selected work"
          title="Des produits pensés comme des systèmes cohérents."
          description="Des études conceptuelles qui rendent visible notre manière d’aborder la stratégie, l’expérience et l’ingénierie. Les projets clients seront publiés avec leur accord."
        />
        <div className="project-index">
          {projects.map(({ data }, index) => (
            <article className="project-card group" key={data.slug}>
              <Link
                className="block"
                to="/work/$slug"
                params={{ slug: data.slug }}
                aria-label={`Découvrir ${data.title}`}
              >
                <ProjectVisual tone={data.coverTone} />
              </Link>
              <div className="flex items-start justify-between gap-6 border-t border-line pt-6">
                <div>
                  <p className="text-xs tracking-[0.15em] text-muted uppercase">
                    {data.status === 'concept'
                      ? 'Concept product'
                      : 'Client work'}
                  </p>
                  <h2 className="mt-3 text-3xl tracking-[-0.04em]">
                    <Link
                      className="project-title-link"
                      to="/work/$slug"
                      params={{ slug: data.slug }}
                    >
                      {data.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">
                    {data.summary}
                  </p>
                  <ul
                    className="mt-5 flex flex-wrap gap-2"
                    aria-label="Services"
                  >
                    {data.services.map((service) => (
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
