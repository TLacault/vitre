import { useSyncExternalStore } from 'react'

// Everything the page can be told, saved whole under one key. chrome.storage.local in the extension
// (Brave, Chrome, Firefox all expose `chrome`), localStorage under `vite dev`.

export type Tile = { id: string; name: string; url: string; icon: string } // icon: 'favicon' | 'letter' | lucide name
export type Entrance = 'none' | 'fade' | 'rise' | 'blur' | 'scale' | 'drop' | 'unfold'
export type Reveal = 'none' | 'fade' | 'iris' | 'grid' | 'zoom' | 'plasma' | 'wipe' | 'blinds'

export const defaults = {
  theme: 'dark' as 'auto' | 'light' | 'dark',
  accent: '#7cc4ff',
  font: 'geist' as 'geist' | 'serif' | 'mono',
  bg: {
    kind: 'shader' as 'shader' | 'image',
    rotate: 'tab' as 'tab' | 'period' | 'fixed',
    periodHours: 24,
    fixedId: '',
    blur: 0,
    dim: 0.15,
    grain: true,
    grainOpacity: 0.12,
    reveal: 'iris' as Reveal,
    revealMs: 1400,
  },
  shader: {
    colors: ['#04070d', '#0c2a44', '#5b3cc4', '#0a4f6b', '#d98ab0'],
    motion: 0.25,
    vibrance: 1,
    light: 1,
    distortion: 0.8,
    swirl: 0.3,
  },
  glass: { frost: 18, tint: 0.22, saturate: 1.6, rim: 0.16, radius: 22 },
  clock: { show: true, h24: true, seconds: false, date: true, size: 1, glass: false },
  welcome: { show: true, text: '{greeting}.', glass: false },
  search: { show: true, engine: 'brave', custom: 'https://example.com/?q=%s', placeholder: 'Search the web', width: 560, autofocus: true, newTab: false },
  tiles: {
    show: true,
    labels: true,
    size: 64,
    shape: 'squircle' as 'circle' | 'squircle',
    newTab: false,
    list: [
      { id: 'gh', name: 'GitHub', url: 'https://github.com', icon: 'favicon' },
      { id: 'yt', name: 'YouTube', url: 'https://youtube.com', icon: 'favicon' },
      { id: 'gm', name: 'Mail', url: 'https://mail.google.com', icon: 'favicon' },
      { id: 'cl', name: 'Claude', url: 'https://claude.ai', icon: 'favicon' },
    ] as Tile[],
  },
  motion: { entrance: 'rise' as Entrance, duration: 700, stagger: 60 },
  layout: { offset: 0.38 }, // vertical position of the stack, share of the viewport
}
export type Settings = typeof defaults

export const engines: Record<string, { label: string; url: string }> = {
  brave: { label: 'Brave', url: 'https://search.brave.com/search?q=%s' },
  google: { label: 'Google', url: 'https://www.google.com/search?q=%s' },
  ddg: { label: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
  kagi: { label: 'Kagi', url: 'https://kagi.com/search?q=%s' },
  startpage: { label: 'Startpage', url: 'https://www.startpage.com/do/search?q=%s' },
  custom: { label: 'Custom', url: '' },
}

const KEY = 'vitre'
const ext = typeof chrome !== 'undefined' && !!chrome.storage?.local

/** Defaults under what was saved, key by key, so a setting added later still has its value. */
export function merge<T>(base: T, saved: unknown): T {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return (saved ?? base) as T
  const out: Record<string, unknown> = { ...(base as object) }
  if (saved && typeof saved === 'object' && !Array.isArray(saved))
    for (const k of Object.keys(base)) if (k in saved) out[k] = merge((base as any)[k], (saved as any)[k])
  return out as T
}

let state: Settings = defaults
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

export async function load() {
  const raw = ext ? (await chrome.storage.local.get(KEY))[KEY] : JSON.parse(localStorage.getItem(KEY) ?? 'null')
  state = merge(defaults, raw)
  if (ext) chrome.storage.onChanged.addListener((c, area) => {
    if (area === 'local' && c[KEY]) { state = merge(defaults, c[KEY].newValue); emit() }
  })
  emit()
}

let saving: ReturnType<typeof setTimeout> | undefined
export function save(next: Settings) {
  state = next
  emit()
  clearTimeout(saving) // sliders fire per frame; storage gets the last value
  saving = setTimeout(() => (ext ? chrome.storage.local.set({ [KEY]: state }) : localStorage.setItem(KEY, JSON.stringify(state))), 150)
}

/** Sets one value by dotted path: set('glass.bend', 0.5). */
export function set(path: string, value: unknown) {
  const keys = path.split('.')
  const next = structuredClone(state) as any
  let o = next
  for (const k of keys.slice(0, -1)) o = o[k]
  o[keys.at(-1)!] = value
  save(next)
}

export const get = () => state
export function useSettings() {
  return useSyncExternalStore(l => (listeners.add(l), () => listeners.delete(l)), get)
}

/** Small key/value beside the settings (which image is showing, since when). */
export async function kv<T>(key: string, value?: T): Promise<T | undefined> {
  if (value !== undefined) {
    if (ext) await chrome.storage.local.set({ [key]: value })
    else localStorage.setItem(key, JSON.stringify(value))
    return value
  }
  return ext ? ((await chrome.storage.local.get(key))[key] as T | undefined) : JSON.parse(localStorage.getItem(key) ?? 'null') ?? undefined
}
