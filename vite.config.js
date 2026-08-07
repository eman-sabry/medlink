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
      // تجاهل ملف قاعدة البيانات حتى لا يقوم Vite بعمل Reload للصفحة عند الإضافة أو التعديل أو الحذف
      ignored: [
        '**/db.json',
        '**/data.json',
        '**/patients.json',
        '**/server/**',
      ],
    },
  },
})