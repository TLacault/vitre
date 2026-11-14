import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defaults, merge } from '../src/settings.ts'

test('saved values win, new defaults fill gaps, junk is ignored', () => {
  const m = merge(defaults, { theme: 'light', glass: { bend: 1 }, bogus: 1, tiles: { list: [] } })
  assert.equal(m.theme, 'light')
  assert.equal(m.glass.bend, 1)
  assert.equal(m.glass.frost, defaults.glass.frost)
  assert.deepEqual(m.tiles.list, [])
  assert.equal('bogus' in m, false)
  assert.deepEqual(merge(defaults, null), defaults)
})
