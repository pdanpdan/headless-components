<script setup lang="ts">
import CopyButton from '#/components/CopyButton.vue';

withDefaults(defineProps<{
  code?: string;
  raw?: string;
  lang?: string;
}>(), {
  code: '',
  raw: '',
  lang: 'vue',
});
</script>

<template>
  <div
    class="
      code-block relative overflow-hidden rounded-box bg-neutral text-sm
      text-neutral-content
    "
  >
    <CopyButton
      :text="raw"
      class="absolute top-3.5 right-4 z-10 outline-neutral-content btn-neutral"
    />

    <div class="max-h-[60vh] overflow-auto">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="shiki-container" v-html="code" />
    </div>
  </div>
</template>

<style scoped>
.code-block {
  :deep(pre.shiki) {
    margin: 0;
    padding: 1rem 1.25rem;
    background-color: transparent !important;
    line-height: 1.5;
  }

  /* The code block is dark; a visible focus ring for the focusable pre. */
  &:has(pre.shiki:focus-visible) {
    outline: 2px solid var(--color-neutral-content);
    outline-offset: -4px;
  }
}
</style>
