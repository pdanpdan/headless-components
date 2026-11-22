<script setup lang="ts">
interface Row {
  name: string;
  type?: string;
  default?: string;
  description: string;
}

withDefaults(defineProps<{
  rows: Row[];
  showDefault?: boolean;
}>(), {
  showDefault: false,
});

function formatDescription(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/`([^`]+)`/g, '<code class="rounded-sm bg-base-200 px-1 py-0.5 font-mono text-xs">$1</code>');
}
</script>

<template>
  <div class="overflow-x-auto">
    <table
      class="
        table
        max-xl:table-sm
      "
    >
      <colgroup>
        <col width="5%" />
        <col width="25%" />
        <col v-if="showDefault" width="10%" />
        <col width="50%" />
      </colgroup>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th v-if="showDefault">Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <td class="font-mono font-semibold">{{ row.name }}</td>
          <td class="font-mono text-base-content/80">{{ row.type }}</td>
          <td v-if="showDefault" class="font-mono">{{ row.default }}</td>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <td class="min-w-48" v-html="formatDescription(row.description)" />
        </tr>
      </tbody>
    </table>
  </div>
</template>
