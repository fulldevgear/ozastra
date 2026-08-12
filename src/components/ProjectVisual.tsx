type ProjectVisualProps = {
  tone: 'blue' | 'violet' | 'ivory'
}

export function ProjectVisual({ tone }: ProjectVisualProps) {
  return (
    <div className={`project-visual project-visual--${tone}`}>
      <div className="project-interface" aria-hidden="true">
        <div className="interface-rail">
          <span />
          <span />
          <span />
        </div>
        <div className="interface-main">
          <div className="interface-topline" />
          <div className="interface-orbit">
            <i />
          </div>
          <div className="interface-data">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  )
}
