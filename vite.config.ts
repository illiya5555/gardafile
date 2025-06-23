import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    minify: true, // Ensure minification is enabled
    cssMinify: true, // CSS minification
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['react-i18next'],
          // You can add more manual chunks if needed
        },
      },
    },
    // Reduce chunk sizes by increasing the limit for inlining
    assetsInlineLimit: 4096, // 4KB
    // Enable source maps in development but not in production
    sourcemap: process.env.NODE_ENV === 'development',
  },
});