export type StoryPosition = {
  progress: number
  stageIndex: number
}

export function resolveStoryPosition(
  offsets: readonly number[],
  cursor: number,
): StoryPosition {
  if (offsets.length < 2) return { progress: 0, stageIndex: 0 }

  const nextIndex = offsets.findIndex((offset) => offset > cursor)
  let segmentIndex =
    nextIndex === -1 ? offsets.length - 2 : Math.max(0, nextIndex - 1)
  segmentIndex = Math.min(
    Math.max(segmentIndex, 0),
    Math.max(0, offsets.length - 2),
  )

  const start = offsets[segmentIndex]
  const end = offsets[segmentIndex + 1]
  const localProgress = Math.min(
    Math.max((cursor - start) / Math.max(1, end - start), 0),
    1,
  )

  return {
    progress: (segmentIndex + localProgress) / (offsets.length - 1),
    stageIndex: Math.min(
      segmentIndex + (localProgress >= 0.5 ? 1 : 0),
      offsets.length - 1,
    ),
  }
}
