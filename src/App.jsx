import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import BasicCalculator from './components/BasicCalculator'
import ScientificCalculator from './components/ScientificCalculator'
import ProgrammerCalculator from './components/ProgrammerCalculator'
import './App.css'

const CALC_MAP = {
  basic: BasicCalculator,
  scientific: ScientificCalculator,
  programmer: ProgrammerCalculator,
}

export default function App() {
  const [mode, setMode] = useState('basic')

  const CalcComponent = CALC_MAP[mode]

  return (
    <ThemeProvider>
      <div className="app-layout">
        <Sidebar mode={mode} onModeChange={setMode} />
        <main className="app-content">
          {CalcComponent ? <CalcComponent /> : <div>Unknown mode</div>}
        </main>
      </div>
    </ThemeProvider>
  )
}
