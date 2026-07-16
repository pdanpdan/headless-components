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
  <div class="code-block relative overflow-hidden rounded-box text-sm">
    <CopyButton
      :text="raw"
      class="btn-neutral absolute top-2 right-4 z-10"
    />

    <div class="max-h-[80vh] overflow-auto">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="shiki-container" v-html="code" />
    </div>
  </div>
</template>

<style scoped>
.code-block {
  background-color: #0d1117;

  :deep(pre.shiki) {
    margin: 0;
    padding: 1rem 1.25rem;
    background-color: transparent !important;
    line-height: 1.5;
  }
}
</style>
