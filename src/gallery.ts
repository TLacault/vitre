import { useSyncExternalStore } from 'react'
import { get, kv } from './settings'

// The image gallery, cached in IndexedDB: the full image and a small thumbnail for the settings grid.

export type Pic = { id: string; full: Blob; thumb: Blob; added: number }

const db = new Promise<IDBDatabase>((resolve, reject) => {
  const req = indexedDB.open('vitre', 1)
  req.onupgradeneeded = () => req.result.createObjectStore('pics', { keyPath: 'id' })
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error)
})

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
  const store = (await db).transaction('pics', mode).objectStore('pics')
  return new Promise<T>((resolve, reject) => {
    const r = fn(store)
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}

let pics: Pic[] = []
const listeners = new Set<() => void>()
async function refresh() {
  pics = (await tx<Pic[]>('readonly', s => s.getAll())).sort((a, b) => a.added - b.added)
  listeners.forEach(l => l())
}
// First run: the bundled wallpaper joins the gallery as 'default' (the default settings show it). Seeded once;
// a user who deletes it does not get it back.
async function seed() {
  if (await kv('vitre.seeded')) return
  if (await tx<number>('readonly', s => s.count())) return void (await kv('vitre.seeded', true)) // an existing gallery stays as it is
  try {
    const full = await (await fetch('./wallpapers/default.webp')).blob()
    const pic: Pic = { id: 'default', full, thumb: await shrink(full, 360), added: 0 }
    await tx('readwrite', s => s.put(pic))
  } catch {} // no bundled file (or no network in dev): the shader shows instead
  await kv('vitre.seeded', true)
}
export const ready = seed().then(refresh)
export const usePics = () => useSyncExternalStore(l => (listeners.add(l), () => listeners.delete(l)), () => pics)

async function shrink(file: Blob, max: number) {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = new OffscreenCanvas(Math.round(bmp.width * k), Math.round(bmp.height * k))
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.convertToBlob({ type: 'image/webp', quality: 0.86 })
}

export async function add(files: Iterable<File>) {
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue
    // ponytail: originals over 3840px are re-encoded to 3840 webp; keeps the store small and new tabs fast
    const [full, thumb] = await Promise.all([shrink(f, 3840), shrink(f, 360)])
    const pic: Pic = { id: crypto.randomUUID(), full, thumb, added: Date.now() }
    await tx('readwrite', s => s.put(pic))
  }
  await refresh()
}

export async function remove(id: string) {
  await tx('readwrite', s => s.delete(id))
  await refresh()
}

/** The image this tab shows, by the rotation setting. */
export async function pick(): Promise<Pic | undefined> {
  await ready
  if (!pics.length) return
  const { rotate, periodHours, fixedId } = get().bg
  if (rotate === 'fixed') return pics.find(p => p.id === fixedId) ?? pics[0]
  const cur = await kv<{ id: string; at: number }>('vitre.bg')
  const fresh = cur && pics.some(p => p.id === cur.id) && Date.now() - cur.at < periodHours * 3600e3
  if (rotate === 'period' && fresh) return pics.find(p => p.id === cur!.id)
  const pool = pics.length > 1 ? pics.filter(p => p.id !== cur?.id) : pics
  const next = pool[Math.floor(Math.random() * pool.length)]!
  await kv('vitre.bg', { id: next.id, at: Date.now() })
  return next
}
