import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

import type { Locale } from '../../i18n/locales'
import { parseProject } from './project-schema'
import type { Project } from './project-schema'

type ProjectModule = { default: ComponentType }
type ManifestModule = { default: unknown }

const manifestLoaders = import.meta.glob<ManifestModule>(
  '../../content/projects/*/manifest.json',
)
const bodyLoaders = import.meta.glob<ProjectModule>(
  '../../content/projects/*/*.mdx',
)

const manifestCache = new Map<Locale, Promise<Project[]>>()
const componentCache = new Map<string, LazyExoticComponent<ComponentType>>()

function manifestPath(locale: Locale) {
  return `../../content/projects/${locale}/manifest.json`
}

function bodyPath(locale: Locale, slug: string) {
  return `../../content/projects/${locale}/${slug}.mdx`
}

export function getProjects(locale: Locale): Promise<Project[]> {
  const cached = manifestCache.get(locale)
  if (cached) return cached

  const loader = manifestLoaders[manifestPath(locale)]
  if (!loader) {
    return Promise.reject(new Error(`Missing project manifest for ${locale}.`))
  }

  const projectsPromise = loader().then((module) => {
    if (!Array.isArray(module.default)) {
      throw new Error(`Project manifest for ${locale} must export an array.`)
    }

    const projects = module.default.map(parseProject)
    for (const project of projects) {
      if (project.locale !== locale) {
        throw new Error(
          `Project ${project.slug} declares ${project.locale} in the ${locale} manifest.`,
        )
      }
      if (!bodyLoaders[bodyPath(locale, project.slug)]) {
        throw new Error(`Missing ${locale} MDX body for ${project.slug}.`)
      }
    }

    return projects.sort((left, right) =>
      left.title.localeCompare(right.title, locale),
    )
  })

  manifestCache.set(locale, projectsPromise)
  return projectsPromise
}

export async function getProject(
  locale: Locale,
  slug: string,
): Promise<Project | undefined> {
  const projects = await getProjects(locale)
  return projects.find((project) => project.slug === slug)
}

export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  const projects = await getProjects(locale)
  return projects.filter((project) => project.featured)
}

export function getProjectComponent(
  locale: Locale,
  slug: string,
): LazyExoticComponent<ComponentType> | undefined {
  const path = bodyPath(locale, slug)
  const loader = bodyLoaders[path]
  if (!loader) return undefined

  const cached = componentCache.get(path)
  if (cached) return cached

  const component = lazy(loader)
  componentCache.set(path, component)
  return component
}
