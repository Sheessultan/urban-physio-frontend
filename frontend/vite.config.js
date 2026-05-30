import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** VITE_APP_BASE_PATH: /theurbanphysio (local) or empty (live public_html root) */
function viteBaseFromEnv(env) {
  const raw = (env.VITE_APP_BASE_PATH ?? '/theurbanphysio').trim()
  if (raw === '' || raw === '/') {
    return '/'
  }
  return `/${raw.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = viteBaseFromEnv(env)
  const baseNoSlash = base.replace(/\/$/, '') || ''
  const apiProxyPath = `${baseNoSlash}/backend/api`

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        [apiProxyPath]: {
          target: 'http://localhost',
          changeOrigin: true,
        },
      },
    },
  }
})
