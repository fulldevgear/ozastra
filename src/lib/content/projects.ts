import type { ComponentType } from 'react'

import { parseProject } from './project-schema'
import type { Project } from './project-schema'

type ProjectModule = {
  default: ComponentType
  metadata: unknown
}

export type ProjectEntry = {
  Component: ComponentType
  data: Project
}

const modules = import.meta.glob<ProjectModule>(
  '../../content/projects/*.mdx',
  {
    eager: true,
  },
)

export const projects: ProjectEntry[] = Object.values(modules)
  .map((module) => ({
    Component: module.default,
    data: parseProject(module.metadata),
  }))
  .sort((left, right) => left.data.title.localeCompare(right.data.title))

export function getProject(slug: string): ProjectEntry | undefined {
  return projects.find((project) => project.data.slug === slug)
}

export function getFeaturedProjects(): ProjectEntry[] {
  return projects.filter((project) => project.data.featured)
}
