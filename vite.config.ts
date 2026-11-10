import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/des-echo/',
  plugins: [
    react(),
    // Installable from the browser menu, and works offline once loaded.
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      manifest: {
        // A fixed id of its own, so a phone never mixes it up with an earlier
        // install or with the other games on this site.
        id: 'des-echo',
        name: 'Echo',
        short_name: 'Echo',
        description:
          'A two-player music memory game for kids that works offline',
        theme_color: '#7c4dcc',
        background_color: '#f4f5f7',
        display: 'standalone',
      },
    }),
  ],
});
