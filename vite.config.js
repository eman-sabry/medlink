import {
  defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
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