<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref } from 'vue';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

const selected = ref<User | null>(null);

const {
  isOpen,
  filteredOptions,
  comboboxInputProps,
  listboxProps,
  getOptionProps,
  setContainerRef,
} = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options: users,
    optionLabel: (user: User) => user.name,
  },
  (value) => {
    selected.value = value as User | null;
  },
);
</script>

<template>
  <div :ref="setContainerRef">
    <input
      v-bind="comboboxInputProps"
      aria-label="Search users"
      type="text"
    />
    <ul
      v-if="isOpen"
      v-bind="listboxProps"
    >
      <li
        v-for="(user, index) in filteredOptions"
        :key="user.id"
      >
        <button
          type="button"
          v-bind="getOptionProps(user, index)"
        >
          {{ user.name }}
        </button>
      </li>
    </ul>
  </div>
</template>
