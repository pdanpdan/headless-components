<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import type { HeadingLink } from '#/lib/heading-links';

defineProps<{
  items: HeadingLink[];
}>();

const emit = defineEmits<{
  (e: 'select'): void;
}>();

// The browser matches the active link with :target-current but does not (yet)
// expose it to assistive tech; mirror it as aria-current (see Sara Soueidan's
// article on the WCAG 1.3.1 implication).
const listRef = ref<HTMLUListElement>();
let raf = 0;

function syncAriaCurrent() {
  const list = listRef.value;
  if (!list) {
    return;
  }
  const links = [ ...list.querySelectorAll('a') ];
  const active = links.find((link) => link.matches(':target-current'));
  for (const link of links) {
    if (link === active) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

function onScroll() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(syncAriaCurrent);
}

onMounted(() => {
  syncAriaCurrent();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <ul
    ref="listRef"
    class="toc-list flex flex-col gap-0.5"
  >
    <li
      v-for="item in items"
      :key="item.id"
    >
      <a
        :href="`#${ item.id }`"
        class="block rounded-lg px-3 py-1.5 text-sm text-base-content/70 transition-colors hover:bg-primary/10 hover:text-primary"
        :class="{
          'pl-7': item.level === 3,
          'pl-10': item.level === 4,
        }"
        @click="emit('select')"
      >
        {{ item.text }}
      </a>
    </li>
  </ul>
</template>

<style scoped>
/* CSS-only scrollspy (Sara Soueidan, "CSS-only scrollspy effect using
   scroll-target-group and :target-current"): promoting the anchors to scroll
   markers makes the browser match the link whose target section is in view
   with `:target-current`. Chrome 140+; the links keep working everywhere. */
.toc-list {
  scroll-target-group: auto;
}
.toc-list a:target-current {
  background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}
</style>
