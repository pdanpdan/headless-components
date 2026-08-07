<script setup lang="ts">
import { usePageContext } from 'vike-vue/usePageContext';
import { computed } from 'vue';

import { matchHref, normalizeHref } from '#/lib/url';

const props = defineProps<{
  href: string;
}>();

const pageContext = usePageContext();

const normalizedHref = computed(() => normalizeHref(props.href));

const active = computed(() => matchHref(props.href, pageContext.urlPathname));
</script>

<template>
  <a
    :href="normalizedHref"
    class="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    :class="active ? 'bg-primary text-primary-content' : 'hover:bg-primary/10 hover:text-primary'"
  >
    <slot />
  </a>
</template>
