import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the build works at any URL (GitHub Pages project
  // subpath, Vercel root, etc.) without configuration.
  base: './',
  plugins: [react()],
});
