import { z } from 'zod'

import { isLocale } from '../../i18n/locales'
import type { Locale } from '../../i18n/locales'

export const projectStatusSchema = z.enum(['client', 'internal', 'concept'])

export const projectSchema = z.object({
  locale: z.custom<Locale>(
    (value) => typeof value === 'string' && isLocale(value),
    'Project locale must be registered.',
  ),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(80),
  summary: z.string().min(30).max(220),
  year: z.number().int().min(2020).max(2100),
  status: projectStatusSchema,
  services: z.array(z.string().min(2)).min(1).max(8),
  challenge: z.string().min(40).max(600),
  approach: z.string().min(40).max(600),
  outcome: z.string().min(40).max(600),
  coverTone: z.enum(['blue', 'violet', 'ivory']),
  featured: z.boolean(),
  seoTitle: z.string().min(10).max(70),
  seoDescription: z.string().min(50).max(170),
})

export type Project = z.infer<typeof projectSchema>
export type ProjectStatus = z.infer<typeof projectStatusSchema>

export function parseProject(value: unknown): Project {
  return projectSchema.parse(value)
}
