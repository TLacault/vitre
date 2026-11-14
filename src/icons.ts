import {
  BookOpen, Bot, Briefcase, Calendar, Camera, Cloud, Code, Coffee, Compass, Cpu, Film, Folder, Gamepad2, GitBranch,
  Globe, Heart, House, Image, Inbox, Mail, Map, MessageCircle, Music, Newspaper, Notebook, Palette, PenTool,
  ShoppingBag, Sparkles, Star, Terminal, Tv, Wallet, SquarePlay, Zap, type LucideIcon,
} from 'lucide-react'

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
