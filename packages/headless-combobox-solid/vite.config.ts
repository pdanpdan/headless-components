import { resolve } from 'node:path';

import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    solid(),
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.app.json'),
      entryRoot: resolve(import.meta.dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'HeadlessComboboxSolid',
      fileName: (format) => `index.${ format === 'es'
        ? 'mjs'
        : 'cjs' }`,
      formats: [ 'es', 'cjs' ],
    },
    rollupOptions: {
      external: [
        /^solid-js(\/.*)?$/,
        /^@solidjs\//,
        '@pdanpdan/headless-combobox-core',
      ],
    },
    sourcemap: true,
  },
});
