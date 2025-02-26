import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  base: '/chemical-analysis/',
  assetsInclude: ['**/*.bin', '**/*.wasm'],
  plugins: [react(), nodePolyfills(), ],
  define: {
    'import.meta.env.MOCKED': process.env.MOCKED === 'true',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      
    },
  },
  server: {
   
    port: 9000,
  
  },
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
