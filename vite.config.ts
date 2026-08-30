import { defineConfig } from 'vite'
import ReactPlugin from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  plugins: [
    ReactPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'NutriVision - AI Nutrition Tracker',
        short_name: 'NutriVision',
        description: 'AI-powered gym nutrition tracker with meal logging, coaching, and meal plans',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
        start_url: '/',
        orientation: 'portrait',
        categories: ['health', 'fitness', 'food'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
