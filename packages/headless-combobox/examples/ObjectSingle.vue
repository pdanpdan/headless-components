<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Object options · single · with filter';
export const description = 'Object options with a custom layout and a searchable input.';
</script>

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

const selected = ref<User | null>(users.value[ 1 ] ?? null);
const labelId = useId();
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, searchQuery,
        isSelected, canSelectMore, cssAnchorName, triggerProps, inputProps,
        listboxProps, getOptionProps, setContainerRef, setTriggerRef, setDropdownRef, setInputRef,
        setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="users"
      :option-label="(u: User) => u.name"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset w-full"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Assign user (single, with filter)</legend>
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

      <div
        :ref="setDropdownRef"
        popover="manual"
        class="cbx-popup rounded-box bg-base-200 shadow-xl"
        :style="{
          positionAnchor: cssAnchorName,
          top: 'calc(anchor(bottom) + 0.375rem)',
          left: 'calc(anchor(left) - 0.25rem)',
          width: 'calc(anchor-size(width) + 0.5rem)',
        }"
      >
        <div class="border-b border-base-content/10 p-2">
          <input
            :ref="setInputRef"
            v-bind="inputProps"
            :value="searchQuery"
            type="text"
            class="input input-sm w-full"
            placeholder="Search users…"
            aria-label="Search users"
          />
        </div>

        <ul
          :ref="setListRef"
          v-bind="listboxProps"
          class="menu max-h-60 w-full flex-nowrap gap-0.5 overflow-y-auto"
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
              <span class="flex flex-col items-start gap-0.5">
                <span>{{ user.name }}</span>
                <span class="text-xs opacity-60">{{ user.role }}</span>
              </span>
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

          <li
            v-if="filteredOptions.length === 0"
            class="pointer-events-none p-4 text-center text-sm text-base-content/50"
            role="presentation"
          >
            No users found.
          </li>
        </ul>
      </div>
    </HeadlessCombobox>
  </div>
</template>

<style scoped>
/* Popup opens below the control: slide + fade via the Popover API. */
.cbx-popup {
  inset: auto;
  position-try: flip-block;
  opacity: 0;
  translate: 0 -0.375rem;
  transition:
    opacity 0.15s ease,
    translate 0.15s ease,
    overlay 0.15s ease allow-discrete,
    display 0.15s ease allow-discrete;

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    opacity: 1;
    translate: 0 0;

    @starting-style {
      opacity: 0;
      translate: 0 -0.375rem;
    }
  }
}
</style>
