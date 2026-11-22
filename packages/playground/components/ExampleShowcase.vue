<script setup lang="ts">
import { computed, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';

interface Source {
  raw: string;
  html: string;
}

const props = defineProps<{
  title: string;
  description?: string;
  source: Source;
  lang?: string;
  preview?: boolean;
}>();

const tab = ref<'preview' | 'code'>(props.preview ? 'preview' : 'code');
const codeLang = computed(() => props.lang ?? 'vue');
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
        v-if="preview"
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
        v-if="preview"
        v-show="tab === 'preview'"
        class="
          flex min-h-40 items-start justify-center rounded-box border
          border-base-300 bg-base-100 p-8
        "
      >
        <slot />
      </div>

      <div v-show="tab === 'code'" class="flex flex-col gap-3">
        <CodeBlock
          :code="source.html"
          :raw="source.raw"
          :lang="codeLang"
        />
      </div>
    </div>
  </section>
</template>
