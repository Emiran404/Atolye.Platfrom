import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import obfuscator from 'rollup-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Sadece build aşamasında çalışan kod karıştırıcı (obfuscator)
    command === 'build' && obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      stringArrayThreshold: 1,
      splitStrings: true,
      splitStringsChunkLength: 5,
      unicodeEscapeSequence: false
    })
  ],
  build: {
    sourcemap: false, // F12'de orijinal kodun gözükmesini engeller
    minify: 'terser', // Daha agresif küçültme
    terserOptions: {
      compress: {
        drop_console: true, // Console logları temizler
        drop_debugger: true
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 80,
    watch: {
      ignored: ['**/src/uploads_student/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true
      },
      '/polyos-socket': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 80,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true
      },
      '/polyos-socket': {
        target: 'http://127.0.0.1:3001',
        ws: true,
        changeOrigin: true
      }
    }
  }
}))
