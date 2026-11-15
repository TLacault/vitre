import { useSyncExternalStore } from 'react'
import { ANIMAL_KEYS, ANIMALS, type AnimalKey } from './ascii/animals'

// Everything the page can be told, saved whole under one key. chrome.storage.local in the extension
// (Brave, Chrome, Firefox all expose `chrome`), localStorage under `vite dev`.

// icon: 'favicon' | 'letter' | curated key | 'lucide:Name' | 'brand:slug' (with its glyph kept here)
export type Tile = { id: string; name: string; url: string; icon: string; glyph?: { d: string; hex: string } }
export type Entrance = 'none' | 'fade' | 'rise' | 'blur' | 'scale' | 'drop' | 'unfold'
export type Reveal = 'none' | 'fade' | 'iris' | 'grid' | 'zoom' | 'plasma' | 'wipe' | 'blinds'

// The defaults are the author's own setup, with the bundled wallpaper (public/wallpapers/default.webp).
export const defaults = {
  theme: 'dark' as 'auto' | 'light' | 'dark',
  accent: '#7ca3ff',
  font: 'geist' as 'geist' | 'serif' | 'mono',
  bg: {
    blur: 0,
    dim: 0.5,
    fixedId: 'default',
    grain: true,
    grainOpacity: 0.5,
    kind: 'image' as 'shader' | 'image' | 'animals',
    periodHours: 24,
    reveal: 'iris' as Reveal,
    revealMs: 1000,
    rotate: 'fixed' as 'tab' | 'period' | 'fixed',
  },
  shader: {
    distortion: 1,
    light: 0.4,
    motion: 0.56,
    palette: 'grid',
    swirl: 1,
    vibrance: 0.85,
  },
  // Every animal's knobs, saved per animal, so switching back finds them as left.
  animals: {
    kind: 'butterflies' as AnimalKey,
    tune: Object.fromEntries(ANIMAL_KEYS.map(k => [k, { ...ANIMALS[k].defaults }])) as unknown as Record<AnimalKey, Record<string, number | boolean>>,
  },
  glass: {
    frost: 10,
    radius: 16,
    rim: 0.09,
    saturate: 1,
    tint: 0.25,
  },
  clock: {
    date: true,
    glass: true,
    h24: true,
    seconds: false,
    show: true,
    size: 0.95,
    weight: 520,
  },
  welcome: {
    glass: false,
    show: true,
    text: '{greeting}.',
  },
  search: {
    autofocus: true,
    custom: 'https://example.com/?q=%s',
    engine: 'google',
    newTab: false,
    placeholder: 'Search the web',
    show: true,
    width: 660,
  },
  tiles: {
    brandColours: false,
    columns: 4,
    gap: 23,
    labels: false,
    list: [
        {"glyph": {"d": "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", "hex": "181717"}, "icon": "brand:github", "id": "gh", "name": "GitHub", "url": "https://github.com"},
        {"glyph": {"d": "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", "hex": "FF0000"}, "icon": "brand:youtube", "id": "yt", "name": "YouTube", "url": "https://youtube.com"},
        {"glyph": {"d": "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z", "hex": "EA4335"}, "icon": "brand:gmail", "id": "gm", "name": "Mail", "url": "https://mail.google.com"},
        {"glyph": {"d": "M21 10.5h3v3h-3v3h-1.5v3H18v-3h-1.5v3H15v-3H9v3H7.5v-3H6v3H4.5v-3H3v-3H0v-3h3v-6h18Zm-15 0h1.5v-3H6Zm10.5 0H18v-3h-1.5z", "hex": "D97757"}, "icon": "brand:claudecode", "id": "cl", "name": "Claude", "url": "https://claude.ai"},
      ] as Tile[],
    newTab: false,
    shape: 'squircle' as 'circle' | 'squircle',
    show: true,
    size: 68,
  },
  motion: {
    duration: 500,
    entrance: 'rise' as Entrance,
    stagger: 85,
    wait: 300,
  },
  layout: {
    offset: 0.36,
  },
}

export type Settings = typeof defaults

/** Shader colour profiles: a dark base, two mids and two lights, as the mesh gradient wants them. */
export const palettes: Record<string, { label: string; colors: string[] }> = {
  dusk: { label: 'Dusk', colors: ['#04070d', '#0c2a44', '#5b3cc4', '#0a4f6b', '#d98ab0'] },
  grid: { label: 'Grid', colors: ['#02050a', '#06111c', '#1a3cff', '#0b2034', '#5fe1ff'] },
  aurora: { label: 'Aurora', colors: ['#020a0c', '#06302f', '#1fa58a', '#2b5fd9', '#9be7c4'] },
  ocean: { label: 'Ocean', colors: ['#01060f', '#06224a', '#0e6ba8', '#0a3d62', '#7dd3fc'] },
  ember: { label: 'Ember', colors: ['#0d0503', '#3a0d06', '#c2410c', '#7c1d3f', '#f5a25d'] },
  sunrise: { label: 'Sunrise', colors: ['#120814', '#4a1d4f', '#f2994a', '#b8336a', '#ffe29a'] },
  rose: { label: 'Rose', colors: ['#0c0508', '#3b0f24', '#c2417a', '#5a1e5e', '#ffc2d6'] },
  forest: { label: 'Forest', colors: ['#030904', '#0f2a17', '#3f7d4e', '#1d4732', '#c8d98a'] },
  mono: { label: 'Mono', colors: ['#050505', '#1a1a1a', '#4a4a4a', '#262626', '#a0a0a0'] },
}

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
