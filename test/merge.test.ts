import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defaults, merge } from '../src/settings.ts'

test('saved values win, new defaults fill gaps, junk is ignored', () => {
  const m = merge(defaults, { theme: 'light', glass: { frost: 1, bend: 1 }, bogus: 1, tiles: { list: [] } })
  assert.equal(m.theme, 'light')
  assert.equal(m.glass.frost, 1)
  assert.equal('bend' in m.glass, false)
  assert.equal(m.glass.tint, defaults.glass.tint)
  assert.deepEqual(m.tiles.list, [])
  assert.equal('bogus' in m, false)
  assert.deepEqual(merge(defaults, null), defaults)
})

import { plasma, snap } from '../src/math.ts'

test('slider values snap to the step and stay in range', () => {
  assert.equal(snap(0.4567, 0, 1, 0.01), 0.46)
  assert.equal(snap(-3, 0, 10, 1), 0)
  assert.equal(snap(99, 0, 10, 1), 10)
  assert.equal(snap(305, 200, 2000, 50), 300)
})

test('plasma field stays in 0..1', () => {
  const f = plasma(32, 18)
  assert.ok(f.every(v => v >= 0 && v <= 1))
})
