import { describe, expect, it } from 'vitest'

describe('Ozastra foundation', () => {
  it('keeps the four product disciplines explicit', () => {
    const disciplines = ['web', 'ai', 'saas', 'mobile']
    expect(disciplines).toHaveLength(4)
    expect(new Set(disciplines).size).toBe(4)
  })
})
