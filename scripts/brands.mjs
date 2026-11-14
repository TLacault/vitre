// Writes public/brands.json from Simple Icons: [slug, title, hex, path] per brand. The package ships each
// mark twice (path and full SVG), ~5 MB; this keeps only what the picker draws.
import { writeFileSync } from 'node:fs'
import * as icons from 'simple-icons'

const rows = Object.values(icons).filter(b => b && b.path).map(b => [b.slug, b.title, b.hex, b.path])
writeFileSync(new URL('../public/brands.json', import.meta.url), JSON.stringify(rows))
console.log(`brands.json: ${rows.length} brands`)
