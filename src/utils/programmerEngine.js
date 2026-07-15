// Programmer calculator — base conversion, bitwise ops, bit-width selector

const BASES = { HEX: 16, DEC: 10, OCT: 8, BIN: 2 }
const BIT_WIDTHS = [64, 32, 16, 8]

function applyMask(val, bitWidth) {
  if (bitWidth === 64) {
    const b = BigInt(val)
    return Number(BigInt.asUintN(64, b))
  }
  const mask = (1 << bitWidth) - 1
  return val & mask
}

function formatValue(val, base, bitWidth) {
  const masked = bitWidth === 64 ? val : applyMask(val, bitWidth)
  const radix = BASES[base]
  return masked.toString(radix).toUpperCase()
}

function formatHex(val, bitWidth) {
  const masked = bitWidth === 64 ? val : applyMask(val, bitWidth)
  let s = masked.toString(16).toUpperCase()
  if (bitWidth === 8) s = s.padStart(2, '0')
  else if (bitWidth === 16) s = s.padStart(4, '0')
  else if (bitWidth === 32) s = s.padStart(8, '0')
  return s
}

function formatBin(val, bitWidth) {
  const masked = bitWidth === 64 ? val : applyMask(val, bitWidth)
  let s = masked.toString(2)
  if (bitWidth === 8) s = s.padStart(8, '0')
  else if (bitWidth === 16) s = s.padStart(16, '0')
  else if (bitWidth === 32) s = s.padStart(32, '0')
  // Group in nibbles
  return s.replace(/(.{4})(?=.)/g, '$1 ')
}

function applyOp(a, op, b, bitWidth) {
  const opMap = {
    '+': () => a + b,
    '-': () => a - b,
    '×': () => a * b,
    '÷': () => b !== 0 ? Math.floor(a / b) : NaN,
    'AND': () => a & b,
    'OR': () => a | b,
    'XOR': () => a ^ b,
    '<<': () => a << Math.min(b, 31),
    '>>': () => a >> Math.min(b, 31),
  }
  const fn = opMap[op]
  if (!fn) return b
  const result = fn()
  if (bitWidth === 64) return result
  return applyMask(result, bitWidth)
}

export function programmerReducer(state, action) {
  switch (action.type) {
    case 'SET_BASE': {
      return { ...state, base: action.base, isNewEntry: true }
    }

    case 'SET_BIT_WIDTH': {
      return { ...state, bitWidth: action.bitWidth }
    }

    case 'INPUT_DIGIT': {
      const digit = action.digit.toUpperCase()
      const radix = BASES[state.base]
      // Validate digit for current base
      if (!/^[0-9A-F]$/.test(digit)) return state
      const digitVal = parseInt(digit, radix)
      if (isNaN(digitVal) || digitVal >= radix) return state

      if (state.isNewEntry || state.display === '0') {
        const newVal = digitVal
        const masked = state.bitWidth === 64 ? newVal : applyMask(newVal, state.bitWidth)
        return {
          ...state,
          value: masked,
          display: formatValue(masked, state.base, state.bitWidth),
          isNewEntry: false,
          error: null,
        }
      }

      // Append digit: newValue = oldValue * radix + digitVal
      let newVal = state.value * radix + digitVal
      if (state.bitWidth === 64) {
        // For 64-bit, we'll reparse from string to handle precision
        newVal = parseInt(state.display + digit, radix) || 0
      } else {
        newVal = applyMask(newVal, state.bitWidth)
      }
      return {
        ...state,
        value: newVal,
        display: formatValue(newVal, state.base, state.bitWidth),
      }
    }

    case 'INPUT_OPERATOR': {
      return {
        ...state,
        previous: state.value,
        operator: action.operator,
        isNewEntry: true,
        expression: `${state.display} ${action.operator}`,
      }
    }

    case 'CALCULATE': {
      if (!state.operator) return state
      const result = applyOp(state.previous, state.operator, state.value, state.bitWidth)
      if (isNaN(result)) {
        return { ...state, error: 'Error', display: 'Error', isNewEntry: true }
      }
      const masked = state.bitWidth === 64 ? result : applyMask(result, state.bitWidth)
      return {
        ...state,
        value: masked,
        display: formatValue(masked, state.base, state.bitWidth),
        previous: masked,
        operator: null,
        isNewEntry: true,
        expression: `${formatValue(state.previous, state.base, state.bitWidth)} ${state.operator} ${formatValue(state.value, state.base, state.bitWidth)} =`,
      }
    }

    case 'UNARY_NOT': {
      const result = ~state.value
      const masked = state.bitWidth === 64 ? result : applyMask(result, state.bitWidth)
      return {
        ...state,
        value: masked,
        display: formatValue(masked, state.base, state.bitWidth),
        isNewEntry: true,
        expression: `NOT(${formatValue(state.value, state.base, state.bitWidth)})`,
      }
    }

    case 'CLEAR': {
      return {
        ...state,
        value: 0,
        display: '0',
        previous: 0,
        operator: null,
        isNewEntry: true,
        expression: '',
        error: null,
      }
    }

    case 'BACKSPACE': {
      if (state.isNewEntry || state.display.length <= 1) {
        return { ...state, value: 0, display: '0', isNewEntry: true }
      }
      const newDisplay = state.display.slice(0, -1)
      const newVal = parseInt(newDisplay, BASES[state.base]) || 0
      return {
        ...state,
        value: state.bitWidth === 64 ? newVal : applyMask(newVal, state.bitWidth),
        display: newDisplay || '0',
      }
    }

    default:
      return state
  }
}

export const INITIAL_STATE = {
  value: 0,
  base: 'DEC',
  bitWidth: 32,
  display: '0',
  previous: 0,
  operator: null,
  isNewEntry: true,
  expression: '',
  error: null,
}

export { BIT_WIDTHS, BASES, formatValue, formatHex, formatBin }
