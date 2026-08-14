import {
  defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createApiMiddleware } from './server/apiRouter.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(createApiMiddleware())
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    watch: {
      // ignore db.json so edits don't trigger a full page reload
      ignored: [
        '**/db.json',
        '**/data.json',
        '**/patients.json',
        '**/server/**',
      ],
    },
  },
})
