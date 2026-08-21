<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  text: string;
}>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    // Clipboard API unavailable (e.g. insecure context) — ignore.
  }
}
</script>

<template>
  <button
    type="button"
    class="tooltip btn tooltip-left btn-square btn-xs"
    :data-tip="copied ? 'Copied!' : 'Copy'"
    aria-label="Copy to clipboard"
    @click="copy"
  >
    <svg
      v-if="copied"
      xmlns="http://www.w3.org/2000/svg"
      class="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.7"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m11.25 0h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5" />
    </svg>
  </button>
</template>
