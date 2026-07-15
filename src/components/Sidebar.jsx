import { useTheme } from '../context/ThemeContext'
import './Sidebar.css'

const MODES = [
  { key: 'basic', label: 'Basic' },
  { key: 'scientific', label: 'Scientific' },
  { key: 'programmer', label: 'Programmer' },
]

export default function Sidebar({ mode, onModeChange }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {MODES.map(m => (
          <button
            key={m.key}
            className={`sidebar-btn ${mode === m.key ? 'active' : ''}`}
            onClick={() => onModeChange(m.key)}
          >
            {m.label}
          </button>
        ))}
      </nav>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
    </aside>
  )
}
