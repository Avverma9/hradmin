import path from 'path';
import { defineConfig } from 'vite'; // Import `defineConfig` only once
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
// import { createHtmlPlugin } from 'vite-plugin-html'; // Uncomment if needed
// import { ViteHtmlPlugin } from 'vite-plugin-html'; // Uncomment if needed
// import { ViteBundleAnalyzerPlugin } from 'vite-plugin-bundle-analyzer'; // Uncomment if needed

export default defineConfig({
  plugins: [
    react(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
    }),
    // Uncomment these lines if you are using the plugins
    // createHtmlPlugin({
    //   inject: {
    //     inject: '<script src="bundle-analyzer.js"></script>',
    //   },
    // }),
    // ViteHtmlPlugin(), // Add if using ViteHtmlPlugin
    // ViteBundleAnalyzerPlugin() // Add if using ViteBundleAnalyzerPlugin
  ],
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
            return 'vendor'; // Example: separate node_modules into a vendor chunk
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Adjust chunk size limit to 1000 KBs
  },
});
