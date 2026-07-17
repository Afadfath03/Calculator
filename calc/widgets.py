"""Custom Textual widgets for the calculator."""

from __future__ import annotations

from textual.widgets import Static, Button
from textual.reactive import reactive


class Display(Static):
    """Calculator display showing expression and value."""

    value: reactive[str] = reactive('0', init=False)
    expression: reactive[str] = reactive('', init=False)
    error: reactive[str | None] = reactive(None, init=False)

    def __init__(self) -> None:
        super().__init__('0', id='display')
        self.can_focus = False

    def watch_value(self, val: str) -> None:
        self.update(self._render())

    def watch_expression(self, expr: str) -> None:
        self.update(self._render())

    def watch_error(self, err: str | None) -> None:
        self.update(self._render())

    def _render(self) -> str:
        if self.error:
            return f'[red]{self.error}[/red]'
        parts = []
        if self.expression:
            parts.append(f'[dim]{self.expression}[/dim]')
        parts.append(f'[white]{self.value}[/white]')
        return '\n'.join(parts)


class CalcButton(Button):
    """A calculator button with a CSS class set at init."""

    def __init__(self, label: str, btn_class: str = '', id: str | None = None) -> None:
        classes = f'calc-btn {btn_class}'
        super().__init__(label, classes=classes, id=id)
