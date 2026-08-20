<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox';
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
  select,
  setContainerRef,
  setTriggerRef,
  setInputRef,
  setDropdownRef,
  setListRef,
  setOptionRef,
} = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options: users,
    displayValue: (user: User) => user.name,
  },
  (value) => {
    selected.value = value as User | null;
  },
);
</script>

<template>
  <div :ref="setContainerRef">
    <input
      :ref="(el) => { setTriggerRef(el); setInputRef(el); }"
      v-bind="comboboxInputProps"
      aria-label="Search users"
      type="text"
    />
    <ul
      v-if="isOpen"
      :ref="(el) => { setDropdownRef(el); setListRef(el); }"
      v-bind="listboxProps"
    >
      <li
        v-for="(user, index) in filteredOptions"
        :key="user.id"
      >
        <button
          :ref="(el) => setOptionRef(user, el)"
          type="button"
          v-bind="getOptionProps(user, index)"
          @click="select(user)"
        >
          {{ user.name }}
        </button>
      </li>
    </ul>
  </div>
</template>
