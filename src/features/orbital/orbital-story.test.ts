import { describe, expect, it } from 'vitest'

import { resolveStoryPosition } from './orbital-story'

describe('resolveStoryPosition', () => {
  const offsets = [0, 100, 300, 600]

  it('clamps before the first and after the final stage', () => {
    expect(resolveStoryPosition(offsets, -50).progress).toBe(0)
    expect(resolveStoryPosition(offsets, 900).progress).toBe(1)
  })

  it('interpolates using real stage distances', () => {
    expect(resolveStoryPosition(offsets, 200)).toEqual({
      progress: 0.5,
      stageIndex: 2,
    })
  })
})
