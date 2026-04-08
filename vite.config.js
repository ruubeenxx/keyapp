import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'KeyApp',
        short_name: 'KeyApp',
        description: 'Tu app de amor y estudio, Amor',
        theme_color: '#7C3AED',
        background_color: '#0f0a1e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/keyapp/keyapp1.jpeg', sizes: '192x192', type: 'image/jpeg' },
          { src: '/keyapp/keyapp2.jpeg', sizes: '512x512', type: 'image/jpeg' }
        ]
      }
    })
  ],
  base: '/keyapp/'
})