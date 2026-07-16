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
</script>

<template>
  <div class="overflow-x-auto">
    <table class="table table-sm">
      <colgroup>
        <col width="10%" />
        <col width="20%" />
        <col v-if="showDefault" width="10%" />
        <col width="60%" />
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
          <td class="font-mono text-sm font-medium whitespace-nowrap">{{ row.name }}</td>
          <td class="font-mono text-xs text-base-content/70">{{ row.type }}</td>
          <td v-if="showDefault" class="font-mono text-xs">{{ row.default }}</td>
          <td class="text-sm">{{ row.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
