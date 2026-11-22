<script setup lang="ts">
import { normalizeHref } from '#/lib/url';
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-3">
      <h1 class="text-3xl font-bold">Headless Components</h1>
      <p class="max-w-3xl text-base-content/70">
        Framework-independent state machines for Vue, React, Svelte, Solid, and
        Angular. Packages ship without styles, so the markup and accessibility
        attributes stay under your control.
      </p>
    </header>

    <div
      class="
        grid gap-4
        sm:grid-cols-2
      "
    >
      <a
        :href="normalizeHref('/combobox')"
        class="
          card border border-base-content/10 bg-base-200
          hover:bg-base-300
        "
      >
        <div class="card-body">
          <h2 class="card-title" data-skip-toc>HeadlessCombobox</h2>
          <p class="text-base-content/80">
            Accessible combobox with filtering, keyboard navigation, validation,
            and single or multiple selection.
          </p>
        </div>
      </a>
    </div>
  </div>
</template>
