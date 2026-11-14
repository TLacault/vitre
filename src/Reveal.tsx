import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { Reveal as Kind } from './settings'
import { plasma } from './math'

// How the background arrives. Every kind but zoom lays a cover over the content and takes it away;
// zoom scales and unblurs the content itself. Nothing moves until `ready` (image decoded, shader's
// first frame), so the reveal never uncovers an empty page. `run` replays it without remounting the content.

const COLS = 12, ROWS = 7

function Plasma({ ms, onDone }: { ms: number; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!, w = 96, h = 54
    c.width = w; c.height = h
    const ctx = c.getContext('2d')!, img = ctx.createImageData(w, h)
    const [r, g, b] = getComputedStyle(c).color.match(/\d+/g)!.map(Number) as [number, number, number]
    const t0 = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / ms), e = (1 - Math.cos(Math.PI * t)) / 2 // ease in-out
      const field = plasma(w, h, t * 2.5) // the blobs drift as they open
      for (let i = 0; i < field.length; i++) {
        const a = Math.max(0, Math.min(1, (field[i]! - (e * 1.3 - 0.15)) * 6))
        img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = a * 255
      }
      ctx.putImageData(img, 0, 0)
      if (t < 1) raf = requestAnimationFrame(frame)
      else onDone()
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="cover plasma" />
}

export function Reveal({ kind, ms, ready = true, run = 0, children }: { kind: Kind; ms: number; ready?: boolean; run?: number; children?: ReactNode }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const k: Kind = reduced && kind !== 'none' ? 'fade' : kind
  const [done, setDone] = useState(k === 'none')
  useEffect(() => setDone(k === 'none'), [run, k])
  const end = () => setDone(true)
  const covered = !done && k !== 'zoom'
  return (
    <div className="reveal" data-kind={k} data-ready={ready || undefined} data-done={done || undefined} data-run={run % 2} style={{ '--ms': `${ms}ms` } as CSSProperties}>
      <div className="reveal-content" onAnimationEnd={e => e.target === e.currentTarget && end()}>{children}</div>
      {covered && k === 'plasma' && (ready ? <Plasma key={run} ms={ms} onDone={end} /> : <div className="cover" />)}
      {covered && k === 'grid' && (
        <div key={run} className="cover cells" onAnimationEnd={e => (e.target as HTMLElement).dataset.last != null && end()}>
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const x = i % COLS - (COLS - 1) / 2, y = Math.floor(i / COLS) - (ROWS - 1) / 2
            const d = Math.hypot(x / COLS, y / ROWS) / Math.hypot(0.5, 0.5) // 0 centre .. 1 corner
            return <i key={i} style={{ '--d': d } as CSSProperties} data-last={i === 0 || undefined} />
          })}
        </div>
      )}
      {covered && !['plasma', 'grid'].includes(k) && <div key={run} className="cover" onAnimationEnd={end} />}
    </div>
  )
}
