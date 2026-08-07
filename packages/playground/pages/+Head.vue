<script setup lang="ts">
import { normalizeHref } from '#/lib/url';

const themeUrl = normalizeHref('theme.js');
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#fcfdf9" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#111511" media="(prefers-color-scheme: dark)" />
  <script :src="themeUrl" />
</template>
