import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
      entryRoot: resolve(__dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
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
