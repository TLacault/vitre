import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Glass, Menu } from 'glisse'
import { Check, Search } from 'lucide-react'
import { engines, set, useSettings, type Tile } from './settings'
import { favicon, icons } from './icons'

const at = (i: number) => ({ '--i': i }) as CSSProperties

function Clock({ i }: { i: number }) {
  const c = useSettings().clock
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: c.seconds ? '2-digit' : undefined, hour12: !c.h24 })
  return (
    <div className="clock enter" style={{ ...at(i), fontSize: `calc(clamp(4rem, 11vw, 8.5rem) * ${c.size})` }}>
      <time>{time}</time>
      {c.date && <p>{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
    </div>
  )
}

function SearchBar({ i }: { i: number }) {
  const s = useSettings().search
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (s.autofocus) input.current?.focus() }, [])
  const go = () => {
    const text = q.trim()
    if (!text) return
    const looksLikeUrl = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(text) && !text.includes(' ')
    const url = looksLikeUrl ? `https://${text}` : (s.engine === 'custom' ? s.custom : engines[s.engine]!.url).replace('%s', encodeURIComponent(text))
    if (s.newTab) window.open(url, '_blank')
    else location.href = url
  }
  return (
    <div className="search enter" style={{ ...at(i), width: `min(${s.width}px, 100%)` }}>
      <Glass className="search-glass">
        <Menu
          aria-label="Search engine"
          icon={<Search size={18} />}
          items={Object.entries(engines).map(([k, e]) => ({ label: e.label, icon: k === s.engine ? <Check size={16} /> : <span />, onSelect: () => set('search.engine', k) }))}
        />
        <input
          ref={input}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && go()}
          placeholder={s.placeholder}
          aria-label="Search"
          spellCheck={false}
          autoComplete="off"
        />
        <kbd>{engines[s.engine]?.label}</kbd>
      </Glass>
    </div>
  )
}

function TileIcon({ t }: { t: Tile }) {
  const [broken, setBroken] = useState(false)
  const Icon = icons[t.icon]
  if (Icon) return <Icon size="42%" strokeWidth={1.6} />
  if (t.icon === 'favicon' && !broken) return <img src={favicon(t.url)} alt="" onError={() => setBroken(true)} draggable={false} />
  return <span className="letter">{t.name.trim()[0]?.toUpperCase() ?? '·'}</span>
}

function Tiles({ i }: { i: number }) {
  const t = useSettings().tiles
  return (
    <nav className="tiles" aria-label="Favorites" style={{ '--tile': `${t.size}px`, '--tile-r': t.shape === 'circle' ? '50%' : '30%' } as CSSProperties}>
      {t.list.map((tile, k) => (
        <a key={tile.id} className="tile enter" style={at(i + k)} href={tile.url} target={t.newTab ? '_blank' : undefined} rel="noreferrer" title={tile.name}>
          <Glass className="tile-glass"><TileIcon t={tile} /></Glass>
          {t.labels && <span className="tile-label">{tile.name}</span>}
        </a>
      ))}
    </nav>
  )
}

export function Home() {
  const s = useSettings()
  let i = 0
  return (
    <main className="home" style={{ paddingTop: `calc(${s.layout.offset * 100}svh - 6rem)` }}>
      {s.clock.show && <Clock i={i++} />}
      {s.search.show && <SearchBar i={i++} />}
      {s.tiles.show && <Tiles i={i} />}
    </main>
  )
}
