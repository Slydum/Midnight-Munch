import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this project beneath /Midnight-Munch/.
  // An explicit base avoids ambiguous relative asset URLs on mobile Safari.
  base: '/Midnight-Munch/',
  plugins: [react()],
});
