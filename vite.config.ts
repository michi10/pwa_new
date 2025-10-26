import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import fs from 'node:fs/promises';
import path from 'node:path';

const assetManifestPlugin = () => {
  let outDir = 'dist';
  let assets: string[] = [];
  return {
    name: 'cws-asset-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    generateBundle(_, bundle) {
      assets = Object.values(bundle)
        .filter((entry) =>
          ((entry.type === 'chunk' || entry.type === 'asset') && entry.fileName && /\.(js|css)$/.test(entry.fileName))
        )
        .map((entry) => `/${entry.fileName}`);
    },
    async writeBundle() {
      const manifestPath = path.resolve(outDir, 'asset-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify({ assets }, null, 2), 'utf8');
    }
  };
};

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    assetManifestPlugin()
  ],
  build: {
    target: 'es2019',
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) {
              return 'leaflet';
            }
            if (id.includes('luxon')) {
              return 'luxon';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 4173,
    host: true
  }
});
