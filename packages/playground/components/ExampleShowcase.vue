<script setup lang="ts">
import { computed, ref } from 'vue';

import type { AdapterId } from '#/lib/adapter-examples';

import CodeBlock from '#/components/CodeBlock.vue';
import { ADAPTER_LABELS } from '#/lib/adapter-examples';
import { useAdapterPreference } from '#/lib/adapter-preference';

interface Source {
  raw: string;
  html: string;
}

const props = defineProps<{
  title: string;
  description?: string;
  sources: Record<AdapterId, Source>;
}>();

const tab = ref<'preview' | 'code'>('preview');
const { selectedAdapter, selectAdapter } = useAdapterPreference();

const currentSource = computed(() => props.sources[ selectedAdapter.value ] ?? props.sources.vue);

const language = computed(() => {
  switch (selectedAdapter.value) {
    case 'svelte':
      return 'svelte';
    case 'angular':
      return 'ts';
    case 'vue':
      return 'vue';
    default:
      return 'tsx';
  }
});
</script>

<template>
  <section
    class="card border border-base-content/10 bg-base-content/2 shadow-xs"
  >
    <div class="card-body gap-4">
      <header class="flex flex-col gap-1">
        <h3 class="card-title">{{ title }}</h3>
        <p v-if="description" class="text-base-content/80">{{ description }}</p>
      </header>

      <div
        role="tablist"
        class="
          tabs-box tabs w-fit
          max-xl:tabs-sm
        "
      >
        <button
          type="button"
          role="tab"
          class="tab"
          :aria-selected="tab === 'preview'"
          @click="tab = 'preview'"
        >
          Preview
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :aria-selected="tab === 'code'"
          @click="tab = 'code'"
        >
          Code
        </button>
      </div>

      <div
        v-show="tab === 'preview'"
        class="
          flex min-h-40 items-start justify-center rounded-box border
          border-base-300 bg-base-100 p-8
        "
      >
        <slot />
      </div>

      <div v-show="tab === 'code'" class="flex flex-col gap-3">
        <div
          role="tablist"
          aria-label="Adapter"
          class="
            tabs-border tabs w-fit
            max-xl:tabs-sm
          "
        >
          <button
            v-for="adapter in ADAPTER_LABELS"
            :key="adapter.id"
            type="button"
            role="tab"
            class="tab"
            :aria-selected="selectedAdapter === adapter.id"
            @click="selectAdapter(adapter.id)"
          >
            {{ adapter.label }}
          </button>
        </div>

        <p class="text-xs text-base-content/60">
          The live preview always runs the Vue adapter. The code shows the same
          example wired for {{ ADAPTER_LABELS.find((adapter) => adapter.id === selectedAdapter)?.label }}.
        </p>

        <CodeBlock
          :code="currentSource.html"
          :raw="currentSource.raw"
          :lang="language"
        />
      </div>
    </div>
  </section>
</template>
