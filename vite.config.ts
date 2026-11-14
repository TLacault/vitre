import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base: the built page is loaded from the extension's own origin.
export default defineConfig({ base: './', plugins: [react()], build: { target: 'es2022', chunkSizeWarningLimit: 1500 } })
