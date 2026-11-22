import type { Plugin } from 'vite';

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';
import { defineConfig } from 'vite';

import { adapterSources, EXAMPLE_META } from './lib/adapter-examples.js';
import { highlight, highlightPlugin } from './lib/highlight.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

const ADAPTER_EXAMPLES_ID = 'virtual:adapter-examples';

/**
 * Vue examples are highlighted from disk. The other adapters are generated
 * from the same scenario flags and highlighted once at build time.
 */
function adapterExamplesPlugin(): Plugin {
  return {
    name: 'adapter-examples',
    resolveId(id) {
      return id === ADAPTER_EXAMPLES_ID
        ? `\0${ ADAPTER_EXAMPLES_ID }`
        : null;
    },
    async load(id) {
      if (id !== `\0${ ADAPTER_EXAMPLES_ID }`) {
        return null;
      }
      const examples: Record<string, Record<string, { raw: string; html: string; }>> = {};
      for (const name of Object.keys(EXAMPLE_META)) {
        const vuePath = resolve(currentDir, '../headless-combobox-vue/examples', `${ name }.vue`);
        const vueRaw = readFileSync(vuePath, 'utf8');
        const sources: Record<string, { raw: string; html: string; }> = {
          vue: { raw: vueRaw, html: await highlight(vueRaw, 'vue') },
        };
        for (const [ adapter, raw ] of Object.entries(adapterSources(name))) {
          const lang = adapter === 'svelte'
            ? 'svelte'
            : adapter === 'angular'
              ? 'ts'
              : 'tsx';
          sources[ adapter ] = { raw, html: await highlight(raw, lang) };
        }
        examples[ name ] = sources;
      }
      return `export default ${ JSON.stringify(examples) };`;
    },
  };
}

export default defineConfig({
  base: '/headless-components/',
  plugins: [
    highlightPlugin(),
    adapterExamplesPlugin(),
    vike(),
    vue({
      include: [ /\.vue$/ ],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: /^#\/(.*)$/, replacement: `${ resolve(currentDir) }/$1` },
      {
        find: /^@pdanpdan\/headless-combobox$/,
        replacement: resolve(currentDir, '../headless-combobox-vue/src/index.ts'),
      },
    ],
  },
  server: {
    fs: {
      allow: [ '../..' ],
    },
  },
});
