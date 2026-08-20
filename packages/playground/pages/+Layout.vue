<script setup lang="ts">
import { mdiGithub } from '@mdi/js';
import { onMounted, onUnmounted, ref } from 'vue';

import type { HeadingLink } from '#/lib/heading-links';

import AppLink from '#/components/AppLink.vue';
import MdiIcon from '#/components/MdiIcon.vue';
import ThemeToggle from '#/components/ThemeToggle.vue';
import TocMenu from '#/components/TocMenu.vue';
import { injectHeadingLinks } from '#/lib/heading-links';
import { normalizeHref } from '#/lib/url';

import '#/assets/style.css';

const repoUrl = 'https://github.com/pdanpdan/headless-components';

const components = [
  { href: '/combobox', label: 'HeadlessCombobox' },
];

const mainRef = ref<HTMLElement>();
const tocDropdownRef = ref<HTMLDetailsElement>();
const tocItems = ref<HeadingLink[]>([]);
let headingsObserver: MutationObserver | undefined;

function closeTocDropdown() {
  if (tocDropdownRef.value) {
    tocDropdownRef.value.open = false;
  }
}

function refreshHeadings() {
  const main = mainRef.value;
  if (!main) {
    return;
  }
  tocItems.value = injectHeadingLinks(main);
}

onMounted(() => {
  refreshHeadings();
  // SPA navigation and interactive re-renders swap main's content; re-inject
  // headings and rebuild the table of contents (idempotent).
  headingsObserver = new MutationObserver(refreshHeadings);
  headingsObserver.observe(mainRef.value as HTMLElement, { childList: true, subtree: true });
});

onUnmounted(() => {
  headingsObserver?.disconnect();
});
</script>

<template>
  <div
    class="min-h-screen bg-base-100 text-base-content xl:grid xl:grid-cols-[16rem_minmax(0,1fr)] 2xl:grid-cols-[16rem_minmax(0,1fr)_minmax(16rem,28rem)]"
  >
    <aside class="border-b border-base-300 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-r xl:border-b-0">
      <div class="flex items-center justify-between gap-2 p-4">
        <a :href="normalizeHref('/')" class="flex items-center gap-2 px-2 py-3">
          <span class="text-lg font-bold">Headless Components</span>
        </a>

        <ThemeToggle />
      </div>

      <nav class="flex flex-col gap-1 p-4 pt-0">
        <AppLink href="/">Overview</AppLink>

        <p class="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
          Components
        </p>
        <AppLink
          v-for="item in components"
          :key="item.href"
          :href="item.href"
        >
          {{ item.label }}
        </AppLink>

        <p class="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
          Links
        </p>
        <a
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <MdiIcon :path="mdiGithub" class="size-5" />
          GitHub
        </a>
      </nav>
    </aside>

    <main
      ref="mainRef"
      class="mx-auto w-full max-w-6xl px-6 py-10"
    >
      <div
        v-if="tocItems.length > 0"
        class="toc-dropdown sticky top-0 z-20 mb-4 2xl:hidden"
      >
        <details
          ref="tocDropdownRef"
          class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100/95 shadow-sm backdrop-blur"
        >
          <summary class="collapse-title text-sm font-semibold">
            On this page
          </summary>
          <div class="collapse-content">
            <nav aria-label="On this page">
              <TocMenu
                :items="tocItems"
                @select="closeTocDropdown"
              />
            </nav>
          </div>
        </details>
      </div>

      <slot />
    </main>

    <aside class="hidden border-l border-base-300 2xl:block">
      <!-- The column is always present at 2xl so the grid never shifts when
           the headings are injected after mount. -->
      <div v-if="tocItems.length > 0" class="2xl:sticky 2xl:top-0 2xl:h-screen">
        <nav
          aria-label="On this page"
          class="flex flex-col gap-2 p-4"
        >
          <p class="px-3 text-xs font-semibold tracking-wide text-base-content/50 uppercase">
            On this page
          </p>
          <TocMenu :items="tocItems" />
        </nav>
      </div>
    </aside>
  </div>
</template>

<style>
/* Square the dropdown's top corners while it is pinned to the scrollport top.
   The sticky wrapper is the scroll-state container; the query styles its
   child (Chrome 133+ — rounded elsewhere). */
.toc-dropdown {
  container-type: scroll-state;

  > .collapse {
    @media (prefers-reduced-motion: no-preference) {
      transition: border-radius 0.2s ease;
    }

    @container scroll-state(stuck: top) {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
</style>
