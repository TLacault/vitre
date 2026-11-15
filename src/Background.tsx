import { useEffect, useRef, useState } from 'react'
import { ShaderFitOptions, ShaderMount, getShaderColorFromString, meshGradientFragmentShader } from '@paper-design/shaders'
import { AnimalEngine } from './ascii'
import { pick, usePics } from './gallery'
import { Reveal } from './Reveal'
import { palettes, useSettings } from './settings'

/** Saturation and lightness scaled in HSL (the Grid's ShaderFloor tuning). */
export function tune(hex: string, sat: number, light: number) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min
  let h = 0, sa = d ? d / (1 - Math.abs(2 * l - 1)) : 0
  if (d) h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  sa = Math.min(1, sa * sat)
  const L = Math.min(1, l * light), c = (1 - Math.abs(2 * L - 1)) * sa, x = c * (1 - Math.abs((h % 2) - 1)), m = L - c / 2
  const [R, G, B] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h) % 6]!
  return `#${[R, G, B].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')}`
}

// The tone the next tab paints before anything loads (public/boot.js): this background, darkened.
const remember = (rgb: number[]) => {
  try { localStorage.setItem('vitre.cover', `rgb(${rgb.map(v => Math.round(v * 0.45)).join(' ')})`) } catch {}
}
const mix = (hex: string[]) => [1, 3, 5].map(i => hex.reduce((a, h) => a + parseInt(h.slice(i, i + 2), 16), 0) / hex.length)
function average(img: HTMLImageElement) {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  const x = c.getContext('2d')!
  x.drawImage(img, 0, 0, 1, 1)
  return [...x.getImageData(0, 0, 1, 1).data.slice(0, 3)]
}

function Shader({ onReady }: { onReady: () => void }) {
  const sh = useSettings().shader
  const el = useRef<HTMLDivElement>(null)
  const mount = useRef<ShaderMount>(undefined)
  const hex = (palettes[sh.palette] ?? palettes.dusk!).colors.map(c => tune(c, sh.vibrance, sh.light))
  const colors = hex.map(c => getShaderColorFromString(c))
  const speed = () => (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden ? 0 : sh.motion)

  useEffect(() => {
    mount.current = new ShaderMount(el.current!, meshGradientFragmentShader, {
      u_colors: colors, u_colorsCount: colors.length, u_distortion: sh.distortion, u_swirl: sh.swirl,
      u_grainMixer: 0, u_grainOverlay: 0,
      u_fit: ShaderFitOptions.cover, u_scale: 1, u_rotation: 0, u_originX: 0.5, u_originY: 0.5,
      u_offsetX: 0, u_offsetY: 0, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, speed(), Math.random() * 1e4, 1, 1600 * 900) // random frame: each tab opens on a different moment
    requestAnimationFrame(() => { onReady(); remember(mix(hex)) })
    return () => mount.current?.dispose()
  }, [])
  useEffect(() => {
    mount.current?.setUniforms({ u_colors: colors, u_colorsCount: colors.length, u_distortion: sh.distortion, u_swirl: sh.swirl })
    mount.current?.setSpeed(speed())
    const vis = () => mount.current?.setSpeed(speed())
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [sh])
  return <div ref={el} className="layer" />
}

function Photo({ onReady }: { onReady: () => void }) {
  const s = useSettings().bg
  const pics = usePics()
  const [url, setUrl] = useState<string>()
  // Re-picks when the rotation or the gallery changes; the first pick is the one this tab keeps.
  useEffect(() => {
    let u: string | undefined
    pick().then(p => p && setUrl((u = URL.createObjectURL(p.full))))
    return () => { if (u) URL.revokeObjectURL(u) }
  }, [s.rotate, s.fixedId, pics.length])
  if (!url) return null
  return <img key={url} className="layer photo" src={url} alt="" onLoad={e => {
    const img = e.currentTarget
    img.decode().catch(() => {}).then(() => { onReady(); remember(average(img)) })
  }} />
}

function Animals({ onReady }: { onReady: () => void }) {
  const a = useSettings().animals
  const el = useRef<HTMLCanvasElement>(null)
  const engine = useRef<AnimalEngine>(undefined)
  const tune = a.tune[a.kind]
  useEffect(() => {
    const e = (engine.current = new AnimalEngine(el.current!, { animal: a.kind, theme: 'dark', tuning: tune }))
    requestAnimationFrame(() => { onReady(); remember([6, 7, 12]) }) // the renderer's dark ground
    return () => e.destroy()
  }, [])
  useEffect(() => {
    const e = engine.current!
    if (e.animal.key !== a.kind) return e.setAnimal(a.kind, tune)
    for (const k in tune) if (e.tuning[k] !== tune[k]) e.set(k, tune[k]!)
  }, [a.kind, tune])
  return <canvas ref={el} className="layer ascii" />
}

/** Fractal noise tile; past size 1 the dots get bigger and only the strongest ones stay, so it thins out too. */
export function grain(size: number) {
  const f = Math.min(1, (size - 1) / 5), tile = Math.round(220 * size)
  const alpha = `${(1.4 + 3.6 * f).toFixed(2)} ${(-0.2 - 2.6 * f).toFixed(2)}`
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${(0.85 / size).toFixed(4)}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${alpha}'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function Background() {
  const s = useSettings().bg
  const empty = !usePics().length // an empty gallery falls back to the shader
  const [run, setRun] = useState(0)
  const [ready, setReady] = useState(false)
  const onReady = () => setReady(true)
  useEffect(() => {
    const again = () => setRun(r => r + 1)
    addEventListener('vitre:replay', again)
    return () => removeEventListener('vitre:replay', again)
  }, [])
  return (
    <div className="bg" aria-hidden="true">
      <Reveal run={run} ready={ready} kind={s.reveal} ms={s.revealMs}>
        <div className="layer" style={{ filter: s.blur ? `blur(${s.blur}px)` : undefined, inset: s.blur ? -s.blur * 2 : 0 }}>
          {s.kind === 'animals' ? <Animals onReady={onReady} /> : s.kind === 'image' && !empty ? <Photo onReady={onReady} /> : <Shader onReady={onReady} />}
        </div>
        <div className="layer" style={{ background: `rgb(0 0 0 / ${s.dim})` }} />
        {s.grain && <div className="layer grain" style={{ opacity: s.grainOpacity, backgroundImage: grain(s.grainSize) }} />}
      </Reveal>
    </div>
  )
}
