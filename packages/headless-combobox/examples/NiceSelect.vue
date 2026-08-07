<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref, useId } from 'vue';

interface User {
  id: number;
  name: string;
  role: string;
}

const users = ref<User[]>([
  { id: 1, name: 'Wade Cooper', role: 'Admin' },
  { id: 2, name: 'Arlene Mccoy', role: 'Editor' },
  { id: 3, name: 'Devon Webb', role: 'Viewer' },
  { id: 4, name: 'Tom Cook', role: 'Editor' },
  { id: 5, name: 'Tanya Fox', role: 'Admin' },
  { id: 6, name: 'Hellen Schmidt', role: 'Viewer' },
  { id: 7, name: 'Caroline Schultz', role: 'Admin' },
  { id: 8, name: 'Mason Heaney', role: 'Editor' },
]);

const selected = ref<User | null>(users.value[ 3 ] ?? null);
const labelId = useId();
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, isSelected, canSelectMore,
        cssAnchorName, popupStyle, triggerProps, listboxProps,
        getOptionProps, setContainerRef, setTriggerRef, setDropdownRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="users"
      :display-value="(u: User) => u.name"
      align-selected
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset w-full"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Assign user</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between shadow-sm"
          :style="{ anchorName: cssAnchorName }"
        >
          <span v-if="selected">{{ selected.name }}</span>
          <span v-else class="text-base-content/50">Select a user…</span>
          <svg
            class="h-4 w-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </button>
      </fieldset>

      <ul
        :ref="(el) => { setDropdownRef(el); setListRef(el); }"
        v-bind="listboxProps"
        popover="manual"
        class="cbx-popup menu max-h-60 flex-nowrap gap-0.5 rounded-box bg-base-200 shadow-xl"
        :style="[popupStyle, {
          left: 'calc(anchor(left) - 0.25rem)',
          width: 'calc(anchor-size(width) + 0.5rem)',
        }]"
      >
        <li
          v-for="(user, index) in filteredOptions"
          :key="user.id"
        >
          <button
            :ref="(el) => setOptionRef(user, el)"
            type="button"
            v-bind="getOptionProps(user, index)"
            class="justify-between shadow-none hover:bg-primary/20 hover:text-primary"
            :class="{
              'menu-active': isSelected(user),
              'hover:brightness-95': isSelected(user),
              'menu-focus': index === highlightedIndex,

              'bg-primary/20': index === highlightedIndex,

              'text-primary': index === highlightedIndex,
              'cursor-pointer': canSelectMore || isSelected(user),
            }"
          >
            <span>{{ user.name }}</span>
            <svg
              v-if="isSelected(user)"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </button>
        </li>
      </ul>
    </HeadlessCombobox>
  </div>
</template>

<style scoped>
/* Popup covers the control: zoom + fade via the Popover API.
   `scale` composes with the inline `translate` alignment offset. */
.cbx-popup {
  opacity: 0;
  scale: 0.8;
  transition:
    opacity 0.2s ease,
    scale 0.2s ease,
    overlay 0.2s ease allow-discrete,
    display 0.2s ease allow-discrete;

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    opacity: 1;
    scale: 1;

    @starting-style {
      opacity: 0;
      scale: 0.8;
    }
  }
}
</style>
