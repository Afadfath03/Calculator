"""Calculator engines — port of JS reducers to Python."""

import math
from dataclasses import dataclass
from typing import Optional


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fmt(n: float) -> str:
    if not math.isfinite(n):
        return 'Error'
    s = str(n)
    if '.' in s and len(s.split('.')[1]) > 10:
        return str(round(n, 10))
    if len(s) > 16:
        return f'{n:.6e}'
    return s


# ---------------------------------------------------------------------------
# Basic Engine
# ---------------------------------------------------------------------------

@dataclass
class BasicState:
    current: str = '0'
    previous: str = ''
    operator: Optional[str] = None
    is_new_entry: bool = True
    expression: str = ''
    error: Optional[str] = None


class BasicEngine:
    """Standard arithmetic: +, -, ×, ÷, %, ±."""

    @staticmethod
    def initial() -> BasicState:
        return BasicState()

    def input_digit(self, st: BasicState, digit: str) -> BasicState:
        if st.error:
            return BasicState(current=digit)
        if st.is_new_entry:
            return BasicState(current=digit, is_new_entry=False)
        if len(st.current) >= 16:
            return st
        cur = digit if st.current == '0' else st.current + digit
        return BasicState(**{**st.__dict__, 'current': cur})

    def input_decimal(self, st: BasicState) -> BasicState:
        if st.error:
            return BasicState(current='0.')
        if st.is_new_entry:
            return BasicState(**{**st.__dict__, 'current': '0.', 'is_new_entry': False})
        if '.' in st.current:
            return st
        return BasicState(**{**st.__dict__, 'current': st.current + '.'})

    def input_operator(self, st: BasicState, op: str) -> BasicState:
        if st.error:
            return BasicState()
        if st.operator and not st.is_new_entry:
            a, b = float(st.previous), float(st.current)
            r = self._apply(a, st.operator, b)
            if not math.isfinite(r):
                return BasicState(error='Error', current='Error')
            f = _fmt(r)
            return BasicState(current=f, previous=f, operator=op, is_new_entry=True, expression=f'{f} {op}')
        return BasicState(**{**st.__dict__, 'previous': st.current, 'operator': op, 'is_new_entry': True, 'expression': f'{st.current} {op}'})

    def calculate(self, st: BasicState) -> BasicState:
        if st.error or not st.operator:
            return BasicState() if st.error else st
        a, b = float(st.previous), float(st.current)
        r = self._apply(a, st.operator, b)
        if not math.isfinite(r):
            return BasicState(error='Error', current='Error')
        f = _fmt(r)
        return BasicState(current=f, previous=f, operator=None, is_new_entry=True, expression=f'{st.previous} {st.operator} {st.current} =')

    def clear(self, _st: BasicState = None) -> BasicState:
        return BasicState()

    def clear_entry(self, st: BasicState) -> BasicState:
        if st.error:
            return BasicState()
        return BasicState(**{**st.__dict__, 'current': '0', 'is_new_entry': True})

    def negate(self, st: BasicState) -> BasicState:
        if st.error or st.current == '0':
            return st
        cur = st.current[1:] if st.current.startswith('-') else '-' + st.current
        return BasicState(**{**st.__dict__, 'current': cur})

    def percentage(self, st: BasicState) -> BasicState:
        if st.error:
            return st
        r = float(st.current) / 100
        return BasicState(**{**st.__dict__, 'current': _fmt(r), 'is_new_entry': True})

    def backspace(self, st: BasicState) -> BasicState:
        if st.error:
            return BasicState()
        if st.is_new_entry:
            return st
        n = '0' if len(st.current) <= 1 else st.current[:-1]
        return BasicState(**{**st.__dict__, 'current': n, 'is_new_entry': n == '0'})

    @staticmethod
    def _apply(a: float, op: str, b: float) -> float:
        if op == '+': return a + b
        if op == '-': return a - b
        if op == '×': return a * b
        if op == '÷': return a / b if b != 0 else float('nan')
        return b


# ---------------------------------------------------------------------------
# Scientific Engine
# ---------------------------------------------------------------------------

@dataclass
class SciState:
    expr: str = ''
    display: str = '0'
    memory: float = 0.0
    angle_mode: str = 'deg'
    is_new_entry: bool = True
    error: Optional[str] = None


def _deg2rad(x: float) -> float:
    return x * math.pi / 180


def _factorial(n: int) -> float:
    if n < 0:
        return float('nan')
    if n > 170:
        return float('inf')
    return math.factorial(n)


def _to_eval(expr: str, angle_mode: str) -> str:
    s = expr
    s = s.replace('÷', '/').replace('×', '*').replace('−', '-')
    s = s.replace('π', str(math.pi))
    s = s.replace('e', str(math.e))
    s = s.replace('sin', 'math.sin').replace('cos', 'math.cos').replace('tan', 'math.tan')
    s = s.replace('log', 'math.log10').replace('ln', 'math.log')
    s = s.replace('√', 'math.sqrt')
    s = s.replace('²', '**2').replace('³', '**3').replace('^', '**')
    import re
    s = re.sub(r'(\d+)!', r'math.factorial(\1)', s)
    if angle_mode == 'deg':
        s = s.replace('math.sin(', 'math.sin(_deg2rad(')
        s = s.replace('math.cos(', 'math.cos(_deg2rad(')
        s = s.replace('math.tan(', 'math.tan(_deg2rad(')
    return s


def _evaluate(expr: str, angle_mode: str) -> tuple[str, Optional[str]]:
    try:
        compiled = compile(_to_eval(expr, angle_mode), '<calc>', 'eval')
        result = eval(compiled, {'__builtins__': {}}, {'math': math, '_deg2rad': _deg2rad})
        return _fmt(float(result)), None
    except Exception:
        return 'Error', 'Error'


def _trim_expr(s: str) -> str:
    while s and s[-1] in ' \t+-*/÷×^()':
        s = s[:-1]
    return s


class ScientificEngine:
    """Scientific calculator: trig, log, powers, parentheses, memory."""

    @staticmethod
    def initial() -> SciState:
        return SciState()

    def input_digit(self, st: SciState, digit: str) -> SciState:
        if st.error:
            return SciState(expr=digit, display=digit, is_new_entry=False, angle_mode=st.angle_mode, memory=st.memory)
        if st.is_new_entry:
            return SciState(**{**st.__dict__, 'expr': digit, 'display': digit, 'is_new_entry': False, 'error': None})
        d = digit if st.display == '0' else st.display + digit
        return SciState(**{**st.__dict__, 'expr': st.expr + digit, 'display': d})

    def input_decimal(self, st: SciState) -> SciState:
        if st.error:
            return SciState(expr='0.', display='0.', angle_mode=st.angle_mode, memory=st.memory)
        if st.is_new_entry:
            return SciState(**{**st.__dict__, 'expr': '0.', 'display': '0.', 'is_new_entry': False})
        if '.' in st.display:
            return st
        return SciState(**{**st.__dict__, 'expr': st.expr + '.', 'display': st.display + '.'})

    def input_operator(self, st: SciState, op: str) -> SciState:
        if st.error:
            return SciState(angle_mode=st.angle_mode, memory=st.memory)
        trimmed = _trim_expr(st.expr)
        return SciState(**{**st.__dict__, 'expr': trimmed + op, 'display': op, 'is_new_entry': True})

    def equals(self, st: SciState) -> SciState:
        if st.error or not st.expr:
            return SciState() if st.error else st
        val, err = _evaluate(st.expr, st.angle_mode)
        return SciState(**{**st.__dict__, 'expr': st.expr + ' =', 'display': val, 'is_new_entry': True, 'error': err})

    def clear(self, st: SciState) -> SciState:
        return SciState(angle_mode=st.angle_mode, memory=st.memory)

    def negate(self, st: SciState) -> SciState:
        if st.error or st.display in ('0', ''):
            return st
        d = st.display[1:] if st.display.startswith('-') else '-' + st.display
        return SciState(**{**st.__dict__, 'display': d})

    def backspace(self, st: SciState) -> SciState:
        if st.error:
            return SciState(angle_mode=st.angle_mode, memory=st.memory)
        if st.is_new_entry or not st.expr:
            return st
        ne = st.expr[:-1]
        return SciState(**{**st.__dict__, 'expr': ne, 'display': ne or '0', 'is_new_entry': not ne})

    def paren(self, st: SciState, paren: str) -> SciState:
        if st.error:
            return SciState(angle_mode=st.angle_mode, memory=st.memory)
        if paren == '(':
            return SciState(**{**st.__dict__, 'expr': st.expr + '(', 'display': '(', 'is_new_entry': True})
        if st.expr.count('(') <= st.expr.count(')'):
            return st
        return SciState(**{**st.__dict__, 'expr': st.expr + ')', 'display': ')', 'is_new_entry': True})

    def trig_func(self, st: SciState, fn: str) -> SciState:
        if st.error:
            return SciState(angle_mode=st.angle_mode, memory=st.memory)
        curr = float(st.display) if st.display else 0.0
        rad = _deg2rad(curr) if st.angle_mode == 'deg' else curr
        m = {'sin': math.sin, 'cos': math.cos, 'tan': math.tan}
        r = m[fn](rad)
        f = _fmt(r)
        if f == 'Error':
            return SciState(error='Error', angle_mode=st.angle_mode, memory=st.memory)
        return SciState(**{**st.__dict__, 'expr': f'{st.expr}{fn}({st.display})', 'display': f, 'is_new_entry': True})

    def unary_func(self, st: SciState, fn: str) -> SciState:
        if st.error:
            return SciState(angle_mode=st.angle_mode, memory=st.memory)
        curr = float(st.display) if st.display else 0.0
        m = {
            '1/x': lambda x: 1 / x if x != 0 else float('nan'),
            'x²': lambda x: x * x,
            'x³': lambda x: x * x * x,
            '√': math.sqrt,
            'log': math.log10,
            'ln': math.log,
            '10ⁿ': lambda x: 10 ** x,
            'n!': lambda x: _factorial(round(x)),
        }
        r = m[fn](curr)
        f = _fmt(r)
        if f == 'Error':
            return SciState(error='Error', angle_mode=st.angle_mode, memory=st.memory)
        return SciState(**{**st.__dict__, 'expr': f'{st.expr}{fn}({st.display})', 'display': f, 'is_new_entry': True})

    def constant(self, st: SciState, const: str) -> SciState:
        val = {'π': str(math.pi), 'e': str(math.e)}[const]
        if st.error:
            return SciState(expr=const, display=val, is_new_entry=True, angle_mode=st.angle_mode, memory=st.memory)
        return SciState(**{**st.__dict__, 'expr': st.expr + const, 'display': val, 'is_new_entry': True})

    def toggle_angle(self, st: SciState) -> SciState:
        return SciState(**{**st.__dict__, 'angle_mode': 'rad' if st.angle_mode == 'deg' else 'deg'})

    def memory(self, st: SciState, op: str) -> SciState:
        curr = float(st.display) if st.display else 0.0
        m = st.memory
        if op == 'MC': m = 0.0
        elif op == 'MR': return SciState(**{**st.__dict__, 'expr': st.expr + str(m), 'display': str(m), 'is_new_entry': True})
        elif op == 'M+': m += curr
        elif op == 'M-': m -= curr
        return SciState(**{**st.__dict__, 'memory': m})


# ---------------------------------------------------------------------------
# Programmer Engine
# ---------------------------------------------------------------------------

BASES: dict[str, int] = {'HEX': 16, 'DEC': 10, 'OCT': 8, 'BIN': 2}
BIT_WIDTHS = [64, 32, 16, 8]


def _mask(val: int, bits: int) -> int:
    if bits == 64:
        return val & ((1 << 64) - 1)
    return val & ((1 << bits) - 1)


def _fmt_prog(val: int, base: str, bits: int) -> str:
    masked = _mask(val, bits) if bits != 64 else val
    r = BASES[base]
    return format(masked, f'X' if r == 16 else 'd' if r == 10 else 'o' if r == 8 else 'b').upper()


def _apply_prog(a: int, op: str, b: int, bits: int) -> int:
    ops = {
        '+': lambda: a + b,
        '-': lambda: a - b,
        '×': lambda: a * b,
        '÷': lambda: a // b if b != 0 else float('nan'),
        'AND': lambda: a & b,
        'OR': lambda: a | b,
        'XOR': lambda: a ^ b,
        '<<': lambda: a << min(b, 31),
        '>>': lambda: a >> min(b, 31),
    }
    r = ops[op]()
    return _mask(r, bits) if bits != 64 else r


@dataclass
class ProgState:
    value: int = 0
    base: str = 'DEC'
    bit_width: int = 32
    display: str = '0'
    previous: int = 0
    operator: Optional[str] = None
    is_new_entry: bool = True
    expression: str = ''
    error: Optional[str] = None


def _digit_valid(dig: str, base: str) -> bool:
    r = BASES[base]
    try:
        v = int(dig, 16)
        return 0 <= v < r
    except ValueError:
        return False


class ProgrammerEngine:
    """Base conversion and bitwise operations."""

    @staticmethod
    def initial() -> ProgState:
        return ProgState()

    def set_base(self, st: ProgState, base: str) -> ProgState:
        val = _mask(st.value, st.bit_width) if st.bit_width != 64 else st.value
        return ProgState(**{**st.__dict__, 'base': base, 'display': _fmt_prog(val, base, st.bit_width), 'is_new_entry': True})

    def set_bit_width(self, st: ProgState, bits: int) -> ProgState:
        val = _mask(st.value, bits) if bits != 64 else st.value
        return ProgState(**{**st.__dict__, 'bit_width': bits, 'value': val, 'display': _fmt_prog(val, st.base, bits)})

    def input_digit(self, st: ProgState, digit: str) -> ProgState:
        d = digit.upper()
        if not _digit_valid(d, st.base):
            return st
        dv = int(d, 16)
        if st.is_new_entry or st.display == '0':
            new_val = dv
            masked = _mask(new_val, st.bit_width) if st.bit_width != 64 else new_val
            return ProgState(**{**st.__dict__, 'value': masked, 'display': _fmt_prog(masked, st.base, st.bit_width), 'is_new_entry': False, 'error': None})
        radix = BASES[st.base]
        new_val = st.value * radix + dv
        if st.bit_width == 64:
            new_val = int(st.display + d, radix)
        else:
            new_val = _mask(new_val, st.bit_width)
        return ProgState(**{**st.__dict__, 'value': new_val, 'display': _fmt_prog(new_val, st.base, st.bit_width)})

    def input_operator(self, st: ProgState, op: str) -> ProgState:
        return ProgState(**{**st.__dict__, 'previous': st.value, 'operator': op, 'is_new_entry': True, 'expression': f'{st.display} {op}'})

    def calculate(self, st: ProgState) -> ProgState:
        if not st.operator:
            return st
        r = _apply_prog(st.previous, st.operator, st.value, st.bit_width)
        if not isinstance(r, int):
            return ProgState(error='Error', display='Error', is_new_entry=True)
        return ProgState(**{**st.__dict__, 'value': r, 'display': _fmt_prog(r, st.base, st.bit_width),
                            'previous': r, 'operator': None, 'is_new_entry': True,
                            'expression': f'{_fmt_prog(st.previous, st.base, st.bit_width)} {st.operator} {_fmt_prog(st.value, st.base, st.bit_width)} ='})

    def unary_not(self, st: ProgState) -> ProgState:
        r = ~st.value
        masked = _mask(r, st.bit_width) if st.bit_width != 64 else r
        return ProgState(**{**st.__dict__, 'value': masked, 'display': _fmt_prog(masked, st.base, st.bit_width),
                            'is_new_entry': True, 'expression': f'NOT({_fmt_prog(st.value, st.base, st.bit_width)})'})

    def clear(self, _st: ProgState = None) -> ProgState:
        return ProgState()

    def backspace(self, st: ProgState) -> ProgState:
        if st.is_new_entry or len(st.display) <= 1:
            return ProgState()
        nd = st.display[:-1]
        r = BASES[st.base]
        nv = int(nd, r) if nd else 0
        return ProgState(**{**st.__dict__, 'value': _mask(nv, st.bit_width) if st.bit_width != 64 else nv, 'display': nd or '0'})
