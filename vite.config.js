import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'), // Simplified alias
    },
  },
  server: {
    port: 3030,
  },
  preview: {
    port: 3030,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/utils')) {
            return 'utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 5000,
  },
});
