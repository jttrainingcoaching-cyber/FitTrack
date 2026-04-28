import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Port comes from CLI --port flag or falls back to 5173 when run directly.
    // Using an env var so preview_start can run on a different port without
    // conflicting with a developer's own vite instance.
    port: Number(process.env.VITE_DEV_PORT) || 5173,
    host: true,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
