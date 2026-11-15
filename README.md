<p align="center">
  <img src="public/icon.svg" width="96" alt="Vitre">
</p>

<h1 align="center">Vitre</h1>

<p align="center">
  <b>A new tab made of glass.</b><br>
  Your picture or a living gradient, a clock cut out of glass, search and your sites. Nothing else.
</p>

<p align="center">
  <a href="#install"><img alt="Chrome · Brave · Firefox" src="https://img.shields.io/badge/Chrome%20·%20Brave%20·%20Firefox-MV3-7ca3ff?style=flat-square"></a>
  <img alt="MIT" src="https://img.shields.io/badge/license-MIT-7ca3ff?style=flat-square">
  <img alt="No tracking" src="https://img.shields.io/badge/tracking-none-7ca3ff?style=flat-square">
</p>

<p align="center">
  <img src="store/promo-marquee-1400x560.png" alt="Vitre: a new tab made of glass" width="100%">
</p>

---

Every new tab is a moment you look at a hundred times a day. Vitre makes it a quiet pane of frosted glass over a picture you love: the background arrives with an iris, a plasma dissolve or a grid of tiles, then the clock, the search bar and your sites settle in on top, each one a piece of glass blurring what's behind it.

No feeds. No news. No account. No server. Just yours.

## Glass, everywhere

<img src="store/screenshot-3-glass.png" alt="Glass settings" width="100%">

Every surface is real frosted glass: the search bar, your tabs, the panels, even the clock's digits, cut out of the glass itself. Frost, tint, saturation, rim light and roundness move live as you drag. It's plain CSS with nothing computed per frame, so it stays fast.

## Your sites, your icons

<img src="store/screenshot-4-tabs.png" alt="Brand icon search" width="100%">

Favourite tabs as glass buttons, in as many columns as you like, labels on or off. Give each one its site's icon, a letter, any of **3,500 brand marks** (YouTube, Netflix, GitHub, Spotify…) or **1,600 icons**, all searchable. The list has its own panel: drag to reorder, and a new tab names itself after its site.

## Your pictures, or a living gradient

<img src="store/screenshot-5-shader.png" alt="Shader background" width="100%">

Drop in your own pictures: they're cached in the browser, so a new tab opens instantly, even offline. Show a new one on every tab, every few hours, or always the same. Or pick a slow mesh gradient in one of nine palettes and tune its motion, vibrance and luminosity. Blur, dim and grain on top of any of them, with two grain styles and a size from fine to coarse.

## ASCII animals

<img src="store/screenshot-2-animals.png" alt="ASCII animals and their fine-tune panel" width="100%">

Or let ASCII animals drift behind the glass: butterflies, koi, jellyfish, dragonflies, frogs, cranes or crabs. Each comes with five moods (natural, calm, swarm, distant, vivid) and a fine-tune panel with every knob, saved per animal. Click anywhere to startle them. Built on [ascii-animals](src/ascii/README.md) (MIT).

## Choose how it arrives

Eight reveals for the background (iris, grid, plasma, zoom out, wipe, blinds, fade, none) and seven entrances for the page, with the wait, duration and stagger you set. Every option has a live preview. A new tab opens on your last background's tone and waits until the picture is ready, so there's never a black flash. Reduced-motion settings are respected.

## Everything else

- **Search** with Google, Brave, DuckDuckGo, Kagi, Startpage or any URL with `%s`. Type an address to go straight there.
- **Clock** in glass digits or plain, any size and weight, 12 or 24 hours, seconds and date optional.
- **Welcome line** that greets you by the time of day (`{greeting}`), optionally on glass.
- **Theme** dark, light or system, an accent colour, three typefaces.
- **Export / import** your whole setup as one JSON file.

## Private by design

Settings and pictures stay in your browser. Nothing is collected, nothing is sent anywhere, with one exception you control: a tab set to show its site's icon loads it from Google's favicon service (pick a brand icon instead to avoid it). Full policy: [PRIVACY.md](PRIVACY.md).

## Install

**From source**

```sh
pnpm install
pnpm build          # → dist/
```

- **Brave / Chrome:** `brave://extensions` → Developer mode → *Load unpacked* → `dist/`
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → `dist/manifest.json`

## Develop

```sh
pnpm dev            # the page on localhost:5173, settings in localStorage
pnpm test           # node --test
pnpm zip            # vitre-chrome-<v>.zip and vitre-firefox-<v>.zip
pnpm shots <url>    # regenerate the store images from a running dev server
```

Vite + React + TypeScript. The glass and every control are hand-written (`src/ui.tsx`, `src/styles.css`); the gradient is [Paper Shaders](https://github.com/paper-design/shaders), brand marks are [Simple Icons](https://simpleicons.org) (CC0), icons are [Lucide](https://lucide.dev). Store listing and images live in [`store/`](store/LISTING.md).

## License

MIT © Tim Lacault
