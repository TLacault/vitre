import { useEffect, useRef, useState } from 'react'
import { ShaderFitOptions, ShaderMount, getShaderColorFromString, meshGradientFragmentShader } from '@paper-design/shaders'
import { pick, usePics } from './gallery'
import { useSettings } from './settings'

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

function Shader() {
  const sh = useSettings().shader
  const el = useRef<HTMLDivElement>(null)
  const mount = useRef<ShaderMount>(undefined)
  const colors = sh.colors.map(c => getShaderColorFromString(tune(c, sh.vibrance, sh.light)))
  const speed = () => (matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden ? 0 : sh.motion)

  useEffect(() => {
    mount.current = new ShaderMount(el.current!, meshGradientFragmentShader, {
      u_colors: colors, u_colorsCount: colors.length, u_distortion: sh.distortion, u_swirl: sh.swirl,
      u_grainMixer: 0, u_grainOverlay: 0,
      u_fit: ShaderFitOptions.cover, u_scale: 1, u_rotation: 0, u_originX: 0.5, u_originY: 0.5,
      u_offsetX: 0, u_offsetY: 0, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, speed(), Math.random() * 1e4, 1, 1600 * 900) // random frame: each tab opens on a different moment
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

function Photo() {
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
  return <img key={url} className="layer photo" src={url} alt="" />
}

export function Background() {
  const s = useSettings().bg
  const empty = !usePics().length // an empty gallery falls back to the shader
  return (
    <div className="bg" aria-hidden="true">
      <div className="layer" style={{ filter: s.blur ? `blur(${s.blur}px)` : undefined, inset: s.blur ? -s.blur * 2 : 0 }}>
        {s.kind === 'image' && !empty ? <Photo /> : <Shader />}
      </div>
      <div className="layer" style={{ background: `rgb(0 0 0 / ${s.dim})` }} />
      {s.grain && <div className="layer grain" style={{ opacity: s.grainOpacity }} />}
    </div>
  )
}
