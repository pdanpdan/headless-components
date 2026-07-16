<script setup lang="ts">
import AppLink from '#/components/AppLink.vue';
import { normalizeHref } from '#/lib/url';

import '#/assets/style.css';

const components = [
  { href: '/combobox', label: 'HeadlessCombobox' },
];
</script>

<template>
  <div class="min-h-screen bg-base-100 text-base-content lg:grid lg:grid-cols-[16rem_1fr]">
    <aside class="border-b border-base-300 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
      <div class="p-4">
        <a :href="normalizeHref('/')" class="flex items-center gap-2 px-2 py-3">
          <span class="text-lg font-bold">Headless Components</span>
        </a>

        <nav class="mt-4 flex flex-col gap-1">
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
        </nav>
      </div>
    </aside>

    <main class="mx-auto w-full max-w-4xl px-6 py-10">
      <slot />
    </main>
  </div>
</template>
