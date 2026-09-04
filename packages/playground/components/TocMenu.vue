<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

import type { HeadingLink } from '#/lib/heading-links';

const props = defineProps<{
  items: HeadingLink[];
}>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'current', id?: string): void;
}>();

// The browser matches the active link with :target-current but does not (yet)
// expose it to assistive tech; mirror it as aria-current (see Sara Soueidan's
// article on the WCAG 1.3.1 implication). The same match also reports the
// current heading id to the layout, which renders it as breadcrumbs in the
// collapsed dropdown. Only the displayed menu reports (dropdown and rail are
// never visible together), keeping a single source for the id. A collapsed
// <details> keeps its layout, so the dropdown keeps matching while closed.
const listRef = ref<HTMLUListElement>();
let raf = 0;
let lastCurrentId: string | undefined;

function syncAriaCurrent() {
  const list = listRef.value;
  if (!list) {
    return;
  }
  const visible = list.offsetParent !== null;
  const links = [ ...list.querySelectorAll('a') ];
  const active = visible ? links.find((link) => link.matches(':target-current')) : undefined;
  const currentId = active?.getAttribute('href')?.slice(1);
  for (const link of links) {
    if (link === active) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  }
  if (visible && currentId !== lastCurrentId) {
    lastCurrentId = currentId;
    emit('current', currentId);
  }
}

function onScroll() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(syncAriaCurrent);
}

// Chrome finalizes the scroll-target currentness after momentum/anchor
// scrolling settles (scrollend), so re-sync once movement stops.
function onScrollEnd() {
  cancelAnimationFrame(raf);
  syncAriaCurrent();
}

onMounted(() => {
  syncAriaCurrent();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', onScrollEnd, { passive: true });
  window.addEventListener('resize', syncAriaCurrent);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('scrollend', onScrollEnd);
  window.removeEventListener('resize', syncAriaCurrent);
  cancelAnimationFrame(raf);
});

watch(
  () => props.items,
  () => {
    syncAriaCurrent();
  },
  { flush: 'post' },
);
</script>

<template>
  <ul
    ref="listRef"
    class="toc-list menu w-full flex-nowrap"
  >
    <li
      v-for="item in items"
      :key="item.id"
    >
      <a
        :href="`#${ item.id }`"
        class="docs-menu-focusable text-base-content/90"
        :class="{
          'ps-7': item.level === 3,
          'ps-10': item.level === 4,
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
