import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'prompt',
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
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,json,webmanifest}'] }
    })
  ]
});
