import seoCopyData from './seo-copy.json'
import type { Locale } from './locales'

type PageSeo = { title: string; description: string }
export type LocaleSeoCopy = {
  home: PageSeo
  about: PageSeo
  services: PageSeo
  work: PageSeo
  contact: PageSeo
  legal: PageSeo
  privacy: PageSeo
  imageAlt: string
  projectsBreadcrumb: string
  organizationDescription: string
}

const seoCopy = seoCopyData as Partial<Record<Locale, LocaleSeoCopy>>

export function getSeoCopy(locale: Locale): LocaleSeoCopy {
  const copy = seoCopy[locale]
  if (!copy) throw new Error(`Missing SEO copy for published locale ${locale}.`)
  return copy
}
