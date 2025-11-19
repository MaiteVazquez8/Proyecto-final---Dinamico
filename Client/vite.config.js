import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {}
  },
  optimizeDeps: {
    include: ['sweetalert2', 'react-icons']
  },
  server: {
    hmr: {
      overlay: true
    }
  }
})
