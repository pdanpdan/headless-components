import { resolve } from 'node:path';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    svelte(),
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.app.json'),
      entryRoot: resolve(import.meta.dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'HeadlessComboboxSvelte',
      fileName: (format) => `index.${ format === 'es'
        ? 'mjs'
        : 'cjs' }`,
      formats: [ 'es', 'cjs' ],
    },
    rollupOptions: {
      external: [
        'svelte',
        /^svelte\/.*$/,
        '@pdanpdan/headless-combobox-core',
      ],
    },
    sourcemap: true,
  },
});
