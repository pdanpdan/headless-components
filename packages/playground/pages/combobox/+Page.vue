<script setup lang="ts">
import { ADAPTER_DOCS } from '#/lib/adapter-docs';
import { normalizeHref } from '#/lib/url';

const adapters = Object.values(ADAPTER_DOCS);
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex max-w-3xl flex-col gap-3">
      <h1 class="text-3xl font-bold">Combobox</h1>
      <p class="text-base-content/80">
        The combobox core is shared by the Vue, React, Svelte, Solid, and
        Angular packages. It handles selection, filtering, validation, keyboard
        navigation, and focus. Each adapter translates the core snapshot into
        its framework's state model and leaves the markup to you.
      </p>
      <p class="text-base-content/80">
        Every package ships without styles. Use daisyUI, Tailwind, or your own
        CSS. Start with the core if you are writing an adapter, or open your
        framework below for install steps, examples, and the API it exposes.
      </p>
    </header>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Packages</h2>
      <div
        class="
          grid gap-4
          sm:grid-cols-2
        "
      >
        <a
          :href="normalizeHref('/combobox/core')"
          class="
            card border border-base-content/10 bg-base-200
            hover:bg-base-300
          "
        >
          <div class="card-body">
            <h3 class="card-title">Core</h3>
            <p class="text-sm text-base-content/80">
              Framework-independent state machine. Use it directly to build an
              adapter.
            </p>
            <code class="text-xs text-base-content/60">@pdanpdan/headless-combobox-core</code>
          </div>
        </a>

        <a
          v-for="adapter in adapters"
          :key="adapter.id"
          :href="normalizeHref(`/combobox/${ adapter.id }`)"
          class="
            card border border-base-content/10 bg-base-200
            hover:bg-base-300
          "
        >
          <div class="card-body">
            <h3 class="card-title">{{ adapter.label }}</h3>
            <p class="text-sm text-base-content/80">{{ adapter.summary }}</p>
            <code class="text-xs text-base-content/60">{{ adapter.packageName }}</code>
          </div>
        </a>
      </div>
    </section>

    <section class="flex max-w-3xl flex-col gap-3">
      <h2 class="text-xl font-semibold">Shared behavior</h2>
      <p class="text-sm text-base-content/80">
        The adapters run the same core tests. Selection, filtering, min/max
        validation, keyboard navigation, tab selection, and programmatic
        control behave the same in each framework. Only the binding syntax
        changes.
      </p>
      <p class="text-sm text-base-content/80">
        The examples cover text and object options, internal and controlled
        state, removable chips, validation, select-on-tab, typeahead, and
        programmatic control. See
        <a :href="normalizeHref('/combobox/styling')" class="link link-primary">Styling</a>
        for popup positioning and CSS state hooks.
      </p>
    </section>
  </div>
</template>
