import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

import { createHighlighter } from 'shiki';

const SUFFIX = '.highlight.js';

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

export async function highlight(code: string, lang: string) {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [ 'github-dark' ],
      langs: [ 'vue', 'bash', 'ts', 'js', 'css' ],
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
 * import { raw, html } from '@pdanpdan/headless-combobox/examples/BasicComboBox.vue?highlight';
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
      if (!id.includes('?highlight')) {
        return null;
      }

      const [ base ] = id.split('?highlight');

      const resolved = await this.resolve(base, importer, { skipSelf: true });
      if (resolved) {
        return resolved.id + SUFFIX;
      }

      if (importer) {
        return path.resolve(path.dirname(importer), base) + SUFFIX;
      }

      return null;
    },

    async load(id) {
      if (!id.endsWith(SUFFIX)) {
        return null;
      }

      const filePath = id.slice(0, -SUFFIX.length);
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
