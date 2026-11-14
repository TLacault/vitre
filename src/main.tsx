import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/instrument-serif'
import './styles.css'
import { load, useSettings } from './settings'
import { Background } from './Background'
import { Home } from './Home'
import { SettingsMenu } from './Settings'

const fonts = { geist: "'Geist Variable'", serif: "'Instrument Serif'", mono: "'Geist Mono Variable'" }

function App() {
  const s = useSettings()
  const [run, setRun] = useState(0)
  useEffect(() => {
    const again = () => setRun(r => r + 1)
    addEventListener('vitre:replay', again)
    return () => removeEventListener('vitre:replay', again)
  }, [])
  useEffect(() => {
    const dark = s.theme === 'dark' || (s.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
    const r = document.documentElement
    r.dataset.theme = dark ? 'dark' : 'light'
    r.dataset.entrance = s.motion.entrance
    r.dataset.font = s.font
    const v = {
      '--accent': s.accent,
      '--tint': s.glass.tint,
      '--frost': `${s.glass.frost}px`,
      '--sat': s.glass.saturate,
      '--rim': s.glass.rim,
      '--radius': `${s.glass.radius}px`,
      '--display': fonts[s.font],
      '--dur': `${s.motion.duration}ms`,
      '--stagger': `${s.motion.stagger}ms`,
    }
    for (const [k, val] of Object.entries(v)) r.style.setProperty(k, String(val))
  }, [s])
  return (
    <div className="app">
      <Background />
      <Home key={run} />
      <SettingsMenu />
    </div>
  )
}

load().then(() => createRoot(document.getElementById('root')!).render(<App />))
