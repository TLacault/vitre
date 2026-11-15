// Chrome Web Store images: five scenes of the real page, each framed with a headline (1280×800), plus the
// small promo tile (440×280) and the marquee (1400×560). Drives the local Brave headless against the dev server.
//   pnpm dev            (in another shell)
//   node scripts/shots.mjs [http://localhost:5173]
import { mkdirSync, readFileSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const URL_ = process.argv[2] ?? 'http://localhost:5173'
const OUT = new URL('../store/', import.meta.url).pathname
mkdirSync(`${OUT}raw`, { recursive: true })
const browser = await puppeteer.launch({ executablePath: '/usr/bin/brave', headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb'] })
const sleep = ms => new Promise(r => setTimeout(r, ms))

/** Loads the page fresh with `patch` over the defaults, runs `act`, saves a 2× capture. */
async function scene(name, patch, act = async () => {}) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 })
  await page.goto(URL_)
  await page.evaluate(async p => {
    localStorage.clear()
    const { defaults, merge } = await import('/src/settings.ts')
    const deep = (a, b) => { for (const k in b) a[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? deep({ ...a[k] }, b[k]) : b[k]; return a }
    localStorage.setItem('vitre', JSON.stringify(merge(defaults, deep(structuredClone(defaults), p))))
  }, patch)
  await page.evaluateOnNewDocument(() => { // a fixed, readable time in every shot
    const D = Date
    globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [2026, 10, 14, 9, 41])) } static now() { return new D(2026, 10, 14, 9, 41).getTime() } }
  })
  await page.reload()
  await sleep(2600) // wait + reveal + entrances
  await act(page)
  await page.mouse.move(5, 5)
  await sleep(700)
  await page.screenshot({ path: `${OUT}raw/${name}.png` })
  await page.close()
}

const open = sel => async page => { await page.click(sel); await sleep(500) }
const tab = n => async page => { await page.click('.gear'); await sleep(400); await page.click(`.tabbar button:nth-of-type(${n})`); await sleep(500) }

const photo = { bg: { kind: 'image' } }
await scene('1-home', {}, () => sleep(4000)) // the defaults: butterflies; give the flock time to fill the screen
await scene('2-animals', { animals: { kind: 'koi' } }, async page => {
  await tab(1)(page)
  await page.evaluate(() => document.querySelector('.panel-body .palettes')?.scrollIntoView({ block: 'center' }))
  await page.click('.panel-body button[aria-expanded]'); await sleep(3500)
})
await scene('3-glass', photo, tab(2))
await scene('4-tabs', { ...photo, tiles: { brandColours: true } }, async page => {
  await open('.dock-btn')(page)
  await page.click('.panel-tabs .tile-row:nth-of-type(4) .icon-btn'); await sleep(300)
  await page.keyboard.type('go'); await sleep(1500)
})
await scene('5-shader', { bg: { kind: 'shader' }, shader: { palette: 'aurora', light: 0.8 }, tiles: { labels: true } }, tab(6))

// ——— framing
const img = f => `data:image/png;base64,${readFileSync(`${OUT}raw/${f}.png`).toString('base64')}`
const wall = `data:image/webp;base64,${readFileSync(new URL('../public/wallpapers/default.webp', import.meta.url)).toString('base64')}`
const icon = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8')
const fonts = `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;500;600&display=block" rel="stylesheet">`
const base = `*{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:Geist,system-ui;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden}`

async function render(file, w, h, html) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await page.setContent(`<!doctype html><html><head>${fonts}<style>${base}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${OUT}${file}` })
  await page.close()
}

const shots = [
  ['1-home', 'A new tab made of glass', 'ASCII animals drifting behind a glass clock, search and your sites.'],
  ['2-animals', 'Seven animals, every knob', 'Butterflies, koi, jellyfish, dragonflies, frogs, cranes or crabs. Five moods, or fine-tune it all.'],
  ['3-glass', 'Tune every surface', 'Frost, tint, saturation, rim light and roundness, live as you drag.'],
  ['4-tabs', '3,500 brand icons, 1,600 more', 'Search any brand or icon for your favourite sites. Drag to reorder.'],
  ['5-shader', 'Your pictures, or a living gradient', 'Your own photos or a slow mesh gradient, with seven entrances and eight reveals.'],
]
for (const [f, title, sub] of shots) await render(`screenshot-${f}.png`, 1280, 800, `
  <div style="position:absolute;inset:0;background:url(${wall}) center/cover;filter:blur(40px) brightness(.45);transform:scale(1.2)"></div>
  <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;padding-top:40px">
    <h1 style="margin:0;font-size:46px;font-weight:600;letter-spacing:-.03em">${title}</h1>
    <p style="margin:12px 0 0;font-size:20px;font-weight:300;color:#ffffffc8">${sub}</p>
    <img src="${img(f)}" style="margin-top:30px;width:960px;border-radius:18px;box-shadow:0 30px 80px -20px #000c,0 0 0 1px #ffffff1f">
  </div>`)

const brand = (size, tag) => `<div style="display:flex;align-items:center;gap:${size * 0.4}px">
  <div style="width:${size}px;height:${size}px">${icon.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div>
  <div><div style="font-size:${size * 0.78}px;font-weight:600;letter-spacing:-.03em;line-height:1">Vitre</div>
  <div style="margin-top:${size * 0.12}px;font-size:${size * 0.27}px;font-weight:300;color:#ffffffcc">${tag}</div></div></div>`
await render('promo-small-440x280.png', 440, 280, `
  <div style="position:absolute;inset:0;background:url(${wall}) 40% 45%/cover;filter:brightness(.6)"></div>
  <div style="position:relative;height:100%;display:grid;place-items:center">${brand(70, 'A new tab made of glass')}</div>`)
await render('promo-marquee-1400x560.png', 1400, 560, `
  <div style="position:absolute;inset:0;background:url(${wall}) center 40%/cover;filter:brightness(.55)"></div>
  <div style="position:relative;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 90px">
    ${brand(110, 'A new tab made of glass')}
    <img src="${img('1-home')}" style="width:640px;border-radius:16px;box-shadow:0 30px 80px -20px #000d,0 0 0 1px #ffffff26">
  </div>`)

await browser.close()
console.log('store images written to', OUT)
