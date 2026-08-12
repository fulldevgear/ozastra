import { describe, expect, it } from 'vitest'

import { getProject, projects } from './projects'

describe('project content pipeline', () => {
  it('loads and validates every MDX project', () => {
    expect(projects.map(({ data }) => data.slug)).toEqual(['axiom', 'orbit'])
  })

  it('resolves a project by slug', () => {
    expect(getProject('orbit')?.data.status).toBe('concept')
    expect(getProject('missing')).toBeUndefined()
  })
})
