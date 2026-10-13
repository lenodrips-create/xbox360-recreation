import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build can be opened from any static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
