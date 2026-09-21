export default function Stepper({ steps, activeIndex, onStepClick }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'current' : ''
        const clickable = onStepClick && i <= activeIndex
        return (
          <div className="step-wrap" key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`step ${state}`}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
              onClick={() => clickable && onStepClick(i)}
            >
              <span className="dot">{state === 'done' ? '✓' : i + 1}</span>
              <span className="step-label">{label}</span>
            </div>
            {i < steps.length - 1 && <span className="step-connector" />}
          </div>
        )
      })}
    </div>
  )
}
