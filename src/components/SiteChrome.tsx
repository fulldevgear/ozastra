import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { routeLocaleParam } from '../i18n/navigation'
import { copy } from '../i18n/messages'
import { useLocale } from '../i18n/use-locale'
import { useMessage } from '../i18n/use-message'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Wordmark() {
  const locale = useLocale()
  const message = useMessage()

  return (
    <Link
      className="group inline-flex items-center gap-3 text-sm font-medium tracking-[0.18em] uppercase"
      to="/{-$locale}"
      params={{ locale: routeLocaleParam(locale) }}
      aria-label={message(copy.shell.homeLabel)}
    >
      <span className="grid size-7 place-items-center rounded-full border border-line bg-ivory/[0.04]">
        <span className="wordmark-signal size-1.5 rounded-full bg-electric transition-transform duration-300 group-hover:scale-125" />
      </span>
      <span className="wordmark-label">Ozastra</span>
    </Link>
  )
}

export function SiteHeader() {
  const locale = useLocale()
  const message = useMessage()
  const params = { locale: routeLocaleParam(locale) }

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[var(--content-width)] items-center justify-between px-[var(--page-gutter)]">
        <Wordmark />
        <nav
          className="hidden items-center gap-8 text-sm text-muted md:flex"
          aria-label={message(copy.shell.primaryNavigation)}
        >
          <Link className="nav-link" to="/{-$locale}/work" params={params}>
            {message(copy.shell.work)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/services" params={params}>
            {message(copy.shell.services)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/about" params={params}>
            {message(copy.shell.about)}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            className="button-quiet hidden md:inline-flex"
            to="/{-$locale}/contact"
            params={params}
          >
            {message(copy.shell.talk)}
          </Link>
          <details className="mobile-navigation md:hidden">
            <summary aria-label={message(copy.shell.openMenu)}>
              {message(copy.shell.menu)}
            </summary>
            <nav aria-label={message(copy.shell.mobileNavigation)}>
              <Link to="/{-$locale}/work" params={params}>
                {message(copy.shell.work)}
              </Link>
              <Link to="/{-$locale}/services" params={params}>
                {message(copy.shell.services)}
              </Link>
              <Link to="/{-$locale}/about" params={params}>
                {message(copy.shell.about)}
              </Link>
              <Link to="/{-$locale}/contact" params={params}>
                {message(copy.shell.talk)}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const locale = useLocale()
  const message = useMessage()
  const params = { locale: routeLocaleParam(locale) }

  return (
    <footer className="relative z-10 border-t border-line bg-ink">
      <div className="mx-auto grid max-w-[var(--content-width)] gap-8 px-[var(--page-gutter)] py-10 text-sm text-muted md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Wordmark />
          <p className="mt-6">{message(copy.shell.capabilities)}</p>
        </div>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-3"
          aria-label={message(copy.shell.footerNavigation)}
        >
          <Link className="nav-link" to="/{-$locale}/work" params={params}>
            {message(copy.shell.work)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/services" params={params}>
            {message(copy.shell.services)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/about" params={params}>
            {message(copy.shell.about)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/contact" params={params}>
            {message(copy.shell.contact)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/legal" params={params}>
            {message(copy.shell.legal)}
          </Link>
          <Link className="nav-link" to="/{-$locale}/privacy" params={params}>
            {message(copy.shell.privacy)}
          </Link>
        </nav>
        <p className="md:col-span-2 md:text-right">
          © {new Date().getFullYear()} Ozastra LLC
        </p>
      </div>
    </footer>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  const message = useMessage()

  return (
    <div className="min-h-screen bg-ink">
      <a className="skip-link" href="#content">
        {message(copy.shell.skip)}
      </a>
      <SiteHeader />
      <main id="content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro__description">{description}</p>
    </header>
  )
}
