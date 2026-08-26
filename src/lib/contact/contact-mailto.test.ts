import { describe, expect, it } from 'vitest'

import { createContactMailtoUrl } from './contact-mailto'

describe('createContactMailtoUrl', () => {
  it('encodes visitor fields into a local email draft without a server call', () => {
    const url = createContactMailtoUrl({
      email: 'hello+test@example.com',
      message: 'A precise product brief with enough detail.',
      name: 'Ada Lovelace',
      project: 'web',
    })

    expect(url).toMatch(/^mailto:hello@ozastra\.com\?/)
    expect(decodeURIComponent(url)).toContain('Ozastra project — web')
    expect(decodeURIComponent(url)).toContain('Name: Ada Lovelace')
    expect(decodeURIComponent(url)).toContain('Email: hello+test@example.com')
    expect(decodeURIComponent(url)).toContain(
      'A precise product brief with enough detail.',
    )
  })
})
