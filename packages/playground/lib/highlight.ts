import type { Highlighter } from 'shiki';
import type { Plugin } from 'vite';

import fs from 'node:fs';
import path from 'node:path';

import { createHighlighter } from 'shiki';

const QUERY = '?highlight';
const THEME = 'github-dark';
// Shiki's Vue grammar only enters template mode inside an SFC block, so a bare
// template fragment is treated as plain text after its first tag.
const VUE_SFC_BLOCK = /^\s*<(?:template|script|style)\b/;
// Virtual ids keep Vite's dependency scanner from trying to read the
// highlighted module from disk (it does not run plugin `load` hooks).
const VIRTUAL_PREFIX = '\0highlight:';
const VIRTUAL_SUFFIX = '.highlight.js';

let highlighterPromise: Promise<Highlighter> | null = null;

async function highlightVue(highlighter: Highlighter, code: string) {
  if (VUE_SFC_BLOCK.test(code)) {
    return highlighter.codeToHtml(code, { lang: 'vue', theme: THEME });
  }

  const wrapped = `<template>\n${ code }${ code.endsWith('\n')
    ? ''
    : '\n' }</template>`;
  const html = highlighter.codeToHtml(wrapped, { lang: 'vue', theme: THEME });
  const lines = html.split('\n');
  const first = lines[ 0 ];
  const last = lines[ lines.length - 1 ];
  const openSpan = '<span class="line">';
  const closeSuffix = '</span></code></pre>';

  // Unexpected renderer output: highlight the fragment as HTML instead of
  // risking a corrupt code block.
  if (!first.includes(openSpan) || !last.endsWith(closeSuffix)) {
    return highlighter.codeToHtml(code, { lang: 'html', theme: THEME });
  }

  // Drop the `<template>` wrapper lines, keeping the rendered fragment.
  return first.slice(0, first.indexOf(openSpan))
    + lines.slice(1, -1).join('\n')
    + last.slice(last.lastIndexOf('</span>') + '</span>'.length);
}

export async function highlight(code: string, lang: string) {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [ THEME ],
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
  return lang === 'vue'
    ? highlightVue(highlighter, code)
    : highlighter.codeToHtml(code, { lang, theme: THEME });
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
