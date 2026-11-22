import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

import { createHighlighter } from 'shiki';

const QUERY = '?highlight';
// Virtual ids keep Vite's dependency scanner from trying to read the
// highlighted module from disk (it does not run plugin `load` hooks).
const VIRTUAL_PREFIX = '\0highlight:';
const VIRTUAL_SUFFIX = '.highlight.js';

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

export async function highlight(code: string, lang: string) {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [ 'github-dark' ],
      langs: [
        'vue',
        'bash',
        'ts',
        'tsx',
        'js',
        'css',
        'svelte',
        'html',
      ],
    });
  }

  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark',
  });
}

/**
 * Import any source file with a `?highlight` query to get its raw text and a
 * shiki-highlighted HTML string:
 *
 * ```ts
 * import { raw, html } from '@pdanpdan/headless-combobox-vue/examples/BasicComboBox.vue?highlight';
 * ```
 *
 * Resolves both relative imports and bare package specifiers (so example files
 * living inside component packages can be highlighted).
 */
export function highlightPlugin(): Plugin {
  return {
    name: 'vite-plugin-highlight',
    enforce: 'pre',

    async resolveId(id, importer) {
      if (!id.includes(QUERY)) {
        return null;
      }

      const [ base ] = id.split(QUERY);

      const resolved = await this.resolve(base, importer, { skipSelf: true });
      if (resolved && !resolved.external) {
        return VIRTUAL_PREFIX + resolved.id + VIRTUAL_SUFFIX;
      }

      if (importer) {
        const cleanImporter = importer
          .replace(/^virtual-module:/, '')
          .replace(/\?.*$/, '');
        return VIRTUAL_PREFIX + path.resolve(path.dirname(cleanImporter), base) + VIRTUAL_SUFFIX;
      }

      return null;
    },

    async load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) {
        return null;
      }

      const filePath = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
      const code = fs.readFileSync(filePath, 'utf-8');
      const lang = filePath.split('.').pop() || 'vue';
      const html = await highlight(code, lang);

      return [
        `export const raw = ${ JSON.stringify(code) };`,
        `export const html = ${ JSON.stringify(html) };`,
        `export default { raw, html };`,
      ].join('\n');
    },
  };
}
