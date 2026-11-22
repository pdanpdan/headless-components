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

// JS scrollspy: the browser `:target-current` pseudo-class can report the old
// and new targets at the same time right after an anchor click, leaving two
// items highlighted until the next scroll. Computing the active heading from
// positions keeps exactly one link active and also fixes the breadcrumb id.
// The same match drives aria-current, which the CSS pseudo-class does not
// expose to assistive tech.
const listRef = ref<HTMLUListElement>();
let raf = 0;
let lastCurrentId: string | undefined;
const ACTIVE_OFFSET = 120;

function headingElements(): HTMLElement[] {
  return props.items
    .map((item) => document.getElementById(item.id))
    .filter((element): element is HTMLElement => element !== null);
}

function computeActiveId(): string | undefined {
  const headings = headingElements();
  if (headings.length === 0) {
    return undefined;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    return headings.at(-1)?.id;
  }
  let active = headings[ 0 ]?.id;
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top > ACTIVE_OFFSET) {
      break;
    }
    active = heading.id;
  }
  return active;
}

function applyActive(id: string | undefined) {
  const list = listRef.value;
  if (!list) {
    return;
  }
  const visible = list.offsetParent !== null;
  const links = [
    ...list.querySelectorAll('a'),
  ];
  for (const link of links) {
    if (link.getAttribute('href')?.slice(1) === id) {
      link.classList.add('toc-active');
      link.setAttribute('aria-current', 'true');
    } else {
      link.classList.remove('toc-active');
      link.removeAttribute('aria-current');
    }
  }
  if (visible && id !== lastCurrentId) {
    lastCurrentId = id;
    emit('current', id);
  }
}

function syncActive() {
  applyActive(computeActiveId());
}

function onScroll() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(syncActive);
}

function onScrollEnd() {
  cancelAnimationFrame(raf);
  syncActive();
}

function select(id: string) {
  applyActive(id);
  emit('select');
}

onMounted(() => {
  syncActive();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', onScrollEnd, { passive: true });
  window.addEventListener('resize', syncActive);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('scrollend', onScrollEnd);
  window.removeEventListener('resize', syncActive);
  cancelAnimationFrame(raf);
});

watch(
  () => props.items,
  () => {
    syncActive();
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
        @click="select(item.id)"
      >
        {{ item.text }}
      </a>
    </li>
  </ul>
</template>

<style scoped>
.toc-list a.toc-active {
  background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}
</style>
