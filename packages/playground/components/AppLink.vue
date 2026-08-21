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
  <slot :href="normalizedHref" :active />
</template>
