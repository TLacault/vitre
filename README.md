# Vitre

A new tab page made of frosted glass, for Brave, Chrome and Firefox.

- **Backdrop:** your own images, cached in the browser, changing on every tab, every N hours, or never, or a living mesh-gradient shader in one of nine colour profiles, with motion, vibrance and luminosity. Optional grain, blur and dim on both, and a reveal as it arrives: iris, grid, plasma, zoom out, wipe, blinds or fade.
- **Glass:** every surface is frosted glass in plain CSS (backdrop blur, tint, a lit rim), with frost, saturation, tint, rim light and roundness all adjustable. Nothing is measured or filtered per frame, so it stays light.
- **Search** with Brave, Google, DuckDuckGo, Kagi, Startpage, or any URL with `%s`.
- **Favorite tabs** as glass buttons wearing the site's icon, a letter, any of ~3,500 brand marks ([Simple Icons](https://simpleicons.org), optionally in brand colour) or ~1,600 Lucide icons, all searchable. Set the columns before wrapping, spacing, size and shape; labels on or off. The tab list has its own popup (the grid button beside settings): drag to reorder, and a new tab names itself after its site.
- **Clock** with weight and size, optionally in glass digits (the time cut out of frosted glass). **Welcome line**, optionally on glass. `{greeting}` in the welcome text becomes Good morning / afternoon / evening.
- **Entrances:** pick how the page arrives from a live preview gallery (fade, rise, focus, bloom, drop, unfold), with a wait before it starts, its duration and stagger. A new tab opens on the last background's tone and holds the reveal until the background is ready, so there is no black flash.
- Settings live in the glass panel at the bottom right; the tab list in the popup beside it. They can be exported and imported as JSON.

## Install

```sh
pnpm install
pnpm build          # → dist/
```

- **Brave / Chrome:** `brave://extensions` → Developer mode → *Load unpacked* → `dist/`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → `dist/manifest.json`.
  For a permanent install, `pnpm zip` and sign `vitre.zip` on addons.mozilla.org.

`pnpm build` and `pnpm dev` first write `public/brands.json` from Simple Icons (`scripts/brands.mjs`). `pnpm dev` runs the page at `localhost:5173`, saving settings to localStorage instead of extension storage.

## Notes

- Site icons come from Google's favicon service. Pick an icon or a letter for a tile to keep its domain to yourself.

MIT
