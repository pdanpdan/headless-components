import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.app.json'),
      entryRoot: resolve(import.meta.dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'HeadlessCombobox',
      fileName: (format) => `index.${ format === 'es' ? 'mjs' : 'cjs' }`,
      formats: [ 'es', 'cjs' ],
    },
    rollupOptions: {
      external: [ 'vue' ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
  },
});
