import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // This block is crucial for fixing module resolution errors in production builds
    rollupOptions: {
      external: ['react-dropzone'],
    },
  },
});