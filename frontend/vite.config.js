import url from 'node:url';
import path from 'path'

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// const [frontendSrcDirectory, sharedDir] = ['./src/', '../shared/'].map(
//   (relativePath) => url.fileURLToPath(new URL(relativePath, import.meta.url)),
// );
// Ensure correct path resolution for both Windows & macOS/Linux
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function normalizePath(p) {
  return p.replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
}

const [frontendSrcDirectory, sharedDir] = ['./src/', '../shared/'].map(
  (relativePath) => normalizePath(path.resolve(__dirname, relativePath)),
);


function serverModuleImportsPlugin() {
  function isServerModule(moduleId) {
    return moduleId.startsWith('/api/js-modules/');
  }

  return {
    name: 'server-js-module-imports',
    resolveId(source) {
      if (isServerModule(source)) {
        return { id: source, external: true };
      }
      return null;
    },
    load(id) {
      if (isServerModule(id)) {
        return { code: 'export default {};' };
      }
    },
  };
}


// https://vite.dev/config/
export default defineConfig({
  // Register the React plugin
  plugins: [serverModuleImportsPlugin(), react(), tailwindcss()],
  preview: {
    port: 3000,
  },
  build: { outDir: 'build' },
  // Development server
  server: {
    allowedHosts:['on-poodle-classic.ngrok-free.app'],
    port: 3000,
    // API proxy
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        // Change the origin of the host header to the target URL
        // changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '##/shared': sharedDir,
      '##/src': frontendSrcDirectory,
    },
  },
});
