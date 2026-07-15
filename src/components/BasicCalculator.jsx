import { useReducer } from 'react'
import Display from './Display'
import { basicReducer, INITIAL_STATE } from '../utils/basicEngine'
import './Calculator.css'

function Btn({ label, className, onClick }) {
  return (
    <button className={`calc-btn ${className}`} onClick={onClick}>
      {label}
    </button>
  )
}

export default function BasicCalculator() {
  const [state, dispatch] = useReducer(basicReducer, INITIAL_STATE)

  const d = (type, extra) => () => dispatch({ type, ...extra })

  return (
    <div className="calculator">
      <Display
        value={state.current}
        expression={state.expression}
        error={state.error}
      />
      <div className="calc-body">
        <div className="calc-digits-panel">
          <Btn label="C" className="calc-btn-func" onClick={d('CLEAR_ENTRY')} />
          <Btn label="⌫" className="calc-btn-func" onClick={d('BACKSPACE')} />
          <Btn label="%" className="calc-btn-func" onClick={d('PERCENTAGE')} />

          <Btn label="7" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '7' })} />
          <Btn label="8" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '8' })} />
          <Btn label="9" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '9' })} />

          <Btn label="4" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '4' })} />
          <Btn label="5" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '5' })} />
          <Btn label="6" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '6' })} />

          <Btn label="1" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '1' })} />
          <Btn label="2" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '2' })} />
          <Btn label="3" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '3' })} />

          <Btn label="±" className="calc-btn-func" onClick={d('NEGATE')} />
          <Btn label="0" className="calc-btn-digit" onClick={d('INPUT_DIGIT', { digit: '0' })} />
          <Btn label="." className="calc-btn-digit" onClick={d('INPUT_DECIMAL')} />
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
