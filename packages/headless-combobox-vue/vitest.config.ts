import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@pdanpdan/headless-combobox-core': resolve(import.meta.dirname, '../headless-combobox-core/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: [ 'text', 'json', 'html' ],
      include: [ 'src/**' ],
      exclude: [
        'src/index.ts',
        'src/**/*.test.ts',
        'src/**/*.d.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
