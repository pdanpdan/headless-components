<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Select alignment';
export const description = 'No search input; the dropdown aligns so the selected option overlays the trigger.';
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

const selected = ref<User | null>(users.value[ 3 ] ?? null);
const labelId = useId();
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, isSelected,
        cssAnchorName, popupStyle, triggerProps, listboxProps,
        getOptionProps, setContainerRef, setTriggerRef, setDropdownRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="users"
      :option-label="(u: User) => u.name"
      align-selected
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Assign user</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/70': selected == null }">{{ selected?.name ?? 'Select a user…' }}</span>
          <svg
            class="size-4 opacity-70"
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
        class="
          cbx-popup menu max-h-60 flex-nowrap gap-0.5 rounded-box border
          border-base-content/5 bg-base-200 shadow-xl
        "
        :style="[popupStyle, {
          // Menu padding (0.5rem) + popup border (1px) per side: the option
          // content box then covers the field exactly.
          left: 'calc(anchor(left) - 0.5rem - 1px)',
          width: 'calc(anchor-size(width) + 1rem + 2px)',
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
            class="flex min-h-10 items-center justify-between shadow-none"
            :class="{
              'menu-active': isSelected(user),
              'menu-focus': index === highlightedIndex,
            }"
          >
            <span>{{ user.name }}</span>
            <svg
              v-if="isSelected(user)"
              class="size-4"
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
  transition:
    opacity 0.3s ease,
    overlay 0.3s ease allow-discrete,
    display 0.3s ease allow-discrete;

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}
</style>
