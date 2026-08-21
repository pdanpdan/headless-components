<script setup lang="ts">
import { ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';

interface Source {
  raw: string;
  html: string;
}

defineProps<{
  title: string;
  description?: string;
  source: Source;
  lang?: string;
}>();

const tab = ref<'preview' | 'code'>('preview');
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
          tabs tabs-box w-fit
          max-xl:tabs-sm
        "
      >
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ 'tab-active': tab === 'preview' }"
          @click="tab = 'preview'"
        >
          Preview
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ 'tab-active': tab === 'code' }"
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

      <CodeBlock v-show="tab === 'code'" :code="source.html" :raw="source.raw" :lang="lang" />
    </div>
  </section>
</template>
