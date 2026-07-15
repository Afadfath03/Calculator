// Scientific calculator — expression string evaluated via Function()
// State: { expr, display, memory, angleMode, isNewEntry, error }

import { useReducer, useCallback } from 'react'

function factorial(n) {
  if (n < 0) return NaN
  if (n === 0 || n === 1) return 1
  if (n > 170) return Infinity
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function deg2rad(x) { return x * Math.PI / 180 }

function formatNum(n) {
  if (typeof n !== 'number' || !isFinite(n)) return 'Error'
  const s = String(n)
  if (s.includes('.') && s.split('.')[1].length > 10) return Number(n.toPrecision(10)).toString()
  if (s.length > 16) return n.toExponential(6)
  return s
}

function toEvalStr(expr, angleMode) {
  let s = expr
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
    .replace(/π/g, 'Math.PI')
    // e as constant when standalone, not part of "exp" or numbers
    .replace(/(?<![.a-zA-Z])e(?![.a-zA-Z0-9])/g, 'Math.E')
    .replace(/sin\(/g, angleMode === 'deg' ? 'Math.sin(deg2rad(' : 'Math.sin(')
    .replace(/cos\(/g, angleMode === 'deg' ? 'Math.cos(deg2rad(' : 'Math.cos(')
    .replace(/tan\(/g, angleMode === 'deg' ? 'Math.tan(deg2rad(' : 'Math.tan(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3')
    .replace(/\^/g, '**')
    .replace(/(\d+)!/g, 'factorial($1)')
    .replace(/×10/g, '*10')
  return s
}

function evaluate(expr, angleMode) {
  const evalStr = toEvalStr(expr, angleMode)
  try {
    const fn = new Function('deg2rad', 'factorial', `return (${evalStr})`)
    const result = fn(deg2rad, factorial)
    return { value: formatNum(result), error: null }
  } catch {
    return { value: 'Error', error: 'Error' }
  }
}

function lastChar(s) {
  return s.length > 0 ? s[s.length - 1] : ''
}

function trimExpr(expr) {
  // Remove trailing operator or open paren
  return expr.replace(/[\s+\-*/÷×\^()]$/, '')
}

export const INITIAL_STATE = {
  expr: '',
  display: '0',
  memory: 0,
  angleMode: 'deg',
  isNewEntry: true,
  error: null,
}

export function scientificReducer(state, action) {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      if (state.error) return { ...INITIAL_STATE, expr: action.digit, display: action.digit, isNewEntry: false }
      if (state.isNewEntry) {
        return {
          ...state,
          expr: action.digit,
          display: action.digit,
          isNewEntry: false,
          error: null,
        }
      }
      const next = state.display === '0' ? action.digit : state.display + action.digit
      return {
        ...state,
        expr: state.expr + action.digit,
        display: next,
      }
    }

    case 'INPUT_DECIMAL': {
      if (state.error) return { ...INITIAL_STATE, expr: '0.', display: '0.' }
      if (state.isNewEntry) {
        return { ...state, expr: '0.', display: '0.', isNewEntry: false }
      }
      if (state.display.includes('.')) return state
      return {
        ...state,
        expr: state.expr + '.',
        display: state.display + '.',
      }
    }

    case 'INPUT_OPERATOR': {
      if (state.error) return { ...INITIAL_STATE }
      const op = action.operator
      // Replace trailing operator if exists
      const trimmed = trimExpr(state.expr)
      return {
        ...state,
        expr: trimmed + op,
        display: op,
        isNewEntry: true,
      }
    }

    case 'UNARY_FUNC': {
      if (state.error) return { ...INITIAL_STATE }
      const fn = action.fn
      const currentNum = parseFloat(state.display) || 0
      let result
      switch (fn) {
        case '1/x': result = currentNum !== 0 ? 1 / currentNum : NaN; break
        case 'x²': result = currentNum * currentNum; break
        case 'x³': result = currentNum * currentNum * currentNum; break
        case '√': result = Math.sqrt(currentNum); break
        case 'log': result = Math.log10(currentNum); break
        case 'ln': result = Math.log(currentNum); break
        case '10ⁿ': result = Math.pow(10, currentNum); break
        case 'n!': result = factorial(Math.round(currentNum)); break
        default: result = currentNum
      }
      const formatted = formatNum(result)
      if (formatted === 'Error') return { ...INITIAL_STATE, error: 'Error' }
      // Build expression display
      const exprDisplay = `${state.expr}${fn}(${state.display})`
      return {
        ...state,
        expr: exprDisplay,
        display: formatted,
        isNewEntry: true,
      }
    }

    case 'TRIG_FUNC': {
      if (state.error) return { ...INITIAL_STATE }
      const tfn = action.fn // 'sin', 'cos', 'tan'
      const currentNum = parseFloat(state.display) || 0
      const rad = state.angleMode === 'deg' ? currentNum * Math.PI / 180 : currentNum
      let result
      switch (tfn) {
        case 'sin': result = Math.sin(rad); break
        case 'cos': result = Math.cos(rad); break
        case 'tan': result = Math.tan(rad); break
        default: result = 0
      }
      const formatted = formatNum(result)
      if (formatted === 'Error') return { ...INITIAL_STATE, error: 'Error' }
      const exprDisplay = `${state.expr}${tfn}(${state.display})`
      return {
        ...state,
        expr: exprDisplay,
        display: formatted,
        isNewEntry: true,
      }
    }

    case 'PAREN': {
      if (state.error) return { ...INITIAL_STATE }
      const p = action.paren // '(' or ')'
      if (p === '(') {
        return {
          ...state,
          expr: state.expr + '(',
          display: '(',
          isNewEntry: true,
        }
      }
      // Ensure we have matching open paren somewhere
      const openCount = (state.expr.match(/\(/g) || []).length
      const closeCount = (state.expr.match(/\)/g) || []).length
      if (closeCount >= openCount) return state
      return {
        ...state,
        expr: state.expr + ')',
        display: ')',
        isNewEntry: true,
      }
    }

    case 'CONSTANT': {
      const next = { ...INITIAL_STATE, angleMode: state.angleMode, memory: state.memory }
      if (state.error) return { ...next, expr: action.display, display: action.value, isNewEntry: true }
      return {
        ...state,
        expr: state.expr + action.display,
        display: action.value,
        isNewEntry: true,
      }
    }

    case 'EQUALS': {
      if (state.error) return { ...INITIAL_STATE }
      if (!state.expr) return state
      const { value, error } = evaluate(state.expr, state.angleMode)
      return {
        ...state,
        expr: state.expr + ' =',
        display: value,
        isNewEntry: true,
        error,
      }
    }

    case 'CLEAR': return { ...INITIAL_STATE, angleMode: state.angleMode }

    case 'NEGATE': {
      if (state.error) return { ...INITIAL_STATE }
      const curr = state.display
      if (curr === '0' || curr === '') return state
      const neg = curr.startsWith('-') ? curr.slice(1) : '-' + curr
      // Simple: toggle sign of current display value only
      return { ...state, display: neg }
    }

    case 'BACKSPACE': {
      if (state.error) return { ...INITIAL_STATE }
      if (state.isNewEntry || state.expr.length === 0) return state
      const newExpr = state.expr.slice(0, -1)
      return {
        ...state,
        expr: newExpr,
        display: newExpr || '0',
        isNewEntry: newExpr.length === 0,
      }
    }

    case 'TOGGLE_ANGLE': {
      return { ...state, angleMode: state.angleMode === 'deg' ? 'rad' : 'deg' }
    }

    case 'MEMORY': {
      const currentNum = parseFloat(state.display) || 0
      switch (action.op) {
        case 'MC': return { ...state, memory: 0 }
        case 'MR': return { ...state, expr: state.expr + String(state.memory), display: String(state.memory), isNewEntry: true }
        case 'M+': return { ...state, memory: state.memory + currentNum }
        case 'M-': return { ...state, memory: state.memory - currentNum }
        default: return state
      }
    }

    default:
      return state
  }
}
