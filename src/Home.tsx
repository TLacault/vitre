import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Glass, Menu } from './ui'
import Check from 'lucide-react/icons/check'
import Search from 'lucide-react/icons/search'
import { engines, set, useSettings, type Tile } from './settings'
import { favicon, TileGlyph } from './icons'

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
    <div className={`clock${c.glass ? '' : ' enter'}`} style={{ ...at(i), fontSize: `calc(clamp(4rem, 11vw, 8.5rem) * ${c.size})`, fontWeight: c.weight }}>
      {c.glass ? <GlassText text={time} i={i} /> : <time>{time}</time>}
      {c.date && <p className={c.glass ? 'enter' : undefined} style={at(i)}>{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
    </div>
  )
}

/**
 * Text made of glass: a blurred layer clipped to the glyphs by an SVG text clip, under a lit outline.
 * The glyphs are laid out by an invisible copy of the text, measured, so the clip matches the font exactly.
 * Each layer carries the entrance itself: an animating ancestor would cut the blur off from the page.
 */
function GlassText({ text, i }: { text: string; i: number }) {
  const id = `gt${useId().replace(/\W/g, '')}`
  const box = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0, base: 0 })
  useLayoutEffect(() => {
    const el = box.current!
    const measure = () => {
      const r = el.getBoundingClientRect(), probe = el.lastElementChild!.getBoundingClientRect()
      setSize({ w: r.width, h: r.height, base: probe.top - r.top })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts.ready.then(measure)
    return () => ro.disconnect()
  }, [])
  const glyphs = <text x={size.w / 2} y={size.base} textAnchor="middle">{text}</text>
  return (
    <time className="glass-text">
      <span ref={box} className="glass-text-size">{text}<i /></span>
      <span className="glass-text-fill enter" style={{ ...at(i), clipPath: `url(#${id})` }} />
      <svg className="glass-text-svg enter" style={at(i)} width={size.w} height={size.h} aria-hidden="true">
        <defs>
          <clipPath id={id}>{glyphs}</clipPath>
          {/* the rim: the filled glyphs minus themselves shrunk and nudged down, so the edge is lit
              (most on top) without tracing the font's overlapping contours as a stroke would */}
          <filter id={`${id}r`} x="-5%" y="-5%" width="110%" height="110%">
            <feMorphology in="SourceAlpha" operator="erode" radius="1.1" />
            <feOffset dy="1.4" result="inner" />
            <feComposite in="SourceGraphic" in2="inner" operator="out" />
          </filter>
        </defs>
        <g className="glass-text-rim" filter={`url(#${id}r)`}>{glyphs}</g>
      </svg>
    </time>
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
    <div className="search" style={{ width: `min(${s.width}px, 100%)` }}>
      <Glass className="search-glass enter" style={at(i)}>
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
  if (t.icon === 'favicon' && !broken) return <img src={favicon(t.url)} alt="" onError={() => setBroken(true)} draggable={false} />
  if (t.icon === 'letter' || t.icon === 'favicon') return <span className="letter">{t.name.trim()[0]?.toUpperCase() ?? '·'}</span>
  return <TileGlyph name={t.icon} size="42%" />
}

function Tiles({ i }: { i: number }) {
  const t = useSettings().tiles
  return (
    <nav className="tiles" aria-label="Favorites" style={{ '--tile': `${t.size}px`, '--tile-r': t.shape === 'circle' ? '50%' : '30%' } as CSSProperties}>
      {t.list.map((tile, k) => (
        <a key={tile.id} className="tile" href={tile.url} target={t.newTab ? '_blank' : undefined} rel="noreferrer" title={tile.name}>
          <Glass className="tile-glass enter" style={at(i + k)}><TileIcon t={tile} /></Glass>
          {t.labels && <span className="tile-label enter" style={at(i + k)}>{tile.name}</span>}
        </a>
      ))}
    </nav>
  )
}

const greeting = (h: number) => (h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')

function Welcome({ i }: { i: number }) {
  const w = useSettings().welcome
  return (
    <p className={`welcome enter${w.glass ? ' glass' : ''}`} style={at(i)}>
      {w.text.replaceAll('{greeting}', greeting(new Date().getHours()))}
    </p>
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
      {s.welcome.show && s.welcome.text.trim() && <Welcome i={i + (s.tiles.show ? s.tiles.list.length : 0)} />}
    </main>
  )
}
