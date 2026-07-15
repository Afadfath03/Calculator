import { useMemo } from 'react'
import './Display.css'

export default function Display({ value, expression, baseLabel, error }) {
  const fontSize = useMemo(() => {
    const len = String(value).length
    if (len <= 10) return '2.4rem'
    if (len <= 16) return '1.8rem'
    if (len <= 24) return '1.3rem'
    return '1rem'
  }, [value])

  return (
    <div className="display">
      {baseLabel && <span className="display-base">{baseLabel}</span>}
      {expression && <div className="display-expression">{expression}</div>}
      <div
        className={`display-value ${error ? 'display-error' : ''}`}
        style={{ fontSize }}
      >
        {error || value || '0'}
      </div>
    </div>
  )
}
