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
    class="
      min-h-screen bg-base-100 text-base-content
      xl:grid xl:grid-cols-[18rem_minmax(0,1fr)]
      2xl:grid-cols-[16rem_minmax(0,1fr)_minmax(18rem,28rem)]
    "
  >
    <aside
      class="
        border-base-300
        max-xl:border-b
        xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-r
      "
    >
      <div class="flex items-center justify-between gap-2 p-4">
        <a :href="normalizeHref('/')" class="flex items-center gap-2 px-2 py-3">
          <span class="text-lg font-bold">Headless Components</span>
        </a>

        <ThemeToggle />
      </div>

      <nav>
        <ul class="menu w-full flex-nowrap gap-1 p-4 pt-0">
          <li>
            <AppLink v-slot="{ active, href }" href="/">
              <a
                :href
                class="docs-menu-focusable py-2 tracking-wider"
                :class="{ 'docs-menu-active': active }"
              >
                Overview
              </a>
            </AppLink>
          </li>

          <li>
            <p
              class="
                menu-title font-semibold tracking-widest
                [font-variant:small-caps]
              "
            >
              Components
            </p>
          </li>

          <li v-for="item in components" :key="item.href">
            <AppLink v-slot="{ active, href }" :href="item.href">
              <a
                :href
                class="docs-menu-focusable py-2 tracking-wider"
                :class="{ 'docs-menu-active': active }"
              >
                {{ item.label }}
              </a>
            </AppLink>
          </li>

          <li>
            <p
              class="
                menu-title font-semibold tracking-widest
                [font-variant:small-caps]
              "
            >
              Links
            </p>
          </li>

          <li>
            <a
              class="docs-menu-focusable py-2 tracking-wider"
              :href="repoUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdiIcon :path="mdiGithub" class="size-5" />
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <main
      ref="mainRef"
      class="mx-auto w-full max-w-6xl px-6 py-10"
    >
      <div
        v-if="tocItems.length > 0"
        class="
          toc-dropdown sticky top-0 z-20 mb-4
          2xl:hidden
        "
      >
        <details
          ref="tocDropdownRef"
          class="
            collapse-arrow collapse rounded-box border border-base-300
            bg-base-200/95 shadow-md backdrop-blur-sm
          "
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

    <aside
      v-if="tocItems.length > 0"
      class="
        hidden border-l border-base-300
        2xl:block
      "
    >
      <!-- The column is always present at 2xl so the grid never shifts when
           the headings are injected after mount. -->
      <div class="2xl:sticky 2xl:top-0 2xl:h-screen">
        <nav
          aria-label="On this page"
          class="flex flex-col flex-nowrap gap-2 p-4"
        >
          <p
            class="
              px-3 text-xs font-semibold tracking-wide text-base-content/50
              uppercase
            "
          >
            On this page
          </p>
          <TocMenu :items="tocItems" />
        </nav>
      </div>
    </aside>
  </div>
</template>

<style scoped>
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
