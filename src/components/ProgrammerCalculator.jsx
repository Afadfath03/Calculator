import { useReducer, useEffect } from 'react'
import { programmerReducer, INITIAL_STATE, BIT_WIDTHS, formatValue, formatHex, formatBin } from '../utils/programmerEngine'
import './Calculator.css'

function Btn({ label, className, onClick, wide, disabled }) {
  return (
    <button
      className={`calc-btn ${className} ${wide ? 'calc-btn-wide' : ''}`}
      onClick={onClick}
      style={{ ...(wide ? { gridColumn: 'span 2' } : {}), ...(disabled ? { opacity: 0.3, cursor: 'default' } : {}) }}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

const ALL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
const BASE_ORDER = ['HEX', 'DEC', 'OCT', 'BIN']

export default function ProgrammerCalculator() {
  const [state, dispatch] = useReducer(programmerReducer, INITIAL_STATE)

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const k = e.key
      if (k >= '0' && k <= '9') { dispatch({ type: 'INPUT_DIGIT', digit: k }); e.preventDefault(); return }
      const upper = k.toUpperCase()
      if (upper >= 'A' && upper <= 'F') { dispatch({ type: 'INPUT_DIGIT', digit: upper }); e.preventDefault(); return }
      switch (k) {
        case '+': dispatch({ type: 'INPUT_OPERATOR', operator: '+' }); break
        case '-': dispatch({ type: 'INPUT_OPERATOR', operator: '-' }); break
        case '*': dispatch({ type: 'INPUT_OPERATOR', operator: '×' }); break
        case '/': dispatch({ type: 'INPUT_OPERATOR', operator: '÷' }); break
        case 'Enter': case '=': dispatch({ type: 'CALCULATE' }); break
        case 'Escape': dispatch({ type: 'CLEAR' }); break
        case 'Backspace': dispatch({ type: 'BACKSPACE' }); break
        default: return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  const d = (type, extra) => () => dispatch({ type, ...extra })

  const base = state.base
  const isHex = base === 'HEX'
  const digitDisabled = (dig) => {
    const val = parseInt(dig, 16)
    return val >= parseInt('F', 16) + 1 || val >= (base === 'BIN' ? 2 : base === 'OCT' ? 8 : base === 'DEC' ? 10 : 16)
  }

  return (
    <div className="calculator calculator-wide">
      {/* Multi-base display */}
      <div style={{ background: 'var(--display-bg)', borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>HEX</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{formatHex(state.value, state.bitWidth)}</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 300,
          color: 'var(--display-text)', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 6
        }}>
          <span>DEC</span>
          <span>{formatValue(state.value, 'DEC', state.bitWidth)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>OCT</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{formatValue(state.value, 'OCT', state.bitWidth)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
          <span>BIN</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--text)', fontSize: 10, letterSpacing: '0.3px' }}>
            {formatBin(state.value, state.bitWidth)}
          </span>
        </div>
        {state.error && (
          <div style={{ fontSize: 14, color: '#e74c3c', textAlign: 'right', marginTop: 4 }}>{state.error}</div>
        )}
      </div>

      {/* Base selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {BASE_ORDER.map(b => (
          <button key={b} className={`calc-btn calc-btn-toggle ${state.base === b ? 'active' : ''}`}
            onClick={d('SET_BASE', { base: b })} style={{ flex: 1, fontSize: 11, minHeight: 30 }}>
            {b}
          </button>
        ))}
      </div>

      {/* Bit-width selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {BIT_WIDTHS.map(w => (
          <button key={w} className={`calc-btn calc-btn-toggle ${state.bitWidth === w ? 'active' : ''}`}
            onClick={d('SET_BIT_WIDTH', { bitWidth: w })} style={{ flex: 1, fontSize: 11, minHeight: 30 }}>
            {w}
          </button>
        ))}
      </div>

      <div className="calc-body">
        <div className="calc-digits-panel" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {/* Bitwise ops + editing */}
          <Btn label="AND" className="calc-btn-func" onClick={d('INPUT_OPERATOR', { operator: 'AND' })} />
          <Btn label="OR"  className="calc-btn-func" onClick={d('INPUT_OPERATOR', { operator: 'OR' })} />
          <Btn label="XOR" className="calc-btn-func" onClick={d('INPUT_OPERATOR', { operator: 'XOR' })} />
          <Btn label="<<"  className="calc-btn-func" onClick={d('INPUT_OPERATOR', { operator: '<<' })} />

          <Btn label=">>"  className="calc-btn-func" onClick={d('INPUT_OPERATOR', { operator: '>>' })} />
          <Btn label="C"   className="calc-btn-func" onClick={d('CLEAR')} />
          <Btn label="⌫"  className="calc-btn-func" onClick={d('BACKSPACE')} />
          <Btn label="NOT" className="calc-btn-func" onClick={d('UNARY_NOT')} />

          {/* Hex digits 0-F (4×4) */}
          {ALL_DIGITS.map(dig => (
            <Btn key={dig} label={dig} className="calc-btn-digit"
              onClick={d('INPUT_DIGIT', { digit: dig })} disabled={digitDisabled(dig)} />
          ))}
        </div>

        <div className="calc-panel-divider" />

        <div className="calc-ops-panel">
          <Btn label="÷" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '÷' })} />
          <Btn label="×" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '×' })} />
          <Btn label="−" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '-' })} />
          <Btn label="+" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '+' })} />
          <Btn label="=" className="calc-btn-operator" onClick={d('CALCULATE')} />
        </div>
      </div>
    </div>
  )
}
