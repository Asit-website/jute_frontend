import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend.rkumar.co.in',
        // target: 'http://localhost:5000',
        changeOrigin: true,
        secure: true
      }
    }
  }
})

