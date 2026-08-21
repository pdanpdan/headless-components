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
          <td class="font-mono font-semibold whitespace-nowrap">{{ row.name }}</td>
          <td class="font-mono text-base-content/80">{{ row.type }}</td>
          <td v-if="showDefault" class="font-mono">{{ row.default }}</td>
          <td class="min-w-48">{{ row.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
