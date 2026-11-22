import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.app.json'),
      entryRoot: resolve(import.meta.dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'HeadlessComboboxCore',
      fileName: (format) => `index.${ format === 'es'
        ? 'mjs'
        : 'cjs' }`,
      formats: [ 'es', 'cjs' ],
    },
    sourcemap: true,
  },
});
