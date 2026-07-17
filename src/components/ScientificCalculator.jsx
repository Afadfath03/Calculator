import { useReducer } from 'react'
import Display from './Display'
import { scientificReducer, INITIAL_STATE } from '../utils/scientificEngine'
import './Calculator.css'

function Btn({ label, className, onClick, wide }) {
  return (
    <button
      className={`calc-btn ${className} ${wide ? 'calc-btn-wide' : ''}`}
      onClick={onClick}
      style={wide ? { gridColumn: 'span 2' } : undefined}
    >
      {label}
    </button>
  )
}

export default function ScientificCalculator() {
  const [state, dispatch] = useReducer(scientificReducer, INITIAL_STATE)

  const d = (type, extra) => () => dispatch({ type, ...extra })

  return (
    <div className="calculator calculator-wide">
      <Display
        value={state.display}
        expression={state.expr}
        error={state.error}
      />

      <div style={{
        display: 'flex', gap: 6, marginBottom: 8,
        background: 'var(--display-bg)', borderRadius: 10, padding: '4px 6px',
        border: '1px solid var(--border)', alignItems: 'center',
      }}>
        <button
          className={`calc-btn calc-btn-toggle ${state.angleMode === 'deg' ? 'active' : ''}`}
          onClick={d('TOGGLE_ANGLE')}
        >Deg</button>
        <button
          className={`calc-btn calc-btn-toggle ${state.angleMode === 'rad' ? 'active' : ''}`}
          onClick={d('TOGGLE_ANGLE')}
        >Rad</button>
        <div style={{ flex: 1 }} />
        {state.memory !== 0 && (
          <span style={{ fontSize: 11, color: 'var(--accent)', alignSelf: 'center', fontWeight: 600, paddingRight: 4 }}>M</span>
        )}
      </div>

      <div className="calc-body" style={{ marginBottom: 8 }}>
        <div className="calc-digits-panel" style={{ gridTemplateColumns: 'repeat(2, 1fr)', flex: 2 }}>
          <Btn label="(" className="calc-btn-func" onClick={d('PAREN', { paren: '(' })} />
          <Btn label=")" className="calc-btn-func" onClick={d('PAREN', { paren: ')' })} />
          <Btn label="MC" className="calc-btn-func" onClick={d('MEMORY', { op: 'MC' })} />
          <Btn label="MR" className="calc-btn-func" onClick={d('MEMORY', { op: 'MR' })} />
          <Btn label="M+" className="calc-btn-func" onClick={d('MEMORY', { op: 'M+' })} />
          <Btn label="M−" className="calc-btn-func" onClick={d('MEMORY', { op: 'M-' })} />
        </div>

        <div className="calc-panel-divider" />

        <div className="calc-digits-panel" style={{ gridTemplateColumns: 'repeat(3, 1fr)', flex: 3 }}>
          <Btn label="sin" className="calc-btn-func" onClick={d('TRIG_FUNC', { fn: 'sin' })} />
          <Btn label="cos" className="calc-btn-func" onClick={d('TRIG_FUNC', { fn: 'cos' })} />
          <Btn label="tan" className="calc-btn-func" onClick={d('TRIG_FUNC', { fn: 'tan' })} />
          <Btn label="log" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: 'log' })} />
          <Btn label="ln" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: 'ln' })} />
          <Btn label="√" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: '√' })} />
          <Btn label="x²" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: 'x²' })} />
          <Btn label="x³" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: 'x³' })} />
          <Btn label="xⁿ" className="calc-btn-func" onClick={d('INPUT_OPERATOR', { operator: '^' })} />
          <Btn label="10ⁿ" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: '10ⁿ' })} />
          <Btn label="n!" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: 'n!' })} />
          <Btn label="1/x" className="calc-btn-func" onClick={d('UNARY_FUNC', { fn: '1/x' })} />
          <Btn label="π" className="calc-btn-func" onClick={d('CONSTANT', { display: 'π', value: String(Math.PI) })} />
          <Btn label="e" className="calc-btn-func" onClick={d('CONSTANT', { display: 'e', value: String(Math.E) })} />
        </div>
      </div>

      <div className="calc-body">
        <div className="calc-digits-panel">
          <Btn label="C" className="calc-btn-func" onClick={d('CLEAR')} />
          <Btn label="⌫" className="calc-btn-func" onClick={d('BACKSPACE')} />
          <Btn label="±" className="calc-btn-func" onClick={d('NEGATE')} />

          <Btn label="7" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '7' })} />
          <Btn label="8" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '8' })} />
          <Btn label="9" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '9' })} />

          <Btn label="4" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '4' })} />
          <Btn label="5" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '5' })} />
          <Btn label="6" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '6' })} />

          <Btn label="1" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '1' })} />
          <Btn label="2" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '2' })} />
          <Btn label="3" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '3' })} />

          <Btn label="0" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '0' })} />
          <Btn label="." className="calc-btn-digit" onClick={d('INPUT_DECIMAL')} />
        </div>

        <div className="calc-panel-divider" />

        <div className="calc-ops-panel">
          <Btn label="÷" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '÷' })} />
          <Btn label="×" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '×' })} />
          <Btn label="−" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '−' })} />
          <Btn label="+" className="calc-btn-operator" onClick={d('INPUT_OPERATOR', { operator: '+' })} />
          <Btn label="=" className="calc-btn-operator" onClick={d('EQUALS')} />
        </div>
      </div>
    </div>
  )
}
