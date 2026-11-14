import { useEffect, useState } from 'react'
import BookOpen from 'lucide-react/icons/book-open'
import Bot from 'lucide-react/icons/bot'
import Briefcase from 'lucide-react/icons/briefcase'
import Calendar from 'lucide-react/icons/calendar'
import Camera from 'lucide-react/icons/camera'
import Cloud from 'lucide-react/icons/cloud'
import Code from 'lucide-react/icons/code'
import Coffee from 'lucide-react/icons/coffee'
import Compass from 'lucide-react/icons/compass'
import Cpu from 'lucide-react/icons/cpu'
import Film from 'lucide-react/icons/film'
import Folder from 'lucide-react/icons/folder'
import Gamepad2 from 'lucide-react/icons/gamepad-2'
import GitBranch from 'lucide-react/icons/git-branch'
import Globe from 'lucide-react/icons/globe'
import Heart from 'lucide-react/icons/heart'
import House from 'lucide-react/icons/house'
import Image from 'lucide-react/icons/image'
import Inbox from 'lucide-react/icons/inbox'
import Mail from 'lucide-react/icons/mail'
import Map from 'lucide-react/icons/map'
import MessageCircle from 'lucide-react/icons/message-circle'
import Music from 'lucide-react/icons/music'
import Newspaper from 'lucide-react/icons/newspaper'
import Notebook from 'lucide-react/icons/notebook'
import Palette from 'lucide-react/icons/palette'
import PenTool from 'lucide-react/icons/pen-tool'
import ShoppingBag from 'lucide-react/icons/shopping-bag'
import Sparkles from 'lucide-react/icons/sparkles'
import Star from 'lucide-react/icons/star'
import Terminal from 'lucide-react/icons/terminal'
import Tv from 'lucide-react/icons/tv'
import Wallet from 'lucide-react/icons/wallet'
import SquarePlay from 'lucide-react/icons/square-play'
import Zap from 'lucide-react/icons/zap'
import type { LucideIcon } from 'lucide-react'

/** The icons a tile can wear instead of its site's favicon. */
export const icons: Record<string, LucideIcon> = {
  globe: Globe, house: House, mail: Mail, inbox: Inbox, calendar: Calendar, message: MessageCircle, git: GitBranch,
  code: Code, terminal: Terminal, cpu: Cpu, bot: Bot, sparkles: Sparkles, video: SquarePlay, tv: Tv, film: Film,
  music: Music, camera: Camera, image: Image, palette: Palette, pen: PenTool, book: BookOpen, notebook: Notebook,
  news: Newspaper, folder: Folder, cloud: Cloud, briefcase: Briefcase, wallet: Wallet, shop: ShoppingBag, map: Map,
  compass: Compass, game: Gamepad2, coffee: Coffee, heart: Heart, star: Star, zap: Zap,
}

export const favicon = (url: string) => {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128` } catch { return '' }
}

// The whole Lucide library (~1,600 icons) is its own chunk, loaded only when the picker searches it
// or a tile wears one of its icons ('lucide:Name'); the curated set above stays in the main bundle.
type Library = Record<string, LucideIcon>
let library: Promise<Library> | undefined
export const loadLibrary = () => (library ??= import('lucide-react').then(m => m.icons as unknown as Library))

/** Icon names matching `q`, curated-style keys first; at most `max`. */
export function searchIcons(lib: Library, q: string, max = 84) {
  const needle = q.trim().toLowerCase().replace(/[\s_-]+/g, '')
  return Object.keys(lib).filter(n => n.toLowerCase().includes(needle)).sort((a, b) => a.length - b.length).slice(0, max)
}

/** A tile's icon by its stored value: a curated key or 'lucide:Name'. */
export function TileGlyph({ name, size }: { name: string; size: number | string }) {
  const [Lib, setLib] = useState<LucideIcon>()
  const Curated = icons[name]
  useEffect(() => {
    if (!Curated && name.startsWith('lucide:')) loadLibrary().then(l => setLib(() => l[name.slice(7)]))
  }, [name])
  const I = Curated ?? Lib
  return I ? <I size={size} strokeWidth={1.6} /> : null
}
