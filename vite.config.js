import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// When deployed to GitHub Pages at https://0xnatal.github.io/pubgraph/, all
// asset URLs need the `/pubgraph/` prefix. Locally (`npm run dev`) the prefix
// must stay empty. We toggle via Vite's `command`: 'serve' = dev, 'build' = prod.
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/pubgraph/' : '/',
}))
