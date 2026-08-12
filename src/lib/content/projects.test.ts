import { describe, expect, it } from 'vitest'

import { getProject, getProjectComponent, getProjects } from './projects'

describe('localized project content pipeline', () => {
  it('loads and validates each localized manifest independently', async () => {
    const [english, french] = await Promise.all([
      getProjects('en'),
      getProjects('fr'),
    ])

    expect(english.map(({ slug }) => slug)).toEqual(['axiom', 'orbit'])
    expect(french.map(({ slug }) => slug)).toEqual(['axiom', 'orbit'])
    expect(english[0]?.summary).not.toBe(french[0]?.summary)
  })

  it('resolves metadata and an on-demand body by locale and slug', async () => {
    expect((await getProject('en', 'orbit'))?.status).toBe('concept')
    expect(await getProject('fr', 'missing')).toBeUndefined()
    expect(getProjectComponent('fr', 'orbit')).toBeDefined()
    expect(getProjectComponent('en', 'missing')).toBeUndefined()
  })
})
