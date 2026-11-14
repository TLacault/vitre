// Packages dist/ for the stores: vitre-chrome-<v>.zip (no Firefox key in the manifest, which Chrome flags)
// and vitre-firefox-<v>.zip. Run after `pnpm build` (`pnpm zip` does both).
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const manifest = JSON.parse(readFileSync(join(root, 'dist/manifest.json'), 'utf8'))
for (const target of ['chrome', 'firefox']) {
  const dir = mkdtempSync(join(tmpdir(), `vitre-${target}-`))
  cpSync(join(root, 'dist'), dir, { recursive: true })
  const m = structuredClone(manifest)
  if (target === 'chrome') delete m.browser_specific_settings
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(m, null, 2))
  const out = join(root, `vitre-${target}-${m.version}.zip`)
  rmSync(out, { force: true })
  execFileSync('zip', ['-qr9X', out, '.'], { cwd: dir })
  rmSync(dir, { recursive: true })
  console.log(out)
}
