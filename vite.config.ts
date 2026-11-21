import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        id: './',
        name: 'Kids Chess',
        short_name: 'Kids Chess',
        description: 'Learn chess one piece at a time, with levels, streaks, and XP.',
        categories: ['education', 'games'],
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        background_color: '#fff6e5',
        theme_color: '#6c3fc5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      includeAssets: ['apple-touch-icon.png', 'favicon-32.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json,webmanifest}'] }
    })
  ]
});
