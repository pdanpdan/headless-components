<script setup lang="ts">
import { normalizeHref } from '#/lib/url';

const themeUrl = normalizeHref('theme.js');
const faviconLightUrl = normalizeHref('favicon-light.svg');
const faviconDarkUrl = normalizeHref('favicon-dark.svg');
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#fcfdf9" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#111511" media="(prefers-color-scheme: dark)" />
  <link
    rel="icon"
    type="image/svg+xml"
    :href="faviconLightUrl"
    media="(prefers-color-scheme: light)"
  />
  <link
    rel="icon"
    type="image/svg+xml"
    :href="faviconDarkUrl"
    media="(prefers-color-scheme: dark)"
  />
  <script :src="themeUrl" />
</template>
