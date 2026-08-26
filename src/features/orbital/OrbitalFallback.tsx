export function OrbitalLoadingPlaceholder() {
  return (
    <div
      className="orbital-loading-placeholder"
      data-orbital-loading="true"
      aria-hidden="true"
    />
  )
}

export function OrbitalFallback({
  preHydration = false,
}: {
  preHydration?: boolean
} = {}) {
  return (
    <div
      className={`orbital-fallback${preHydration ? ' orbital-fallback--pre-hydration' : ''}`}
      data-orbital-fallback="true"
      data-orbital-fallback-state="hero"
      data-orbital-pre-hydration={preHydration ? 'true' : undefined}
      aria-hidden="true"
    >
      <span className="orbital-fallback__atmosphere" />
      <span className="orbital-fallback__planet" />
      <span className="orbital-fallback__surface-signal orbital-fallback__surface-signal--one" />
      <span className="orbital-fallback__surface-signal orbital-fallback__surface-signal--two" />
      <span className="orbital-fallback__surface-signal orbital-fallback__surface-signal--three" />
      <span className="orbital-fallback__seed" />
    </div>
  )
}
