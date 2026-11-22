<script setup lang="ts">
import { examplePreviews } from '#/lib/example-previews';

import FrameworkDocs from '../FrameworkDocs.vue';
</script>

<template>
  <FrameworkDocs adapter="solid" :previews="examplePreviews" />
</template>
