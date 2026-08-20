<script setup lang="ts">
import { normalizeHref } from '#/lib/url';

const components = [
  {
    href: '/combobox',
    name: 'HeadlessCombobox',
    description: 'Accessible, renderless combobox with filtering and keyboard navigation.',
  },
];
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-3">
      <h1 class="text-3xl font-bold">Headless Components</h1>
      <p class="max-w-2xl text-base-content/70">A collection of headless (unstyled) Vue 3 components. Each component ships zero styles and exposes state, actions, and ARIA attributes through scoped slots &mdash; style them with daisyUI 5 / Tailwind 4, or any CSS you like.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <a
        v-for="c in components"
        :key="c.href"
        :href="normalizeHref(c.href)"
        class="card border border-base-content/10 bg-base-content/2 transition-shadow hover:bg-base-content/3 hover:shadow-md"
      >
        <div class="card-body">
          <h2 class="card-title">{{ c.name }}</h2>
          <p class="text-sm text-base-content/70">{{ c.description }}</p>
        </div>
      </a>
    </div>
  </div>
</template>
