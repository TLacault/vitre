import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Glass, Input, SegmentedControl, Slider, Switch } from './ui'
import { set } from './settings'

// Settings rows: every control is the page's own (ui.tsx), none is a browser default.

export function Row({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="row">
      <div className="row-label"><span>{label}</span>{hint != null && <output>{hint}</output>}</div>
      <div className="row-control">{children}</div>
    </div>
  )
}

export function Toggle({ label, path, value }: { label: string; path: string; value: boolean }) {
  return (
    <div className="row row-inline">
      <span className="row-label">{label}</span>
      <Switch aria-label={label} checked={value} onCheckedChange={v => set(path, v)} />
    </div>
  )
}

export function Range({ label, path, value, min, max, step = 0.01, unit = '', fmt }: {
  label: string; path: string; value: number; min: number; max: number; step?: number; unit?: string; fmt?: (v: number) => string
}) {
  return (
    <Row label={label} hint={(fmt ? fmt(value) : +value.toFixed(2)) + unit}>
      <Slider aria-label={label} min={min} max={max} step={step} value={value} onValueChange={v => set(path, v)} />
    </Row>
  )
}

export function Choice<T extends string>({ label, path, value, items }: { label: string; path: string; value: T; items: [T, string][] }) {
  return (
    <Row label={label}>
      <SegmentedControl aria-label={label} items={items.map(([value, label]) => ({ value, label }))} value={value} onValueChange={v => set(path, v)} />
    </Row>
  )
}

export function Text({ label, path, value, placeholder }: { label: string; path: string; value: string; placeholder?: string }) {
  return (
    <Row label={label}>
      <Input aria-label={label} value={value} placeholder={placeholder} onValueChange={v => set(path, v)} />
    </Row>
  )
}

// ——— Colour: a swatch that opens a saturation/value field, a hue strip and a hex field.

const hexToHsv = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b)
  const h = !d ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, max ? d / max : 0, max] as const
}
const hsvToHex = (h: number, s: number, v: number) => {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)) }
  return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

function drag(el: HTMLElement, e: React.PointerEvent, on: (x: number, y: number) => void) {
  const move = (ev: PointerEvent) => {
    const r = el.getBoundingClientRect()
    on(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)))
  }
  move(e.nativeEvent)
  el.setPointerCapture(e.pointerId)
  el.onpointermove = move
  el.onpointerup = () => (el.onpointermove = null)
}

export function Color({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  const [hex, setHex] = useState(value)
  const root = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => { if (value !== hsvToHex(...hsv)) setHsv(hexToHsv(value)); setHex(value) }, [value])
  useEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('pointerdown', out)
    return () => document.removeEventListener('pointerdown', out)
  }, [open])
  const put = (h: number, s: number, v: number) => { setHsv([h, s, v]); onChange(hsvToHex(h, s, v)) }
  const [h, s, v] = hsv
  return (
    <div className="color" ref={root}>
      <button type="button" className="swatch" aria-label={`${label}: ${value}`} aria-expanded={open} style={{ background: value }} onClick={() => setOpen(!open)} />
      {open && (
        <Glass className="color-pop" onKeyDown={e => e.key === 'Escape' && (e.stopPropagation(), setOpen(false))}>
          <div ref={field} className="sv" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))` }}
            onPointerDown={e => drag(field.current!, e, (x, y) => put(h, x, 1 - y))}>
            <i style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: value }} />
          </div>
          <div ref={strip} className="hue" onPointerDown={e => drag(strip.current!, e, x => put(x * 360, s, v))}>
            <i style={{ left: `${(h / 360) * 100}%`, background: `hsl(${h} 100% 50%)` }} />
          </div>
          <Input aria-label="Hex" value={hex} onValueChange={t => { setHex(t); if (/^#[0-9a-f]{6}$/i.test(t)) onChange(t.toLowerCase()) }} />
        </Glass>
      )}
    </div>
  )
}

/** A glass drop zone that takes image files, by click or drop. */
export function Drop({ onFiles, children }: { onFiles: (f: FileList) => void; children: ReactNode }) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <button
      type="button" className="drop" data-over={over || undefined}
      onClick={() => input.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files) }}
    >
      {children}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={e => e.target.files && onFiles(e.target.files)} />
    </button>
  )
}
