import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';
import { defineConfig } from 'vite';

import { highlightPlugin } from './lib/highlight.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/headless-components/',
  plugins: [
    highlightPlugin(),
    vike(),
    vue({
      include: [ /\.vue$/ ],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: /^#\/(.*)$/, replacement: `${ resolve(currentDir) }/$1` },
      { find: /^@pdanpdan\/headless-combobox$/, replacement: resolve(currentDir, '../headless-combobox/src/index.ts') },
    ],
  },
  server: {
    fs: {
      allow: [ '../..' ],
    },
  },
});
