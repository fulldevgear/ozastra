import { describe, expect, it } from 'vitest'

import { parseProject } from './project-schema'

const validProject = {
  locale: 'fr',
  slug: 'orbit',
  title: 'Orbit',
  summary:
    'Un cockpit SaaS qui transforme des signaux complexes en décisions lisibles pour les équipes produit.',
  year: 2026,
  status: 'concept',
  services: ['Product strategy', 'SaaS'],
  challenge:
    'Réduire la densité de données sans masquer les signaux utiles aux équipes qui doivent décider rapidement.',
  approach:
    'Structurer une hiérarchie calme, progressive et cohérente autour des décisions plutôt que des graphiques.',
  outcome:
    'Un concept démontrant comment une interface analytique peut gagner en précision sans devenir froide ou générique.',
  coverTone: 'blue',
  featured: true,
  seoTitle: 'Orbit — Concept SaaS par Ozastra',
  seoDescription:
    'Découvrez Orbit, une étude conceptuelle Ozastra consacrée à la conception d’un cockpit SaaS analytique précis et lisible.',
} as const

describe('project schema', () => {
  it('accepts a complete concept project', () => {
    expect(parseProject(validProject).slug).toBe('orbit')
  })

  it('rejects a project without an explicit status', () => {
    const { status: _, ...invalidProject } = validProject
    expect(() => parseProject(invalidProject)).toThrow()
  })
})
