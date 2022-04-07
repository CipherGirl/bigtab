import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from 'rollup-plugin-chrome-extension';
import manifest from './src/manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
});
