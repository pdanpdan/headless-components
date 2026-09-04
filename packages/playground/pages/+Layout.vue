<script setup lang="ts">
import { mdiGithub } from '@mdi/js';
import { computed, onMounted, onUnmounted, ref } from 'vue';

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
const tocActiveId = ref<string>();
let headingsObserver: MutationObserver | undefined;

function closeTocDropdown() {
  if (tocDropdownRef.value) {
    tocDropdownRef.value.open = false;
  }
}

function onTocCurrent(currentId: string | undefined) {
  tocActiveId.value = currentId;
}

/** Trail of the current section for the collapsed dropdown summary: the h2
 * chapter, then the section itself (h2, or the h3 under its chapter). */
const tocBreadcrumb = computed<HeadingLink[]>(() => {
  const items = tocItems.value;
  const activeId = tocActiveId.value;
  if (!activeId) {
    return [];
  }
  const activeIndex = items.findIndex((item) => item.id === activeId);
  if (activeIndex === -1) {
    return [];
  }
  const active = items[ activeIndex ]!;
  if (active.level === 2) {
    return [ active ];
  }
  for (let index = activeIndex - 1; index >= 0; index -= 1) {
    const item = items[ index ]!;
    if (item.level === 2) {
      return [ item, active ];
    }
  }
  return [ active ];
});

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
          <summary class="collapse-title min-h-0 px-4 py-2 pe-12">
            <!-- Collapsed, the summary keeps the reading position visible:
                 the current section as a breadcrumb trail under a fixed
                 label, with each ancestor linking back to its heading. -->
            <div
              class="
                breadcrumbs min-w-0 overflow-x-auto text-xs
                md:text-sm
              "
            >
              <ul class="flex-nowrap items-center">
                <li>
                  <span
                    class="font-semibold whitespace-nowrap text-base-content/70"
                  >On this page</span>
                </li>
                <li v-for="(crumb, index) in tocBreadcrumb" :key="crumb.id">
                  <a
                    v-if="index < tocBreadcrumb.length - 1"
                    :href="`#${ crumb.id }`"
                    class="link font-medium whitespace-nowrap link-primary"
                    :title="crumb.text"
                    @click="closeTocDropdown()"
                  >{{ crumb.text }}</a>
                  <span
                    v-else
                    class="font-semibold whitespace-nowrap text-base-content"
                    aria-current="page"
                  >{{ crumb.text }}</span>
                </li>
              </ul>
            </div>
          </summary>
          <div class="collapse-content">
            <nav aria-label="On this page">
              <TocMenu
                :items="tocItems"
                @current="onTocCurrent"
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
          <TocMenu
            :items="tocItems"
            @current="onTocCurrent"
          />
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
