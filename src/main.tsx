import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource/instrument-serif'
import 'glisse/styles.css'
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
      '--lg-fill': s.accent,
      '--lg-on': s.accent,
      '--accent': s.accent,
      '--lg-glass': dark ? `rgb(30 30 34 / ${s.glass.tint})` : `rgb(255 255 255 / ${s.glass.tint})`,
      '--lg-blur': `${s.glass.frost}px`,
      '--lg-glass-bend': s.glass.bend,
      '--lg-glass-dispersion': s.glass.dispersion,
      '--lg-rim-shine': s.glass.rim,
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
