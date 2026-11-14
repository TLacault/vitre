# Chrome Web Store listing — Vitre

Package: `vitre-chrome-1.0.0.zip` (`pnpm zip`). Images in this folder. Copy each field as is.

## Store listing

**Name** (read from the manifest)
Vitre – Glass New Tab

**Summary** (from the manifest, 119/132 characters)
A new tab made of glass: your picture or a living gradient, a glass clock, search and your sites. Customise everything.

**Category**
Make Chrome Yours → Functionality & UI

**Language**
English

**Description**

Vitre turns every new tab into a quiet pane of frosted glass over a picture you love.

Open a tab and your background arrives with an iris, a plasma dissolve or a grid of tiles, then the clock, the search bar and your favourite sites settle in on top, each one a piece of glass blurring what is behind it. Nothing else: no feeds, no news, no account.

YOUR BACKGROUND
• Add your own pictures. They are cached in the browser, so a new tab opens instantly, even offline.
• Show a new one on every tab, every few hours, or always the same.
• Or pick a living mesh gradient in one of nine palettes, with its motion, vibrance and luminosity.
• Grain, blur and dim on top of either.
• Eight reveals for how it arrives: iris, grid, plasma, zoom out, wipe, blinds, fade or none.

GLASS, YOUR WAY
• Frost, tint, saturation, rim light and roundness, all live as you drag.
• A clock in glass digits, cut out of the glass itself, or plain, at any size and weight.
• A welcome line that greets you by the time of day.
• Dark, light or follow the system, an accent colour and three typefaces.

YOUR SITES
• Favourite tabs as glass buttons, with or without labels, in as many columns as you like.
• Give each one its site's icon, a letter, one of 3,500 brand marks (YouTube, Netflix, GitHub, Spotify…) or one of 1,600 icons, all searchable.
• Edit the list in its own panel: drag to reorder, and a new tab names itself after its site.

SEARCH
• Google, Brave, DuckDuckGo, Kagi, Startpage or any search URL you give it. Type an address to go straight there.

MOTION
• Seven entrances for the page (rise, fade, focus, bloom, drop, unfold, none) with the wait, duration and stagger you set. Reduced-motion settings are respected.

PRIVATE BY DESIGN
Vitre has no account, no analytics and no server. Your settings and pictures stay in your browser. Export them to a file and import them anywhere.

Open source (MIT): https://github.com/TLacault/vitre

## Graphic assets

| Field | File |
|---|---|
| Store icon (128×128) | `../public/icon-128.png` |
| Screenshots (1280×800), in this order | `screenshot-1-home.png`, `screenshot-2-glass.png`, `screenshot-3-tabs.png`, `screenshot-4-shader.png`, `screenshot-5-motion.png` |
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
