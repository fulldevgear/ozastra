import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { ThemeToggle } from './ThemeToggle'

export function Wordmark() {
  return (
    <Link
      className="group inline-flex items-center gap-3 text-sm font-medium tracking-[0.18em] uppercase"
      to="/"
      aria-label="Ozastra — accueil"
    >
      <span className="grid size-7 place-items-center rounded-full border border-line bg-ivory/[0.04]">
        <span className="wordmark-signal size-1.5 rounded-full bg-electric transition-transform duration-300 group-hover:scale-125" />
      </span>
      Ozastra
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[var(--content-width)] items-center justify-between px-[var(--page-gutter)]">
        <Wordmark />
        <nav
          className="hidden items-center gap-8 text-sm text-muted md:flex"
          aria-label="Navigation principale"
        >
          <Link className="nav-link" to="/work">
            Projets
          </Link>
          <Link className="nav-link" to="/services">
            Services
          </Link>
          <Link className="nav-link" to="/about">
            À propos
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link className="button-quiet hidden md:inline-flex" to="/contact">
            Parlons-en <span aria-hidden="true">↗</span>
          </Link>
          <details className="mobile-navigation md:hidden">
            <summary aria-label="Ouvrir le menu">Menu</summary>
            <nav aria-label="Navigation mobile">
              <Link to="/work">Projets</Link>
              <Link to="/services">Services</Link>
              <Link to="/about">À propos</Link>
              <Link to="/contact">Parlons-en ↗</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-ink">
      <div className="mx-auto grid max-w-[var(--content-width)] gap-8 px-[var(--page-gutter)] py-10 text-sm text-muted md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Wordmark />
          <p className="mt-6">Web · AI · SaaS · Mobile · Product engineering</p>
        </div>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-3"
          aria-label="Pied de page"
        >
          <Link className="nav-link" to="/work">
            Projets
          </Link>
          <Link className="nav-link" to="/services">
            Services
          </Link>
          <Link className="nav-link" to="/about">
            À propos
          </Link>
          <Link className="nav-link" to="/contact">
            Contact
          </Link>
          <Link className="nav-link" to="/legal">
            Mentions légales
          </Link>
          <Link className="nav-link" to="/privacy">
            Confidentialité
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
  return (
    <div className="min-h-screen bg-ink">
      <a className="skip-link" href="#content">
        Aller au contenu
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
