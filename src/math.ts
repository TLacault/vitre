/** `v` clamped to [min, max] and rounded to the nearest step from min. */
export const snap = (v: number, min: number, max: number, step: number) =>
  +Math.min(max, Math.max(min, min + Math.round((v - min) / step) * step)).toFixed(6)

/** Classic plasma: a sum of sines on a w×h grid, drifting with `phase`, stretched to fill 0..1. */
export function plasma(w: number, h: number, phase = 0) {
  const out = new Float64Array(w * h)
  let lo = Infinity, hi = -Infinity
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x / w) * 6, v = (y / w) * 6
    const n = Math.sin(u * 1.3 + phase) + Math.sin(v * 1.7 + u * 0.4 - phase * 0.7) + Math.sin((u + v) * 0.9 + phase * 0.5) + Math.sin(Math.hypot(u - 3, v - 1.7) * 1.6 - phase)
    out[y * w + x] = n
    lo = Math.min(lo, n); hi = Math.max(hi, n)
  }
  for (let i = 0; i < out.length; i++) out[i] = (out[i]! - lo) / (hi - lo || 1)
  return out
}
