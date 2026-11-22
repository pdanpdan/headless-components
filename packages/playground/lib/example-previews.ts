import type { Component } from 'vue';

const modules = import.meta.glob<{ default: Component; }>(
  '../../headless-combobox-vue/examples/*.vue',
  { eager: true },
);

/** Vue implementations used as the live preview on every framework page. */
export const examplePreviews = Object.fromEntries(
  Object.entries(modules).map(([ path, module ]) => [
    path.split('/').pop()!.replace('.vue', ''),
    module.default,
  ]),
);
