# Vitre

A new tab page made of liquid glass, for Brave, Chrome and Firefox.

- **Backdrop:** your own images, cached in the browser, changing on every tab, every N hours, or never, or a living mesh-gradient shader with your colours, motion, vibrance and luminosity. Optional grain, blur and dim on both.
- **Glass:** every surface is [Glisse](https://glisse.kelvinzhang.ca/) liquid glass, with bend, dispersion, frost, tint, rim light and roundness all adjustable.
- **Search** with Brave, Google, DuckDuckGo, Kagi, Startpage, or any URL with `%s`.
- **Favorite tabs** as glass buttons wearing the site's icon, a letter or one of 35 icons, with labels on or off.
- **Entrances:** pick how the page arrives from a live preview gallery (fade, rise, focus, bloom, drop, unfold), with its duration and stagger.
- Settings live in the glass panel at the bottom right. They can be exported and imported as JSON.

## Install

```sh
pnpm install
pnpm build          # → dist/
```

- **Brave / Chrome:** `brave://extensions` → Developer mode → *Load unpacked* → `dist/`.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → `dist/manifest.json`.
  For a permanent install, `pnpm zip` and sign `vitre.zip` on addons.mozilla.org.

`pnpm dev` runs the page at `localhost:5173`, saving settings to localStorage instead of extension storage.

## Notes

- The glass bends what is behind it in Chromium browsers (Brave, Chrome, Edge). Firefox can't apply SVG filters to a live backdrop, so there the glass keeps its frost and lit rim without the bend.
- Site icons come from Google's favicon service. Pick an icon or a letter for a tile to keep its domain to yourself.

MIT
