import type { Config } from 'vike/types';

import vikeVue from 'vike-vue/config';

export default {
  ssr: true,
  prerender: true,
  trailingSlash: true,

  title: 'Headless Components',
  description: 'Headless (unstyled) Vue 3 components, styled with daisyUI 5 / Tailwind 4.',

  extends: [ vikeVue ],
} as Config;
