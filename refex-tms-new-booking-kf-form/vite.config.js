import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'emit-manifest-vite-plugin',
      writeBundle() {
        writeFileSync(
          resolve(__dirname, 'dist/manifest.json'),
          JSON.stringify({ Category: 'Form', Framework: 'React' }, null, 2)
        )
      },
    },
  ],
  base: '',
  build: { target: 'es2022' },
  server: { host: '0.0.0.0' },
})
