# Chrome Web Store listing — Vitre

Package: `vitre-chrome-<version>.zip` (`pnpm zip`), or `pnpm release chrome` to upload and publish it. Images in this folder. Copy each field as is.

## Store listing

**Name** (read from the manifest)
Vitre – Glass New Tab

**Summary** (from the manifest, 122/132 characters)
A new tab made of glass over ASCII animals, your pictures or a living gradient, with a glass clock, search and your sites.

**Category**
Make Chrome Yours → Functionality & UI

**Language**
English

**Description**

░▒▓  A new tab made of glass  ▓▒░

Vitre turns every new tab into a quiet pane of frosted glass. Behind it: a picture you love, a slow living gradient, or a flock of ASCII animals drifting by. In front: a clock, a search bar and your favourite sites, each one a piece of glass blurring what's behind it.

No feeds. No news. No account. Just a calm place to start from.

━━━━━━━━━━━━━━━━━━━━

✦ NEW IN 1.1: ASCII ANIMALS 🦋

A living background drawn entirely in characters ( # % = + o / | ), drifting behind the glass.

🦋 Butterflies   🐟 Koi   🪼 Jellyfish   ✧ Dragonflies
🐸 Frogs   🕊️ Cranes   🦀 Crabs

  ▸ Five moods in one click: Natural, Calm, Swarm, Distant, Vivid
  ▸ A fine-tune panel with every knob: density, speed, size, depth, colour and more, saved per animal
  ▸ Click anywhere on the page to startle them
  ▸ Plus a second grain style and a grain size, from fine film to coarse speckle

━━━━━━━━━━━━━━━━━━━━

🖼️ YOUR BACKGROUND
  ◇ ASCII animals, your own pictures, or a living mesh gradient in nine palettes
  ◇ Pictures are cached in the browser, so a new tab opens instantly, even offline
  ◇ A new picture on every tab, every few hours, or always the same
  ◇ Blur, dim and grain on top of any of them
  ◇ Eight ways for it to arrive: iris, grid, plasma, zoom out, wipe, blinds, fade or none

🧊 GLASS, YOUR WAY
  ◇ Frost, tint, saturation, rim light and roundness, all live as you drag
  ◇ A clock in glass digits cut out of the glass itself, or plain, at any size and weight
  ◇ A welcome line that greets you by the time of day
  ◇ Dark, light or follow the system, with an accent colour and three typefaces

⭐ YOUR SITES
  ◇ Favourite tabs as glass buttons, with or without labels, in as many columns as you like
  ◇ 3,500 brand marks (YouTube, Netflix, GitHub, Spotify…) and 1,600 icons, all searchable
  ◇ Or the site's own icon, or a letter
  ◇ Drag to reorder; a new tab names itself after its site

🔍 SEARCH
  ◇ Google, Brave, DuckDuckGo, Kagi, Startpage or any search URL you give it
  ◇ Type an address to go straight there

✨ MOTION
  ◇ Seven entrances for the page: rise, fade, focus, bloom, drop, unfold, none
  ◇ Set the wait, duration and stagger, with a live preview
  ◇ No black flash: a new tab opens on your last background's tone
  ◇ Reduced-motion settings are respected

🔒 PRIVATE BY DESIGN
  ◇ No account, no analytics, no server
  ◇ Settings and pictures stay in your browser
  ◇ Export them to a file and import them anywhere

━━━━━━━━━━━━━━━━━━━━

⌥ Open source (MIT): https://github.com/TLacault/vitre
Made with care for Brave, Chrome and Firefox.

## Graphic assets

| Field | File |
|---|---|
| Store icon (128×128) | `../public/icon-128.png` |
| Screenshots (1280×800), in this order | `screenshot-1-home.png`, `screenshot-2-animals.png`, `screenshot-3-glass.png`, `screenshot-4-tabs.png`, `screenshot-5-shader.png` |
| Small promo tile (440×280) | `promo-small-440x280.png` |
| Marquee promo tile (1400×560) | `promo-marquee-1400x560.png` |

Regenerate them with `pnpm dev` running and `pnpm shots http://localhost:5173`.

## Privacy practices

**Single purpose**
Vitre replaces the browser's new tab page with a customisable page showing a background picture, a clock, a search bar and the user's favourite sites.

**Permission justification**
- `storage`: saves the user's settings (appearance, favourite sites, search engine) on their device.
- `unlimitedStorage`: keeps the user's own background pictures in the browser's local storage, which can exceed the default quota once a few high-resolution images are added.

**Remote code**
No, I am not using remote code. All scripts, fonts and icon libraries are packaged in the extension.

**Data usage**
Collects none of the listed data types. Tick the three certifications (no selling, no unrelated use, no creditworthiness use).

**Privacy policy URL**
https://github.com/TLacault/vitre/blob/main/PRIVACY.md
