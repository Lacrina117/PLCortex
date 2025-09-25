import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // define process.env to be accessible in the client-side code
  define: {
    // This securely injects the API key from the server environment into the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group all node_modules into a single vendor chunk.
            // This helps with caching as vendor code changes less often.
            return 'vendor';
          }
        },
      },
    },
  },
});