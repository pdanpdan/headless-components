<script setup lang="ts">
import { mdiGithub, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
import { onMounted, ref } from 'vue';

import AppLink from '#/components/AppLink.vue';
import MdiIcon from '#/components/MdiIcon.vue';
import { normalizeHref } from '#/lib/url';

import '#/assets/style.css';

const repoUrl = 'https://github.com/pdanpdan/headless-components';

const components = [
  { href: '/combobox', label: 'HeadlessCombobox' },
];

const theme = ref<'light' | 'dark' | null>(null);

function toggleTheme() {
  if (theme.value == null) {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
  } else {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme.value);
  window.localStorage.setItem('theme', theme.value);
}

onMounted(() => {
  const savedTheme = window.localStorage.getItem('theme');
  theme.value = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});
</script>

<template>
  <div class="min-h-screen bg-base-100 text-base-content lg:grid lg:grid-cols-[16rem_1fr]">
    <aside class="border-b border-base-300 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
      <div class="flex items-center justify-between gap-2 p-4">
        <a :href="normalizeHref('/')" class="flex items-center gap-2 px-2 py-3">
          <span class="text-lg font-bold">Headless Components</span>
        </a>

        <label class="swap swap-rotate" title="Toggle light/dark theme">
          <input
            type="checkbox"
            value="dark"
            class="theme-controller"
            :checked="theme === 'dark'"
            aria-label="Toggle light/dark theme"
            @change="toggleTheme"
          />
          <MdiIcon :path="mdiWhiteBalanceSunny" class="swap-off size-5" />
          <MdiIcon :path="mdiWeatherNight" class="swap-on size-5" />
        </label>
      </div>

      <nav class="flex flex-col gap-1 p-4 pt-0">
        <AppLink href="/">Overview</AppLink>

        <p class="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
          Components
        </p>
        <AppLink
          v-for="item in components"
          :key="item.href"
          :href="item.href"
        >
          {{ item.label }}
        </AppLink>

        <p class="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
          Links
        </p>
        <a
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <MdiIcon :path="mdiGithub" class="size-5" />
          GitHub
        </a>
      </nav>
    </aside>

    <main class="mx-auto w-full max-w-4xl px-6 py-10">
      <slot />
    </main>
  </div>
</template>
