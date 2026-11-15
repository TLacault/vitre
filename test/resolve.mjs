// Vite resolves extensionless and directory imports (the vendored src/ascii uses them); plain node doesn't.
import { registerHooks } from 'node:module'
registerHooks({
  resolve(spec, ctx, next) {
    try { return next(spec, ctx) } catch (e) {
      if (spec.startsWith('.')) for (const x of ['.ts', '/index.ts']) try { return next(spec + x, ctx) } catch {}
      throw e
    }
  },
})
