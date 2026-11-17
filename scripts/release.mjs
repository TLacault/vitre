// Sends the current version to the stores: `pnpm release` (both), `pnpm release firefox`, `pnpm release chrome`.
// Bump "version" in public/manifest.json and package.json, commit, then run it. Keys in .env.store
// (see .env.store.example). Both stores review the upload before it goes live.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' })
if (existsSync(join(root, '.env.store'))) process.loadEnvFile(join(root, '.env.store'))
const targets = process.argv[2] ? [process.argv[2]] : ['firefox', 'chrome']
const need = { firefox: ['WEB_EXT_API_KEY', 'WEB_EXT_API_SECRET'], chrome: ['EXTENSION_ID', 'PUBLISHER_ID', 'CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'] }
for (const t of targets) {
  if (!need[t]) throw new Error(`unknown store "${t}": firefox or chrome`)
  const missing = need[t].filter(k => !process.env[k])
  if (missing.length) throw new Error(`${t}: missing ${missing.join(', ')} in .env.store`)
}
// Mozilla reviews the source that builds the zip: it has to be exactly what is committed.
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root, encoding: 'utf8' }).trim())
  throw new Error('commit your changes first: the source sent for review is the last commit')

const { version, description: summary } = JSON.parse(readFileSync(join(root, 'public/manifest.json'), 'utf8'))
run('pnpm', ['zip'])

if (targets.includes('firefox')) {
  const src = join(root, `vitre-source-${version}.zip`)
  run('git', ['archive', '--format=zip', '-o', src, 'HEAD'])
  // The listing for a first submission (later ones keep what AMO has), from store/LISTING.md.
  const listing = readFileSync(join(root, 'store/LISTING.md'), 'utf8')
  const description = listing.split('**Description**')[1].split('## Graphic assets')[0].trim()
  const meta = join(mkdtempSync(join(tmpdir(), 'vitre-amo-')), 'metadata.json')
  writeFileSync(meta, JSON.stringify({
    categories: ['appearance'],
    summary: { 'en-US': summary },
    description: { 'en-US': description },
    homepage: { 'en-US': 'https://github.com/TLacault/vitre' },
    version: {
      license: 'MIT',
      approval_notes: 'Source: the attached zip (git archive of the release commit). Build with Node 24 and pnpm 10: `pnpm install --frozen-lockfile && pnpm build`, output in dist/ (same files as the submitted package). '
        + 'The innerHTML warnings are third-party library internals: React DOM\'s SVG fallback, and Paper Shaders injecting its own static stylesheet. No remote code, no data collected.',
    },
  }))
  run('pnpm', ['exec', 'web-ext', 'sign', '--source-dir', 'dist', '--channel', 'listed', '--amo-metadata', meta,
    '--upload-source-code', src, '--artifacts-dir', 'web-ext-artifacts', '--approval-timeout', '0'])
}
if (targets.includes('chrome')) run('pnpm', ['exec', 'chrome-webstore-upload', '--source', `vitre-chrome-${version}.zip`])
