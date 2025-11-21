import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'], // Mantenemos esto para prevenir duplicados
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Solo separamos las librerías que sabemos que son PESADAS y seguras de separar
          if (id.includes('node_modules')) {
            // 1. Librerías de PDF (Casi 1MB)
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-libs';
            }
            // 2. Librerías de Iconos (1.4MB)
            if (id.includes('react-icons') || id.includes('@react-icons')) {
              return 'icons';
            }
            
          
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, 
  }
})