import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
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
            // Example: separate node_modules into a vendor chunk
            return 'vendor';
          }
          if (id.includes('src/utils')) {
            // Example: separate utilities into their own chunk
            return 'utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 5000, // Adjust chunk size limit to 1000 KBs
  },
});
