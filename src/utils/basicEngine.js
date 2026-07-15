// Basic calculator state machine
// State: { current, previous, operator, isNewEntry, expression, error }

const OPERATORS = { '+': '+', '-': '-', '×': '×', '÷': '÷' }

function formatNum(n) {
  if (!isFinite(n)) return 'Error'
  const s = String(n)
  // Cap display to avoid extremely long decimals
  if (s.includes('.') && s.split('.')[1].length > 10) {
    return Number(n.toPrecision(10)).toString()
  }
  if (s.length > 16) {
    return n.toExponential(6)
  }
  return s
}

function applyOp(a, op, b) {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : NaN
    default: return b
  }
}

export const INITIAL_STATE = {
  current: '0',
  previous: '',
  operator: null,
  isNewEntry: true,
  expression: '',
  error: null,
}

export function basicReducer(state, action) {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      if (state.error) return { ...INITIAL_STATE, current: action.digit }
      if (state.isNewEntry) {
        return {
          ...state,
          current: action.digit,
          isNewEntry: false,
        }
      }
      if (state.current.length >= 16) return state
      return {
        ...state,
        current: state.current === '0' ? action.digit : state.current + action.digit,
      }
    }

    case 'INPUT_DECIMAL': {
      if (state.error) return { ...INITIAL_STATE, current: '0.' }
      if (state.isNewEntry) {
        return { ...state, current: '0.', isNewEntry: false }
      }
      if (state.current.includes('.')) return state
      return { ...state, current: state.current + '.' }
    }

    case 'INPUT_OPERATOR': {
      if (state.error) return { ...INITIAL_STATE }
      const op = action.operator
      if (state.operator && !state.isNewEntry) {
        // Chain calculation
        const prev = parseFloat(state.previous)
        const curr = parseFloat(state.current)
        const result = applyOp(prev, state.operator, curr)
        if (!isFinite(result)) {
          return { ...INITIAL_STATE, error: 'Error', current: 'Error' }
        }
        const formatted = formatNum(result)
        return {
          current: formatted,
          previous: formatted,
          operator: op,
          isNewEntry: true,
          expression: `${formatted} ${op}`,
          error: null,
        }
      }
      return {
        ...state,
        previous: state.current,
        operator: op,
        isNewEntry: true,
        expression: `${state.current} ${op}`,
      }
    }

    case 'CALCULATE': {
      if (state.error) return { ...INITIAL_STATE }
      if (!state.operator) return state
      if (state.isNewEntry && state.previous === '') return state
      const prev = parseFloat(state.previous)
      const curr = parseFloat(state.current)
      const result = applyOp(prev, state.operator, curr)
      if (!isFinite(result)) {
        return { ...INITIAL_STATE, error: 'Error', current: 'Error' }
      }
      const formatted = formatNum(result)
      return {
        current: formatted,
        previous: formatted,
        operator: null,
        isNewEntry: true,
        expression: `${state.previous} ${state.operator} ${state.current} =`,
        error: null,
      }
    }

    case 'CLEAR': {
      return { ...INITIAL_STATE }
    }

    case 'CLEAR_ENTRY': {
      if (state.error) return { ...INITIAL_STATE }
      return { ...state, current: '0', isNewEntry: true }
    }

    case 'NEGATE': {
      if (state.error) return state
      if (state.current === '0') return state
      const neg = state.current.startsWith('-')
        ? state.current.slice(1)
        : '-' + state.current
      return { ...state, current: neg }
    }

    case 'PERCENTAGE': {
      if (state.error) return state
      const val = parseFloat(state.current)
      const result = val / 100
      return { ...state, current: formatNum(result), isNewEntry: true }
    }

    case 'BACKSPACE': {
      if (state.error) return { ...INITIAL_STATE }
      if (state.isNewEntry) return state
      const next = state.current.length > 1
        ? state.current.slice(0, -1)
        : '0'
      return {
        ...state,
        current: next,
        isNewEntry: next === '0',
      }
    }

    default:
      return state
  }
}
