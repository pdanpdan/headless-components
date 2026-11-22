import type { Config } from 'vike/types';

import vikeVue from 'vike-vue/config';

export default {
  ssr: true,
  prerender: true,
  trailingSlash: true,

  title: 'Headless Components',
  description: 'Framework-independent headless components with adapters for Vue, React, Svelte, Solid, and Angular.',

  extends: [ vikeVue ],
} as Config;
