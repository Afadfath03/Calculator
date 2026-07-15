# Calculator

Multi-mode calculator web app built with React and Vite.

## Modes

- **Basic** — standard arithmetic (+, −, ×, ÷), percentage, negation, clear entry
- **Scientific** — trig functions (sin/cos/tan), log/ln, square root, powers, factorial, constants (π, e), parentheses, memory (MC/MR/M+/M−), degree/radian toggle
- **Programmer** — base conversion (HEX/DEC/OCT/BIN), bitwise operations (AND/OR/XOR/NOT, shifts), configurable bit width (8/16/32/64)

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 18
- Vite 5
- Pure CSS with CSS custom properties (light & dark theme)
- State management via `useReducer` per calculator mode
- No external UI or state libraries

## Theme

Toggle between dark and light mode in the sidebar. Preference is persisted in `localStorage`.
