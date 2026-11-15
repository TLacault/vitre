import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Button, Glass, Input, Switch, TabBar } from './ui'
import GripVertical from 'lucide-react/icons/grip-vertical'
import Bird from 'lucide-react/icons/bird'
import Fish from 'lucide-react/icons/fish'
import Clock3 from 'lucide-react/icons/clock-3'
import Download from 'lucide-react/icons/download'
import Droplet from 'lucide-react/icons/droplet'
import ImageIcon from 'lucide-react/icons/image'
import LayoutGrid from 'lucide-react/icons/layout-grid'
import Plus from 'lucide-react/icons/plus'
import RotateCcw from 'lucide-react/icons/rotate-ccw'
import Search from 'lucide-react/icons/search'
import Settings2 from 'lucide-react/icons/settings-2'
import SlidersHorizontal from 'lucide-react/icons/sliders-horizontal'
import Sparkles from 'lucide-react/icons/sparkles'
import Trash2 from 'lucide-react/icons/trash-2'
import Upload from 'lucide-react/icons/upload'
import X from 'lucide-react/icons/x'
import { add, remove, usePics, type Pic } from './gallery'
import { defaults, engines, get, merge, palettes, save, set, useSettings, type Entrance, type Reveal as RevealKind, type Settings, type Tile } from './settings'
import { Reveal } from './Reveal'
import { ANIMAL_KEYS, ANIMALS, SHARED_CONTROLS, type KnobSpec } from './ascii'
import { Choice, Color, Drop, Range, Row, Text, Toggle } from './controls'
import { BrandGlyph, favicon, icons, loadBrands, loadLibrary, searchBrands, searchIcons, TileGlyph, type Brand } from './icons'

export const replay = () => dispatchEvent(new Event('vitre:replay'))

function Thumb({ pic, active, onPick }: { pic: Pic; active: boolean; onPick: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const u = URL.createObjectURL(pic.thumb)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [pic])
  return (
    <div className="thumb" data-active={active || undefined}>
      <button type="button" onClick={onPick} aria-label="Show this image" aria-pressed={active}><img src={url} alt="" /></button>
      <button type="button" className="thumb-x" aria-label="Remove image" onClick={() => remove(pic.id)}><X size={13} /></button>
    </div>
  )
}

function BackgroundTab({ s, fine, setFine }: { s: Settings } & Fine) {
  const pics = usePics()
  const b = s.bg, sh = s.shader
  return (
    <>
      <Range label="Blur" path="bg.blur" value={b.blur} min={0} max={40} step={1} unit="px" />
      <Range label="Dim" path="bg.dim" value={b.dim} min={0} max={0.8} fmt={v => `${Math.round(v * 100)}%`} />
      <Reveals s={s} />
      <Toggle label="Grain" path="bg.grain" value={b.grain} />
      {b.grain && <Choice label="Grain style" path="bg.grainStyle" value={b.grainStyle} items={[['fine', 'Fine'], ['grid', 'The Grid']]} />}
      {b.grain && <Range label="Grain opacity" path="bg.grainOpacity" value={b.grainOpacity} min={0} max={1} fmt={v => `${Math.round(v * 100)}%`} />}
      {b.grain && <Range label="Grain size" path="bg.grainSize" value={b.grainSize} min={1} max={6} step={0.1} unit="×" />}
      <Choice label="Kind" path="bg.kind" value={b.kind} items={[['animals', 'Animals'], ['shader', 'Shader'], ['image', 'Image']]} />
      {b.kind === 'animals' ? <AnimalsTab s={s} fine={fine} setFine={setFine} /> : b.kind === 'image' ? (
        <>
          <Row label="Gallery" hint={`${pics.length} cached`}>
            <div className="gallery">
              {pics.map(p => <Thumb key={p.id} pic={p} active={b.rotate === 'fixed' && b.fixedId === p.id} onPick={() => save({ ...s, bg: { ...b, rotate: 'fixed', fixedId: p.id } })} />)}
              <Drop onFiles={f => add(f)}><Upload size={18} /><span>Add</span></Drop>
            </div>
          </Row>
          <Choice label="Change" path="bg.rotate" value={b.rotate} items={[['tab', 'Every tab'], ['period', 'Every…'], ['fixed', 'Never']]} />
          {b.rotate === 'period' && <Range label="Period" path="bg.periodHours" value={b.periodHours} min={1} max={168} step={1}
            fmt={v => (v % 24 === 0 ? `${v / 24} day${v > 24 ? 's' : ''}` : `${v} h`)} />}
        </>
      ) : (
        <>
          <Row label="Colours">
            <div className="palettes">
              {Object.entries(palettes).map(([k, p]) => (
                <button type="button" key={k} className="palette" aria-pressed={sh.palette === k} onClick={() => set('shader.palette', k)}>
                  <i style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[2]} 45%, ${p.colors[4]})` }} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </Row>
          <Range label="Motion" path="shader.motion" value={sh.motion} min={0} max={2} />
          <Range label="Vibrance" path="shader.vibrance" value={sh.vibrance} min={0} max={2} />
          <Range label="Luminosity" path="shader.light" value={sh.light} min={0.2} max={2} />
          <Range label="Distortion" path="shader.distortion" value={sh.distortion} min={0} max={1} />
          <Range label="Swirl" path="shader.swirl" value={sh.swirl} min={0} max={1} />
        </>
      )}
    </>
  )
}

/** Moods over the animal's own defaults; only shared knobs, so each works for every animal. */
const moods: [string, Record<string, number>][] = [
  ['Natural', {}],
  ['Calm', { density: 0.6, speed: 0.55, sparkle: 0, trail: 0.6 }],
  ['Swarm', { density: 2.6, speed: 1.2, separation: 300 }],
  ['Distant', { size: 0.7, farthest: 0.12, farBias: 2.2, fog: 0.7 }],
  ['Vivid', { speed: 1.5, shimmer: 0.8, sparkle: 0.3, trail: 2.2 }],
]

type Fine = { fine?: boolean; setFine?: (v: boolean) => void }

/** Lucide-style strokes for the animals Lucide doesn't draw. */
const ANIMAL_PATHS: Record<string, string> = {
  butterflies: 'M12 8v11M12 8l-2-4M12 8l2-4M12 11C10 6 5 3 4 6s2 6 8 6M12 11c2-5 7-8 8-5s-2 6-8 6M12 12c-4 0-7 3-6 6s5 0 6-4M12 12c4 0 7 3 6 6s-5 0-6-4',
  jellyfish: 'M5 12a7 7 0 0 1 14 0zM8 12c-1 3 1 5 0 8M12 12c-1 3 1 5 0 8M16 12c-1 3 1 5 0 8',
  dragonflies: 'M12 7v14M12 3.5v1M12 9C8 6 3 6 3 8s5 2 9 1M12 9c4-3 9-3 9-1s-5 2-9 1M12 11c-4 0-8 1-8 2.5s4 .5 8-2.5M12 11c4 0 8 1 8 2.5s-4 .5-8-2.5',
  frogs: 'M5.5 9.5C3 12 3 17 6 19h12c3-2 3-7 .5-9.5M9 14q3 2 6 0M10.5 7a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0M18.5 7a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0',
  crabs: 'M6 14a6 4 0 1 0 12 0 6 4 0 1 0-12 0M10 10V8M14 10V8M7 12 5 9M17 12l2-3M6.5 16 3 18M7.5 17.5 5 20M17.5 16l3.5 2M16.5 17.5 19 20M5 9a2 2 0 1 1 1.5-3.5M19 9a2 2 0 1 0-1.5-3.5',
}

function AnimalIcon({ k }: { k: string }) {
  if (k === 'koi') return <Fish size={20} />
  if (k === 'cranes') return <Bird size={20} />
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={ANIMAL_PATHS[k]} /></svg>
}

/** The animal and a mood; every knob lives in the fine-tune panel beside the settings. */
function AnimalsTab({ s, fine, setFine }: { s: Settings } & Fine) {
  const { kind, tune } = s.animals
  const a = ANIMALS[kind], t = tune[kind]
  const at = (m: Record<string, number>) => ({ ...a.defaults, ...m })
  const current = moods.find(([, m]) => Object.entries(at(m)).every(([k, v]) => t[k] === v))?.[0]
  return (
    <>
      <Row label="Animal">
        <div className="palettes">
          {ANIMAL_KEYS.map(k => (
            <button type="button" key={k} className="palette" aria-pressed={kind === k} onClick={() => set('animals.kind', k)}>
              <i className="glyph" style={{ background: `rgb(${ANIMALS[k].swatch.join(' ')})` }}><AnimalIcon k={k} /></i>
              <span>{ANIMALS[k].label}</span>
            </button>
          ))}
        </div>
      </Row>
      <Row label="Mood" hint={current ? undefined : 'Custom'}>
        <div className="chips">
          {moods.map(([label, m]) => (
            <Button key={label} variant={label === current ? 'filled' : 'glass'} onClick={() => set(`animals.tune.${kind}`, at(m))}>{label}</Button>
          ))}
        </div>
      </Row>
      <Button icon={<SlidersHorizontal size={16} />} aria-expanded={!!fine} onClick={() => setFine?.(!fine)}>Fine-tune {a.label.toLowerCase()}</Button>
      <p className="hint">Click anywhere on the page to startle them.</p>
    </>
  )
}

/** Every knob ascii-animals exposes for the chosen animal: Movement, its own groups, then Look. */
function AnimalTuner({ s, onClose }: { s: Settings; onClose: () => void }) {
  const { kind, tune } = s.animals
  const a = ANIMALS[kind], t = tune[kind]
  const knob = (k: KnobSpec) => {
    if (a.hide?.includes(k.key as never)) return null
    const path = `animals.tune.${kind}.${k.key}`
    // the vendored hint talks to the demo's author; the number is already beside the slider here
    const tip = k.key === 'hueShift' ? 'Turns the animal\'s colour around the colour wheel, in degrees.' : k.hint
    if ('toggle' in k) return <Toggle key={k.key} label={k.label} path={path} value={!!t[k.key]} tip={tip} />
    if (k.disabledWhen && t[k.disabledWhen]) return null
    return <Range key={k.key} label={k.label} path={path} value={+(t[k.key] ?? 0)} min={k.min} max={k.max} step={k.step} tip={tip} />
  }
  const groups: [string, KnobSpec[]][] = [['Movement', SHARED_CONTROLS.movement], ...a.controls, ['Look', SHARED_CONTROLS.look]]
  return (
    <>
      <header className="editor-head">
        <h2>{a.label}</h2>
        <div className="chips">
          <Button icon={<RotateCcw size={15} />} onClick={() => set(`animals.tune.${kind}`, { ...a.defaults })}>Reset</Button>
          <Button icon={<X size={16} />} aria-label="Close fine-tune" onClick={onClose} />
        </div>
      </header>
      <div className="panel-body">
        <p className="hint">Hover a label for what it does.</p>
        {groups.map(([title, knobs]) => <Fragment key={title}><h3 className="section">{title}</h3>{knobs.map(knob)}</Fragment>)}
      </div>
    </>
  )
}

function Look({ s }: { s: Settings }) {
  const g = s.glass
  return (
    <>
      <Choice label="Theme" path="theme" value={s.theme} items={[['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]} />
      <Row label="Accent"><Color label="Accent" value={s.accent} onChange={v => set('accent', v)} /></Row>
      <Choice label="Typeface" path="font" value={s.font} items={[['geist', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']]} />
      <Range label="Frost" path="glass.frost" value={g.frost} min={0} max={40} step={1} unit="px" />
      <Range label="Saturation" path="glass.saturate" value={g.saturate} min={0.5} max={2.5} />
      <Range label="Tint" path="glass.tint" value={g.tint} min={0} max={0.9} fmt={v => `${Math.round(v * 100)}%`} />
      <Range label="Rim light" path="glass.rim" value={g.rim} min={0} max={1} />
      <Range label="Roundness" path="glass.radius" value={g.radius} min={0} max={40} step={1} unit="px" />
      <Range label="Vertical position" path="layout.offset" value={s.layout.offset} min={0.1} max={0.7} fmt={v => `${Math.round(v * 100)}%`} />
    </>
  )
}

function ClockTab({ s }: { s: Settings }) {
  const c = s.clock
  return (
    <>
      <Toggle label="Show clock" path="clock.show" value={c.show} />
      <Toggle label="24-hour" path="clock.h24" value={c.h24} />
      <Toggle label="Seconds" path="clock.seconds" value={c.seconds} />
      <Toggle label="Date" path="clock.date" value={c.date} />
      <Range label="Size" path="clock.size" value={c.size} min={0.4} max={1.6} fmt={v => `${Math.round(v * 100)}%`} />
      <Range label="Weight" path="clock.weight" value={c.weight} min={100} max={900} step={10} fmt={v => String(Math.round(v))} />
      <div className="row row-inline">
        <span className="row-label">Glass digits</span>
        {/* hairline digits hold no glass: switching it on thickens them unless already bold enough */}
        <Switch aria-label="Glass digits" checked={c.glass} onCheckedChange={v => save({ ...s, clock: { ...c, glass: v, weight: v && c.weight < 500 ? 640 : c.weight } })} />
      </div>
      <h3 className="section">Welcome</h3>
      <Toggle label="Show welcome line" path="welcome.show" value={s.welcome.show} />
      <Text label="Text ({greeting} becomes Good morning, afternoon…)" path="welcome.text" value={s.welcome.text} />
      <Toggle label="On glass" path="welcome.glass" value={s.welcome.glass} />
    </>
  )
}

function SearchTab({ s }: { s: Settings }) {
  const q = s.search
  return (
    <>
      <Toggle label="Show search" path="search.show" value={q.show} />
      <Row label="Engine">
        <div className="chips">
          {Object.entries(engines).map(([k, e]) => (
            <Button key={k} variant={k === q.engine ? 'filled' : 'glass'} onClick={() => set('search.engine', k)}>{e.label}</Button>
          ))}
        </div>
      </Row>
      {q.engine === 'custom' && <Text label="Custom URL (%s is the query)" path="search.custom" value={q.custom} />}
      <Text label="Placeholder" path="search.placeholder" value={q.placeholder} />
      <Range label="Width" path="search.width" value={q.width} min={320} max={900} step={10} unit="px" />
      <Toggle label="Focus on open" path="search.autofocus" value={q.autofocus} />
      <Toggle label="Open results in a new tab" path="search.newTab" value={q.newTab} />
    </>
  )
}

function IconPick({ tile, onPick }: { tile: Tile; onPick: (icon: string, glyph?: Tile['glyph']) => void }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [lib, setLib] = useState<Awaited<ReturnType<typeof loadLibrary>>>()
  const [brands, setBrands] = useState<Brand[]>()
  const root = useRef<HTMLDivElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<CSSProperties>()
  // The popover lives in a portal on the settings root, beside the panel: inside the scrolling list it
  // would be clipped, and inside the glass (backdrop-filter) a fixed position would not be the viewport's.
  useEffect(() => {
    if (!open) return
    const b = root.current!.getBoundingClientRect(), panel = root.current!.closest('.panel')!.getBoundingClientRect()
    const side = panel.left > 340
    setAt(side
      ? { right: innerWidth - panel.left + 10, top: Math.max(12, Math.min(b.top - 8, innerHeight - 352)) }
      : { left: panel.left, top: Math.max(12, panel.top - 352) })
    const out = (e: PointerEvent) => !root.current?.contains(e.target as Node) && !pop.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false))
    document.addEventListener('pointerdown', out)
    addEventListener('keydown', key, true)
    return () => { document.removeEventListener('pointerdown', out); removeEventListener('keydown', key, true) }
  }, [open])
  useEffect(() => {
    if (!open || !q) return
    if (!lib) loadLibrary().then(setLib)
    if (!brands) loadBrands().then(setBrands)
  }, [open, q])
  const pick = (icon: string, glyph?: Tile['glyph']) => { onPick(icon, glyph); setOpen(false); setQ('') }
  const foundBrands = q && brands ? searchBrands(brands, q) : []
  const foundIcons = q && lib ? searchIcons(lib, q, 56) : []
  const brandColours = useSettings().tiles.brandColours
  return (
    <div className="icon-pick" ref={root}>
      <button type="button" className="icon-btn" aria-label="Choose icon" aria-expanded={open} onClick={() => setOpen(!open)}>
        {tile.icon === 'favicon' ? <img src={favicon(tile.url)} alt="" /> : tile.icon === 'letter' ? <b>{tile.name[0]?.toUpperCase()}</b>
          : <TileGlyph name={tile.icon} glyph={tile.glyph} colour={brandColours} size={18} />}
      </button>
      {open && at && createPortal(
        <Glass ref={pop} className="icon-pop" style={at}>
          <Input autoFocus aria-label="Search icons and brands" placeholder="Search brands and icons" value={q} onValueChange={setQ} />
          <div className="icon-scroll">
            {!q && (
              <div className="icon-grid">
                <button type="button" onClick={() => pick('favicon')} data-active={tile.icon === 'favicon' || undefined}>Site</button>
                <button type="button" onClick={() => pick('letter')} data-active={tile.icon === 'letter' || undefined}>Aa</button>
                {Object.entries(icons).map(([k, I]) => (
                  <button type="button" key={k} aria-label={k} title={k} data-active={tile.icon === k || undefined} onClick={() => pick(k)}><I size={17} /></button>
                ))}
              </div>
            )}
            {q && (!lib || !brands) && <p className="icon-empty">Loading…</p>}
            {q && lib && brands && !foundBrands.length && !foundIcons.length && <p className="icon-empty">Nothing matches “{q}”.</p>}
            {foundBrands.length > 0 && <>
              <h4 className="icon-group">Brands</h4>
              <div className="icon-grid">
                {foundBrands.map(b => (
                  <button type="button" key={b.slug} aria-label={b.title} title={b.title} data-active={tile.icon === `brand:${b.slug}` || undefined}
                    onClick={() => pick(`brand:${b.slug}`, { d: b.path, hex: b.hex })}>
                    <BrandGlyph d={b.path} hex={b.hex} size={17} colour={brandColours} />
                  </button>
                ))}
              </div>
            </>}
            {foundIcons.length > 0 && <>
              <h4 className="icon-group">Icons</h4>
              <div className="icon-grid">
                {foundIcons.map(n => {
                  const I = lib![n]!
                  return <button type="button" key={n} aria-label={n} title={n} data-active={tile.icon === `lucide:${n}` || undefined} onClick={() => pick(`lucide:${n}`)}><I size={17} /></button>
                })}
              </div>
            </>}
          </div>
        </Glass>,
        root.current!.closest('.settings')!,
      )}
    </div>
  )
}

function TilesTab({ s }: { s: Settings }) {
  const t = s.tiles
  return (
    <>
      <Toggle label="Show tabs" path="tiles.show" value={t.show} />
      <Toggle label="Labels" path="tiles.labels" value={t.labels} />
      <Choice label="Shape" path="tiles.shape" value={t.shape} items={[['squircle', 'Squircle'], ['circle', 'Circle']]} />
      <Range label="Size" path="tiles.size" value={t.size} min={40} max={110} step={1} unit="px" />
      <Range label="Columns before wrapping" path="tiles.columns" value={t.columns} min={1} max={12} step={1} fmt={v => String(v)} />
      <Range label="Spacing" path="tiles.gap" value={t.gap} min={4} max={60} step={1} unit="px" />
      <Toggle label="Brand colours" path="tiles.brandColours" value={t.brandColours} />
      <Toggle label="Open in a new tab" path="tiles.newTab" value={t.newTab} />
      <p className="hint">The tabs themselves are edited from the <LayoutGrid size={13} /> button beside the settings.</p>
    </>
  )
}

/** The tab list, in its own popup: drag a row by its grip (or focus the grip and use the arrow keys) to reorder. */
function TabsEditor({ s }: { s: Settings }) {
  const list = s.tiles.list
  const [drag, setDrag] = useState<number | null>(null)
  const rows = useRef<HTMLDivElement>(null)
  const put = (l: Tile[]) => set('tiles.list', l)
  const edit = (i: number, patch: Partial<Tile>) => put(list.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  /** Moves a tab; reads the live list, since a drag fires faster than renders. */
  const move = (from: number, to: number) => {
    const l = [...get().tiles.list]
    if (to < 0 || to >= l.length || from === to) return false
    l.splice(to, 0, l.splice(from, 1)[0]!)
    put(l)
    return true
  }
  // Pointer-driven reorder (HTML drag and drop drops the drag when the dragged row moves in the DOM,
  // and Firefox won't drag a button): the row under the pointer's y takes the dragged tab's place.
  const dragging = useRef<number | null>(null)
  const onGripMove = (e: React.PointerEvent) => {
    const from = dragging.current
    if (from === null) return
    const els = [...rows.current!.querySelectorAll<HTMLElement>('.tile-row')]
    const to = els.findIndex(el => { const r = el.getBoundingClientRect(); return e.clientY >= r.top && e.clientY < r.bottom })
    if (to >= 0 && move(from, to)) { dragging.current = to; setDrag(to) }
  }
  const tidyUrl = (i: number, raw: string) => {
    const v = raw.trim()
    if (!v) return
    const url = /^[a-z]+:/i.test(v) ? v : `https://${v}`
    const tile = list[i]!
    let name = tile.name
    if (!name.trim() || name === 'New') try { // name a fresh tab after its site
      const host = new URL(url).hostname.replace(/^www\./, '').split('.')[0]!
      name = host.charAt(0).toUpperCase() + host.slice(1)
    } catch {}
    edit(i, { url, name })
  }
  return (
    <>
      <header className="editor-head">
        <h2>Tabs <span>{list.length}</span></h2>
        <Button variant="filled" icon={<Plus size={16} />} onClick={() => put([...list, { id: crypto.randomUUID(), name: 'New', url: '', icon: 'globe' }])}>Add</Button>
      </header>
      <div ref={rows} className="panel-body tile-list" data-dragging={drag !== null || undefined}>
        {!list.length && <p className="icon-empty">No tabs yet. Add one, give it an address, and it shows under the search bar.</p>}
        {list.map((tile, i) => (
          <div className="tile-row" key={tile.id} data-drag={drag === i || undefined}>
            <button type="button" className="grip" aria-label={`Move ${tile.name}, use arrow keys`}
              onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); dragging.current = i; setDrag(i) }}
              onPointerMove={onGripMove}
              onPointerUp={() => { dragging.current = null; setDrag(null) }}
              onPointerCancel={() => { dragging.current = null; setDrag(null) }}
              onKeyDown={e => { if (e.key === 'ArrowUp') { e.preventDefault(); move(i, i - 1) } if (e.key === 'ArrowDown') { e.preventDefault(); move(i, i + 1) } }}>
              <GripVertical size={15} />
            </button>
            <IconPick tile={tile} onPick={(icon, glyph) => edit(i, { icon, glyph })} />
            <div className="tile-fields">
              <input className="field" value={tile.name} aria-label="Name" placeholder="Name" onChange={e => edit(i, { name: e.target.value })} />
              <input className="field field-url" value={tile.url} aria-label="Address" placeholder="example.com" spellCheck={false}
                onChange={e => edit(i, { url: e.target.value })} onBlur={e => tidyUrl(i, e.target.value)} />
            </div>
            <button type="button" aria-label={`Remove ${tile.name}`} className="row-x" onClick={() => put(list.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </>
  )
}

const entrances: [Entrance, string][] = [['fade', 'Fade'], ['rise', 'Rise'], ['blur', 'Focus'], ['scale', 'Bloom'], ['drop', 'Drop'], ['unfold', 'Unfold'], ['none', 'None']]

const reveals: [RevealKind, string][] = [['iris', 'Iris'], ['grid', 'Grid'], ['plasma', 'Plasma'], ['zoom', 'Zoom out'], ['wipe', 'Wipe'], ['blinds', 'Blinds'], ['fade', 'Fade'], ['none', 'None']]

function Reveals({ s }: { s: Settings }) {
  const [play, setPlay] = useState<Record<string, number>>({})
  return (
    <>
      <Row label="Reveal">
        <div className="entrances">
          {reveals.map(([k, label]) => (
            <button type="button" key={k} className="entrance" aria-pressed={s.bg.reveal === k}
              onPointerEnter={() => setPlay(p => ({ ...p, [k]: (p[k] ?? 0) + 1 }))} onClick={() => { set('bg.reveal', k); replay() }}>
              <div className="mini mini-bg"><Reveal key={play[k] ?? 0} kind={k} ms={Math.min(s.bg.revealMs, 1200)} /></div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Row>
      <Range label="Reveal duration" path="bg.revealMs" value={s.bg.revealMs} min={300} max={4000} step={50} unit="ms" />
    </>
  )
}

function MotionTab({ s }: { s: Settings }) {
  const m = s.motion
  const [play, setPlay] = useState<Record<string, number>>({})
  const again = (k: string) => setPlay(p => ({ ...p, [k]: (p[k] ?? 0) + 1 }))
  return (
    <>
      <Row label="Entrance">
        <div className="entrances" style={{ '--dur': `${m.duration}ms`, '--stagger': `${m.stagger}ms` } as CSSProperties}>
          {entrances.map(([k, label]) => (
            <button type="button" key={k} className="entrance" data-entrance={k} aria-pressed={m.entrance === k}
              onPointerEnter={() => again(k)} onClick={() => { set('motion.entrance', k); replay() }}>
              <div className="mini" key={play[k] ?? 0}>
                <i className="enter" style={{ '--i': 0 } as CSSProperties} />
                <i className="enter" style={{ '--i': 1 } as CSSProperties} />
                <span>{[0, 1, 2].map(j => <i key={j} className="enter" style={{ '--i': 2 + j } as CSSProperties} />)}</span>
              </div>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Row>
      <Range label="Duration" path="motion.duration" value={m.duration} min={200} max={2000} step={50} unit="ms" />
      <Range label="Wait" path="motion.wait" value={m.wait} min={0} max={2000} step={50} unit="ms" />
      <Range label="Stagger" path="motion.stagger" value={m.stagger} min={0} max={250} step={5} unit="ms" />
      <Button icon={<RotateCcw size={16} />} onClick={replay}>Replay on the page</Button>
    </>
  )
}

function Footer({ s }: { s: Settings }) {
  const file = useRef<HTMLInputElement>(null)
  const exp = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }))
    a.download = 'vitre-settings.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const imp = async (f?: File) => {
    if (!f) return
    try { save(merge(defaults, JSON.parse(await f.text()))) } catch { alertless('That file is not a Vitre settings file.') }
  }
  const [armed, setArmed] = useState(false)
  return (
    <footer className="panel-foot">
      <Button icon={<Download size={15} />} onClick={exp}>Export</Button>
      <Button icon={<Upload size={15} />} onClick={() => file.current?.click()}>Import</Button>
      <Button destructive onClick={() => (armed ? (save(defaults), setArmed(false)) : setArmed(true))} onBlur={() => setArmed(false)}>{armed ? 'Sure?' : 'Reset'}</Button>
      <input ref={file} type="file" accept="application/json" hidden onChange={e => imp(e.target.files?.[0])} />
    </footer>
  )
}
// No native dialogs anywhere: a failed import says so in the panel's live region.
function alertless(msg: string) { document.querySelector('.panel-status')!.textContent = msg }

const tabs = [
  { value: 'bg', label: 'Picture', icon: <ImageIcon size={16} />, C: BackgroundTab },
  { value: 'look', label: 'Glass', icon: <Droplet size={16} />, C: Look },
  { value: 'clock', label: 'Text', icon: <Clock3 size={16} />, C: ClockTab },
  { value: 'search', label: 'Search', icon: <Search size={16} />, C: SearchTab },
  { value: 'tiles', label: 'Tabs', icon: <LayoutGrid size={16} />, C: TilesTab },
  { value: 'motion', label: 'Motion', icon: <Sparkles size={16} />, C: MotionTab },
]

export function SettingsMenu() {
  const s = useSettings()
  const [open, setOpen] = useState<'settings' | 'tabs' | null>(null)
  const [tab, setTab] = useState('bg')
  const [fine, setFine] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    const out = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(null)
    addEventListener('keydown', key)
    document.addEventListener('pointerdown', out)
    return () => { removeEventListener('keydown', key); document.removeEventListener('pointerdown', out) }
  }, [open])
  const C = tabs.find(t => t.value === tab)!.C
  const toggle = (which: 'settings' | 'tabs') => setOpen(o => (o === which ? null : which))
  return (
    <div className="settings" ref={root}>
      {open === 'settings' && (
        <Glass className="panel" role="dialog" aria-label="Customize">
          <TabBar aria-label="Sections" items={tabs.map(({ C: _, ...t }) => t)} value={tab} onValueChange={setTab} />
          <div className="panel-body" key={tab}><C s={s} fine={fine} setFine={setFine} /></div>
          <p className="panel-status" role="status" />
          <Footer s={s} />
        </Glass>
      )}
      {open === 'settings' && fine && tab === 'bg' && s.bg.kind === 'animals' && (
        <Glass className="panel panel-tune" role="dialog" aria-label="Fine-tune animals"><AnimalTuner s={s} onClose={() => setFine(false)} /></Glass>
      )}
      {open === 'tabs' && <Glass className="panel panel-tabs" role="dialog" aria-label="Tabs"><TabsEditor s={s} /></Glass>}
      <div className="dock">
        <Button className="dock-btn" icon={<LayoutGrid size={19} />} aria-label="Edit tabs" aria-expanded={open === 'tabs'} onClick={() => toggle('tabs')} />
        <Button className="gear" icon={<Settings2 size={20} />} aria-label="Customize" aria-expanded={open === 'settings'} onClick={() => toggle('settings')} />
      </div>
    </div>
  )
}
