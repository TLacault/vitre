import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'

// The page's own glass and controls: backdrop blur and a lit edge in CSS, nothing measured or filtered per frame.

import { snap } from './math'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

/** Closes a popover on a click outside `root` or on Escape. */
export function useDismiss(open: boolean, close: () => void) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => !root.current?.contains(e.target as Node) && close()
    const key = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && (e.stopPropagation(), close())
    document.addEventListener('pointerdown', out)
    root.current?.addEventListener('keydown', key)
    const el = root.current
    return () => { document.removeEventListener('pointerdown', out); el?.removeEventListener('keydown', key) }
  }, [open])
  return root
}

export const Glass = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cx('glass', className)} {...p} />
))

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; variant?: 'glass' | 'filled'; destructive?: boolean }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ icon, variant = 'glass', destructive, className, children, ...p }, ref) => (
  <button ref={ref} type="button" className={cx('btn', variant === 'glass' && 'glass', !children && 'btn-round', className)}
    data-variant={variant} data-destructive={destructive || undefined} {...p}>
    {icon}{children}
  </button>
))

export function Switch({ checked, onCheckedChange, ...p }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={checked} className="switch" onClick={() => onCheckedChange(!checked)} {...p}><i /></button>
}


export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, ...p }: {
  value: number; onValueChange: (v: number) => void; min?: number; max?: number; step?: number; 'aria-label': string
}) {
  const track = useRef<HTMLDivElement>(null)
  const pct = ((value - min) / (max - min)) * 100
  const at = (x: number) => {
    const r = track.current!.getBoundingClientRect()
    onValueChange(snap(min + ((x - r.left) / r.width) * (max - min), min, max, step))
  }
  const keys: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: (max - min) / 10, PageDown: -(max - min) / 10 }
  const onKey = (e: KeyboardEvent) => {
    const next = e.key === 'Home' ? min : e.key === 'End' ? max : e.key in keys ? value + keys[e.key]! : null
    if (next == null) return
    e.preventDefault()
    onValueChange(snap(next, min, max, step))
  }
  return (
    <div ref={track} className="slider" role="slider" tabIndex={0} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} {...p}
      style={{ '--p': `${pct}%` } as CSSProperties} onKeyDown={onKey}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId)
        e.currentTarget.dataset.drag = ''
        at(e.clientX)
      }}
      onPointerMove={e => e.currentTarget.hasPointerCapture(e.pointerId) && at(e.clientX)}
      onPointerUp={e => delete e.currentTarget.dataset.drag}>
      <i className="slider-fill" /><i className="slider-thumb" />
    </div>
  )
}

type Seg = { value: string; label: ReactNode; icon?: ReactNode }
function Segments({ items, value, onValueChange, className, ...p }: { items: Seg[]; value: string; onValueChange: (v: string) => void; className: string; 'aria-label': string }) {
  const i = items.findIndex(t => t.value === value)
  return (
    <div role="radiogroup" className={className} style={{ '--n': items.length, '--i': i } as CSSProperties} {...p}>
      {i >= 0 && <span className="seg-thumb" />}
      {items.map(t => (
        <button key={t.value} type="button" role="radio" aria-checked={t.value === value} onClick={() => onValueChange(t.value)}>
          {t.icon}<span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
export const SegmentedControl = (p: Omit<Parameters<typeof Segments>[0], 'className'>) => <Segments className="seg" {...p} />
export const TabBar = (p: Omit<Parameters<typeof Segments>[0], 'className'>) => <Segments className="seg tabbar" {...p} />

export function Input({ onValueChange, className, ...p }: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { onValueChange: (v: string) => void }) {
  return <input className={cx('input', className)} spellCheck={false} onChange={e => onValueChange(e.target.value)} {...p} />
}

export function Menu({ items, icon, ...p }: { items: { label: ReactNode; icon?: ReactNode; onSelect: () => void }[]; icon: ReactNode; 'aria-label': string }) {
  const [open, setOpen] = useState(false)
  const root = useDismiss(open, () => setOpen(false))
  return (
    <div className="menu" ref={root}>
      <button type="button" className="menu-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} {...p}>{icon}</button>
      {open && (
        <Glass className="menu-list pop" role="menu">
          {items.map((it, k) => (
            <button key={k} type="button" role="menuitem" onClick={() => { it.onSelect(); setOpen(false) }}>
              <span className="menu-icon">{it.icon}</span>{it.label}
            </button>
          ))}
        </Glass>
      )}
    </div>
  )
}
