import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare({ viteEnvironment: { name: 'worker' } })],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  environments: { worker: { build: { sourcemap: false } } },
});
