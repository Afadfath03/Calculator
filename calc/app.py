"""Textual TUI Calculator — Basic, Scientific, Programmer."""

from __future__ import annotations

from textual.app import App, ComposeResult
from textual.screen import Screen
from textual.containers import Horizontal, Grid
from textual.widgets import Header, Footer, Button, Static
from textual import events

from widgets import Display, CalcButton
from engine import (
    BasicEngine, BasicState,
    ScientificEngine, SciState,
    ProgrammerEngine, ProgState,
    BIT_WIDTHS, BASES, _fmt_prog,
)


# ---------------------------------------------------------------------------
# Basic Calculator Screen
# ---------------------------------------------------------------------------

class BasicScreen(Screen):
    def __init__(self) -> None:
        super().__init__()
        self.engine = BasicEngine()
        self.state = self.engine.initial()

    def compose(self) -> ComposeResult:
        yield Display(id='basic-display')
        with Horizontal(classes='calc-body'):
            with Grid(classes='calc-digits-panel'):
                yield CalcButton('C', 'calc-btn-func')
                yield CalcButton('⌫', 'calc-btn-func')
                yield CalcButton('%', 'calc-btn-func')
                yield CalcButton('7', 'calc-btn-digit')
                yield CalcButton('8', 'calc-btn-digit')
                yield CalcButton('9', 'calc-btn-digit')
                yield CalcButton('4', 'calc-btn-digit')
                yield CalcButton('5', 'calc-btn-digit')
                yield CalcButton('6', 'calc-btn-digit')
                yield CalcButton('1', 'calc-btn-digit')
                yield CalcButton('2', 'calc-btn-digit')
                yield CalcButton('3', 'calc-btn-digit')
                yield CalcButton('±', 'calc-btn-func')
                yield CalcButton('0', 'calc-btn-digit')
                yield CalcButton('.', 'calc-btn-digit')
            yield Static('', classes='calc-panel-divider')
            with Grid(classes='calc-ops-panel'):
                yield CalcButton('÷', 'calc-btn-operator')
                yield CalcButton('×', 'calc-btn-operator')
                yield CalcButton('−', 'calc-btn-operator')
                yield CalcButton('+', 'calc-btn-operator')
                yield CalcButton('=', 'calc-btn-operator')

    def on_mount(self) -> None:
        self._sync()

    def _sync(self) -> None:
        d = self.query_one('#basic-display', Display)
        d.value = self.state.current
        d.expression = self.state.expression
        d.error = self.state.error

    def _act(self, action: str, **kw) -> None:
        eng = self.engine
        st = self.state
        m = {
            'INPUT_DIGIT': lambda: eng.input_digit(st, kw['digit']),
            'INPUT_DECIMAL': lambda: eng.input_decimal(st),
            'INPUT_OPERATOR': lambda: eng.input_operator(st, kw['operator']),
            'CALCULATE': lambda: eng.calculate(st),
            'CLEAR': lambda: eng.clear(st),
            'CLEAR_ENTRY': lambda: eng.clear_entry(st),
            'NEGATE': lambda: eng.negate(st),
            'PERCENTAGE': lambda: eng.percentage(st),
            'BACKSPACE': lambda: eng.backspace(st),
        }
        self.state = m[action]()
        self._sync()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        label = event.button.label
        cls = event.button.classes
        if 'calc-btn-digit' in cls:
            self._act('INPUT_DIGIT', digit=label)
        elif 'calc-btn-operator' in cls:
            self._act('CALCULATE' if label == '=' else 'INPUT_OPERATOR', operator=label)
        elif 'calc-btn-func' in cls:
            act = {'C': 'CLEAR_ENTRY', '⌫': 'BACKSPACE', '%': 'PERCENTAGE', '±': 'NEGATE'}.get(label, 'CLEAR')
            self._act(act)
        self._sync()

    def on_key(self, event: events.Key) -> None:
        k = event.key
        if k.isdigit() and len(k) == 1:
            self._act('INPUT_DIGIT', digit=k)
        elif k == 'period':
            self._act('INPUT_DECIMAL')
        elif k == 'plus':
            self._act('INPUT_OPERATOR', operator='+')
        elif k == 'minus':
            self._act('INPUT_OPERATOR', operator='-')
        elif k == 'asterisk':
            self._act('INPUT_OPERATOR', operator='×')
        elif k == 'slash':
            self._act('INPUT_OPERATOR', operator='÷')
        elif k in ('enter', 'equal'):
            self._act('CALCULATE')
        elif k == 'escape':
            self._act('CLEAR')
        elif k == 'delete':
            self._act('CLEAR_ENTRY')
        elif k == 'backspace':
            self._act('BACKSPACE')
        elif k == 'percent':
            self._act('PERCENTAGE')
        else:
            return
        event.stop()
        self._sync()


# ---------------------------------------------------------------------------
# Scientific Calculator Screen
# ---------------------------------------------------------------------------

class ScientificScreen(Screen):
    def __init__(self) -> None:
        super().__init__()
        self.engine = ScientificEngine()
        self.state = self.engine.initial()

    def compose(self) -> ComposeResult:
        yield Display(id='sci-display')
        with Horizontal(classes='angle-bar'):
            yield Button('Deg', id='deg-btn', classes='calc-btn calc-btn-toggle')
            yield Button('Rad', id='rad-btn', classes='calc-btn calc-btn-toggle')
        with Horizontal(classes='calc-body', id='func-body'):
            with Grid(classes='calc-digits-panel', id='func-left'):
                for lbl in ('(', ')', 'MC', 'MR', 'M+', 'M−'):
                    yield CalcButton(lbl, 'calc-btn-func')
            yield Static('', classes='calc-panel-divider')
            with Grid(classes='calc-digits-panel', id='func-right'):
                for lbl in ('sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'x³', 'xⁿ', '10ⁿ', 'n!', '1/x', 'π', 'e'):
                    yield CalcButton(lbl, 'calc-btn-func')
        with Horizontal(classes='calc-body'):
            with Grid(classes='calc-digits-panel'):
                yield CalcButton('C', 'calc-btn-func')
                yield CalcButton('⌫', 'calc-btn-func')
                yield CalcButton('±', 'calc-btn-func')
                yield CalcButton('7', 'calc-btn-digit')
                yield CalcButton('8', 'calc-btn-digit')
                yield CalcButton('9', 'calc-btn-digit')
                yield CalcButton('4', 'calc-btn-digit')
                yield CalcButton('5', 'calc-btn-digit')
                yield CalcButton('6', 'calc-btn-digit')
                yield CalcButton('1', 'calc-btn-digit')
                yield CalcButton('2', 'calc-btn-digit')
                yield CalcButton('3', 'calc-btn-digit')
                yield CalcButton('0', 'calc-btn-digit')
                yield CalcButton('.', 'calc-btn-digit')
            yield Static('', classes='calc-panel-divider')
            with Grid(classes='calc-ops-panel'):
                yield CalcButton('÷', 'calc-btn-operator')
                yield CalcButton('×', 'calc-btn-operator')
                yield CalcButton('−', 'calc-btn-operator')
                yield CalcButton('+', 'calc-btn-operator')
                yield CalcButton('=', 'calc-btn-operator')

    def on_mount(self) -> None:
        self._sync()

    def _sync(self) -> None:
        d = self.query_one('#sci-display', Display)
        d.value = self.state.display
        d.expression = self.state.expr
        d.error = self.state.error
        for btn_id, mode in [('#deg-btn', 'deg'), ('#rad-btn', 'rad')]:
            btn = self.query_one(btn_id, Button)
            cls = btn.classes.replace(' active', '')
            if self.state.angle_mode == mode:
                cls += ' active'
            btn.classes = cls

    def _act(self, action: str, **kw) -> None:
        eng = self.engine
        st = self.state
        m = {
            'INPUT_DIGIT': lambda: eng.input_digit(st, kw['digit']),
            'INPUT_DECIMAL': lambda: eng.input_decimal(st),
            'INPUT_OPERATOR': lambda: eng.input_operator(st, kw['operator']),
            'EQUALS': lambda: eng.equals(st),
            'CLEAR': lambda: eng.clear(st),
            'NEGATE': lambda: eng.negate(st),
            'BACKSPACE': lambda: eng.backspace(st),
            'PAREN': lambda: eng.paren(st, kw['paren']),
            'TRIG_FUNC': lambda: eng.trig_func(st, kw['fn']),
            'UNARY_FUNC': lambda: eng.unary_func(st, kw['fn']),
            'CONSTANT': lambda: eng.constant(st, kw['display']),
            'TOGGLE_ANGLE': lambda: eng.toggle_angle(st),
            'MEMORY': lambda: eng.memory(st, kw['op']),
        }
        self.state = m[action]()
        self._sync()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        label = event.button.label
        cls = event.button.classes
        if 'calc-btn-toggle' in cls:
            self._act('TOGGLE_ANGLE')
            return
        if 'calc-btn-digit' in cls:
            self._act('INPUT_DIGIT', digit=label)
        elif 'calc-btn-operator' in cls:
            self._act('EQUALS' if label == '=' else 'INPUT_OPERATOR', operator=label)
        elif 'calc-btn-func' in cls:
            if label in ('MC', 'MR', 'M+', 'M−'):
                self._act('MEMORY', op={'MC': 'MC', 'MR': 'MR', 'M+': 'M+', 'M−': 'M-'}[label])
            elif label in ('(', ')'):
                self._act('PAREN', paren=label)
            elif label in ('sin', 'cos', 'tan'):
                self._act('TRIG_FUNC', fn=label)
            elif label in ('1/x', 'x²', 'x³', '√', 'log', 'ln', '10ⁿ', 'n!'):
                self._act('UNARY_FUNC', fn=label)
            elif label in ('π', 'e'):
                self._act('CONSTANT', display=label)
            elif label == 'xⁿ':
                self._act('INPUT_OPERATOR', operator='^')
            elif label == 'C':
                self._act('CLEAR')
            elif label == '⌫':
                self._act('BACKSPACE')
            elif label == '±':
                self._act('NEGATE')
        self._sync()

    def on_key(self, event: events.Key) -> None:
        k = event.key
        if k.isdigit() and len(k) == 1:
            self._act('INPUT_DIGIT', digit=k)
        elif k == 'period':
            self._act('INPUT_DECIMAL')
        elif k == 'plus':
            self._act('INPUT_OPERATOR', operator='+')
        elif k == 'minus':
            self._act('INPUT_OPERATOR', operator='-')
        elif k == 'asterisk':
            self._act('INPUT_OPERATOR', operator='×')
        elif k == 'slash':
            self._act('INPUT_OPERATOR', operator='÷')
        elif k == 'caret':
            self._act('INPUT_OPERATOR', operator='^')
        elif k == 'paren_left':
            self._act('PAREN', paren='(')
        elif k == 'paren_right':
            self._act('PAREN', paren=')')
        elif k in ('enter', 'equal'):
            self._act('EQUALS')
        elif k == 'escape':
            self._act('CLEAR')
        elif k == 'backspace':
            self._act('BACKSPACE')
        else:
            return
        event.stop()
        self._sync()


# ---------------------------------------------------------------------------
# Programmer Calculator Screen
# ---------------------------------------------------------------------------

ALL_HEX = [f'{i:X}' for i in range(16)]


class ProgrammerScreen(Screen):
    def __init__(self) -> None:
        super().__init__()
        self.engine = ProgrammerEngine()
        self.state = self.engine.initial()

    def compose(self) -> ComposeResult:
        yield Display(id='prog-display')
        for base in ('HEX', 'DEC', 'OCT', 'BIN'):
            yield Static('', id=f'row-{base.lower()}', classes='prog-row')
        with Horizontal(classes='prog-toggles'):
            for b in ('HEX', 'DEC', 'OCT', 'BIN'):
                yield Button(b, id=f'base-{b.lower()}', classes='calc-btn calc-btn-toggle')
        with Horizontal(classes='prog-toggles'):
            for w in BIT_WIDTHS:
                yield Button(str(w), id=f'bits-{w}', classes='calc-btn calc-btn-toggle')
        with Horizontal(classes='calc-body'):
            with Grid(classes='calc-digits-panel', id='prog-left'):
                for lbl in ('AND', 'OR', 'XOR', '<<', '>>', 'C', '⌫', 'NOT'):
                    yield CalcButton(lbl, 'calc-btn-func')
                for dig in ALL_HEX:
                    yield CalcButton(dig, 'calc-btn-digit')
            yield Static('', classes='calc-panel-divider')
            with Grid(classes='calc-ops-panel'):
                yield CalcButton('÷', 'calc-btn-operator')
                yield CalcButton('×', 'calc-btn-operator')
                yield CalcButton('−', 'calc-btn-operator')
                yield CalcButton('+', 'calc-btn-operator')
                yield CalcButton('=', 'calc-btn-operator')

    def on_mount(self) -> None:
        self._sync()

    def _sync(self) -> None:
        st = self.state
        d = self.query_one('#prog-display', Display)
        d.value = st.display
        d.expression = st.expression
        d.error = st.error
        for b, key in [('HEX','hex'), ('DEC','dec'), ('OCT','oct'), ('BIN','bin')]:
            row = self.query_one(f'#row-{key}', Static)
            row.update(f'[dim]{b}[/dim]  [white]{_fmt_prog(st.value, b, st.bit_width)}[/white]')
        for b in ('HEX', 'DEC', 'OCT', 'BIN'):
            btn = self.query_one(f'#base-{b.lower()}', Button)
            btn.classes = btn.classes.replace(' active', '') + (' active' if b == st.base else '')
        for w in BIT_WIDTHS:
            btn = self.query_one(f'#bits-{w}', Button)
            btn.classes = btn.classes.replace(' active', '') + (' active' if w == st.bit_width else '')

    def _act(self, action: str, **kw) -> None:
        eng = self.engine
        st = self.state
        m = {
            'INPUT_DIGIT': lambda: eng.input_digit(st, kw['digit']),
            'INPUT_OPERATOR': lambda: eng.input_operator(st, kw['operator']),
            'CALCULATE': lambda: eng.calculate(st),
            'CLEAR': lambda: eng.clear(st),
            'BACKSPACE': lambda: eng.backspace(st),
            'UNARY_NOT': lambda: eng.unary_not(st),
            'SET_BASE': lambda: eng.set_base(st, kw['base']),
            'SET_BIT_WIDTH': lambda: eng.set_bit_width(st, kw['bit_width']),
        }
        self.state = m[action]()
        self._sync()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        label = event.button.label
        pid = event.button.id or ''
        cls = event.button.classes
        if pid.startswith('base-') and label in BASES:
            self._act('SET_BASE', base=label); return
        if pid.startswith('bits-'):
            self._act('SET_BIT_WIDTH', bit_width=int(label)); return
        if 'calc-btn-digit' in cls:
            self._act('INPUT_DIGIT', digit=label)
        elif 'calc-btn-operator' in cls:
            self._act('CALCULATE' if label == '=' else 'INPUT_OPERATOR', operator=label)
        elif 'calc-btn-func' in cls:
            if label in ('AND', 'OR', 'XOR', '<<', '>>'):
                self._act('INPUT_OPERATOR', operator=label)
            elif label == 'NOT':
                self._act('UNARY_NOT')
            elif label == 'C':
                self._act('CLEAR')
            elif label == '⌫':
                self._act('BACKSPACE')
        self._sync()

    def on_key(self, event: events.Key) -> None:
        k = event.key
        if k.isdigit() and len(k) == 1:
            self._act('INPUT_DIGIT', digit=k)
            event.stop(); self._sync(); return
        upper = k.upper()
        if len(upper) == 1 and 'A' <= upper <= 'F':
            self._act('INPUT_DIGIT', digit=upper)
            event.stop(); self._sync(); return
        if k == 'plus':
            self._act('INPUT_OPERATOR', operator='+')
        elif k == 'minus':
            self._act('INPUT_OPERATOR', operator='-')
        elif k == 'asterisk':
            self._act('INPUT_OPERATOR', operator='×')
        elif k == 'slash':
            self._act('INPUT_OPERATOR', operator='÷')
        elif k in ('enter', 'equal'):
            self._act('CALCULATE')
        elif k == 'escape':
            self._act('CLEAR')
        elif k == 'backspace':
            self._act('BACKSPACE')
        else:
            return
        event.stop()
        self._sync()


# ---------------------------------------------------------------------------
# Main App
# ---------------------------------------------------------------------------

class CalculatorApp(App):
    """Multi-mode calculator TUI."""

    CSS_PATH = 'calc.tcss'

    SCREENS = {
        'basic': BasicScreen,
        'scientific': ScientificScreen,
        'programmer': ProgrammerScreen,
    }

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal(classes='nav-bar'):
            for mode_id, mode_label in [('basic', 'Basic'), ('scientific', 'Scientific'), ('programmer', 'Programmer')]:
                yield Button(mode_label, id=f'nav-{mode_id}', classes='nav-btn')
        yield Footer()

    def on_mount(self) -> None:
        self.push_screen('basic')
        self._sync_nav('basic')

    def _sync_nav(self, active: str) -> None:
        for mode_id in ('basic', 'scientific', 'programmer'):
            btn = self.query_one(f'#nav-{mode_id}', Button)
            btn.classes = btn.classes.replace(' active', '') + (' active' if mode_id == active else '')

    def on_button_pressed(self, event: Button.Pressed) -> None:
        btn_id = event.button.id or ''
        if btn_id.startswith('nav-'):
            mode = btn_id.replace('nav-', '')
            if mode in self.SCREENS:
                self.switch_screen(mode)
                self._sync_nav(mode)


def main() -> None:
    app = CalculatorApp()
    app.run()


if __name__ == '__main__':
    main()
