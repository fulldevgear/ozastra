import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy, useEffect, useState } from 'react'

import { ProjectVisual } from '../components/ProjectVisual'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { copy } from '../i18n/messages'
import { routeLocaleParam } from '../i18n/navigation'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'
import { createSeoHead } from '../lib/seo'

const OrbitalExperience = lazy(
  () => import('../features/orbital/OrbitalExperience'),
)

export const Route = createFileRoute('/{-$locale}/')({
  head: () =>
    createSeoHead({
      title: 'Ozastra — Product engineering studio',
      description:
        'Ozastra conçoit et développe des expériences web, produits SaaS, applications mobiles et solutions IA remarquables.',
      path: '/',
    }),
  component: Home,
})

const work = [
  {
    index: '01',
    label: copy.home.conceptProduct,
    title: 'Orbit',
    slug: 'orbit',
    description: copy.home.orbitDescription,
    tags: ['Product strategy', 'SaaS', 'Data experience'],
    tone: 'blue',
  },
  {
    index: '02',
    label: copy.home.conceptProduct,
    title: 'Axiom',
    slug: 'axiom',
    description: copy.home.axiomDescription,
    tags: ['Applied AI', 'Web app', 'Interaction'],
    tone: 'violet',
  },
] as const

const expertise = [
  {
    number: '01',
    stage: 'web',
    title: 'Web experiences',
    description: copy.home.webDescription,
  },
  {
    number: '02',
    stage: 'ai',
    title: 'Applied AI',
    description: copy.home.aiDescription,
  },
  {
    number: '03',
    stage: 'saas',
    title: 'SaaS products',
    description: copy.home.saasDescription,
  },
  {
    number: '04',
    stage: 'mobile',
    title: 'Mobile apps',
    description: copy.home.mobileDescription,
  },
] as const

const process = [
  copy.home.clarify,
  copy.home.design,
  copy.home.build,
  copy.home.launch,
  copy.home.improve,
]

function OrbitalFallback() {
  return (
    <div className="orbital-fallback" aria-hidden="true">
      <span className="orbital-fallback__core" />
      <span className="orbital-fallback__ring orbital-fallback__ring--one" />
      <span className="orbital-fallback__ring orbital-fallback__ring--two" />
      <span className="orbital-fallback__ring orbital-fallback__ring--three" />
      <span className="orbital-fallback__ring orbital-fallback__ring--four" />
    </div>
  )
}

function OrbitalLayer() {
  const [shouldEnhance, setShouldEnhance] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const activate = () => setShouldEnhance(true)
    const events: (keyof WindowEventMap)[] = [
      'pointermove',
      'scroll',
      'touchstart',
      'keydown',
    ]
    events.forEach((event) =>
      window.addEventListener(event, activate, { once: true, passive: true }),
    )

    return () =>
      events.forEach((event) => window.removeEventListener(event, activate))
  }, [])

  return (
    <div className="orbital-layer">
      <ClientOnly fallback={<OrbitalFallback />}>
        {shouldEnhance ? (
          <Suspense fallback={<OrbitalFallback />}>
            <OrbitalExperience />
          </Suspense>
        ) : (
          <OrbitalFallback />
        )}
      </ClientOnly>
    </div>
  )
}

function Hero() {
  const message = useMessage()

  return (
    <section
      id="top"
      data-orbital-stage="hero"
      className="relative z-10 flex min-h-[100svh] items-end overflow-hidden"
    >
      <div className="page-grid mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)] pt-40 pb-12 md:pb-16">
        <div className="relative col-span-full lg:col-span-8">
          <p className="eyebrow mb-8">
            <span className="status-dot" /> {message(copy.home.heroEyebrow)}
          </p>
          <h1 className="max-w-5xl text-[clamp(3.65rem,8.5vw,9rem)] leading-[0.88] font-medium tracking-[-0.065em] text-balance">
            {message(copy.home.heroLine1)}
            <span className="mt-2 block font-editorial font-normal tracking-[-0.055em] text-ivory/90 italic">
              {message(copy.home.heroLine2)}
            </span>
          </h1>
          <p className="mt-9 max-w-xl text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-muted md:ml-[12.5%]">
            {message(copy.home.heroDescription)}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 md:ml-[12.5%]">
            <a className="button-primary" href="#contact">
              {message(copy.home.heroAction)}
            </a>
            <a className="button-secondary" href="#approach">
              {message(copy.home.approachEyebrow)}
            </a>
          </div>
        </div>

        <div className="col-span-full mt-20 flex flex-col gap-5 border-t border-line pt-6 text-xs tracking-[0.16em] text-muted uppercase md:flex-row md:items-center md:justify-between">
          <span>Web · AI · SaaS · Mobile</span>
          <span className="flex items-center gap-3">
            <span className="h-px w-10 bg-line" />
            {message(copy.home.heroScroll)}
          </span>
        </div>
      </div>
    </section>
  )
}

function SelectedWork() {
  const locale = useLocale()
  const localeParam = routeLocaleParam(locale)
  const message = useMessage()

  return (
    <section
      id="work"
      data-orbital-stage="selected-work"
      className="section-shell relative z-10"
    >
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="section-heading">
          <p className="eyebrow">{message(copy.home.workEyebrow)}</p>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            {message(copy.home.workDescription)}
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          {work.map((project) => (
            <article className="project-card group" key={project.title}>
              <Link
                className="block"
                to="/{-$locale}/work/$slug"
                params={{ locale: localeParam, slug: project.slug }}
                aria-label={message(copy.home.discoverProject, {
                  project: project.title,
                })}
              >
                <ProjectVisual tone={project.tone} />
              </Link>
              <div className="flex items-start justify-between gap-6 border-t border-line pt-6">
                <div>
                  <p className="text-xs tracking-[0.15em] text-muted uppercase">
                    {message(project.label)}
                  </p>
                  <h3 className="mt-3 text-3xl tracking-[-0.04em]">
                    <Link
                      className="project-title-link"
                      to="/{-$locale}/work/$slug"
                      params={{ locale: localeParam, slug: project.slug }}
                    >
                      {project.title}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">
                    {message(project.description)}
                  </p>
                  <ul
                    className="mt-5 flex flex-wrap gap-2"
                    aria-label={message(copy.work.servicesLabel)}
                  >
                    {project.tags.map((tag) => (
                      <li className="tag" key={tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="text-xs text-muted">{project.index}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Expertise() {
  const message = useMessage()

  return (
    <section id="expertise" className="section-shell relative z-10">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="section-heading">
          <p className="eyebrow">{message(copy.home.capabilitiesEyebrow)}</p>
          <h2 className="max-w-3xl text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.98] tracking-[-0.055em]">
            {message(copy.home.capabilitiesTitle)}
            <span className="font-editorial text-ivory/80 italic">
              {' '}
              {message(copy.home.capabilitiesAccent)}
            </span>
          </h2>
        </div>

        <div className="mt-20 border-t border-line">
          {expertise.map((item) => (
            <article
              className="expertise-row group"
              data-orbital-stage={item.stage}
              key={item.title}
            >
              <span className="text-xs text-muted">{item.number}</span>
              <h3 className="text-[clamp(1.6rem,3.5vw,3.7rem)] tracking-[-0.045em] transition-transform duration-500 ease-orbital group-hover:translate-x-2">
                {item.title}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-muted md:text-base">
                {message(item.description)}
              </p>
              <span
                className="hidden text-xl text-muted transition-colors group-hover:text-electric lg:block"
                aria-hidden="true"
              >
                ↗
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Approach() {
  const message = useMessage()

  return (
    <section
      id="approach"
      data-orbital-stage="process"
      className="section-shell relative z-10"
    >
      <div className="page-grid mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="col-span-full lg:col-span-5">
          <p className="eyebrow">{message(copy.home.approachEyebrow)}</p>
          <h2 className="mt-8 text-[clamp(2.8rem,5vw,5.8rem)] leading-[0.95] tracking-[-0.055em]">
            {message(copy.home.approachLine1)}
            <span className="block font-editorial text-ivory/80 italic">
              {message(copy.home.approachLine2)}
            </span>
          </h2>
          <p className="mt-8 max-w-md leading-relaxed text-muted">
            {message(copy.home.approachDescription)}
          </p>
        </div>

        <ol className="col-span-full mt-16 border-t border-line lg:col-span-6 lg:col-start-7 lg:mt-0">
          {process.map((step, index) => (
            <li
              className="flex items-center justify-between border-b border-line py-6"
              key={step.id}
            >
              <span className="text-xs text-muted">0{index + 1}</span>
              <span className="text-xl tracking-[-0.025em] md:text-2xl">
                {message(step)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Manifesto() {
  const message = useMessage()

  return (
    <section className="section-shell relative z-10">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="manifesto-panel">
          <p className="eyebrow">{message(copy.home.pointOfView)}</p>
          <blockquote className="mt-10 max-w-6xl text-[clamp(2.2rem,5vw,5.7rem)] leading-[1.02] tracking-[-0.055em]">
            {message(copy.home.manifestoLine1)}
            <span className="font-editorial text-ivory/75 italic">
              {' '}
              {message(copy.home.manifestoLine2)}
            </span>
          </blockquote>
          <p className="mt-10 max-w-lg leading-relaxed text-muted md:ml-auto">
            {message(copy.home.manifestoDescription)}
          </p>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const message = useMessage()

  return (
    <section
      id="contact"
      data-orbital-stage="convergence"
      className="relative z-10 flex min-h-[90svh] items-center border-t border-line"
    >
      <div className="mx-auto w-full max-w-[var(--content-width)] px-[var(--page-gutter)] py-32 text-center">
        <p className="eyebrow justify-center">
          {message(copy.home.contactEyebrow)}
        </p>
        <h2 className="mx-auto mt-8 max-w-6xl text-[clamp(3.4rem,8vw,8.5rem)] leading-[0.9] tracking-[-0.065em]">
          {message(copy.home.contactLine1)}
          <span className="block font-editorial text-ivory/85 italic">
            {message(copy.home.contactLine2)}
          </span>
        </h2>
        <a
          className="button-primary mt-12"
          href="mailto:hello@ozastra.com?subject=Ozastra%20project"
        >
          hello@ozastra.com <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}

function Home() {
  const message = useMessage()

  return (
    <div className="relative isolate bg-ink">
      <a className="skip-link" href="#content">
        {message(copy.shell.skip)}
      </a>
      <OrbitalLayer />
      <SiteHeader />
      <main id="content" tabIndex={-1}>
        <Hero />
        <SelectedWork />
        <Expertise />
        <Approach />
        <Manifesto />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  )
}
