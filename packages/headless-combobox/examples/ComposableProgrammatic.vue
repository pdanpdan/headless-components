<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Composable · programmatic control';
export const description = 'The composable escapes the slot: open, close, select, and clear are plain functions, callable from anywhere — here from buttons outside the widget. clickOutsideFilter keeps the popup open while the control panel is used.';
</script>

<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref, useId } from 'vue';

interface User {
  id: number;
  name: string;
  role: string;
}

const users = [
  { id: 1, name: 'Wade Cooper', role: 'Admin' },
  { id: 2, name: 'Arlene Mccoy', role: 'Editor' },
  { id: 3, name: 'Devon Webb', role: 'Viewer' },
  { id: 4, name: 'Tom Cook', role: 'Editor' },
  { id: 5, name: 'Tanya Fox', role: 'Admin' },
];

const selected = ref<User | null>(null);
const labelId = useId();

// The composable escapes the slot: actions are plain functions, so they can be
// called from anywhere — here from buttons outside the widget entirely. The
// control panel is outside the click-outside boundary, so the filter keeps the
// popup open when it is clicked.
const {
  isOpen,
  highlightedIndex,
  isSelected,
  cssAnchorName,
  popupStyle,
  triggerProps,
  listboxProps,
  getOptionProps,
  open,
  close,
  select,
  clear,
  setContainerRef,
  setTriggerRef,
  setDropdownRef,
  setListRef,
  setOptionRef,
} = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options: users,
    optionLabel: (user: User) => user.name,
    clickOutsideFilter: (target: EventTarget | null) =>
      !(target instanceof HTMLElement && target.closest('.cbx-controls')),
  },
  (value) => {
    selected.value = value as User | null;
  },
);
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="flex flex-col gap-3">
      <p class="text-xs text-base-content/80">Drive it from anywhere:</p>
      <div class="cbx-controls flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="btn btn-sm"
          @click="open()"
        >
          Open
        </button>
        <button
          type="button"
          class="btn btn-sm"
          @click="close()"
        >
          Close
        </button>
        <button
          type="button"
          class="btn btn-sm"
          @click="select(users[ 1 ]!)"
        >
          Select Arlene
        </button>
        <button
          type="button"
          class="btn btn-sm"
          @click="clear()"
        >
          Clear
        </button>
      </div>

      <p class="text-xs text-base-content/80">
        Selected: {{ selected?.name ?? 'none' }} · popup {{ isOpen ? 'open' : 'closed' }}
      </p>

      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Member (composable, programmatic)</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/70': selected == null }">{{ selected?.name ?? 'Select a member…' }}</span>
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

        <ul
          :ref="(el) => { setDropdownRef(el); setListRef(el); }"
          v-bind="listboxProps"
          popover="manual"
          class="
            cbx-popup menu max-h-60 flex-nowrap gap-0.5 rounded-box border
            border-base-content/5 bg-base-200 shadow-xl
          "
          :style="popupStyle"
        >
          <li
            v-for="(user, index) in users"
            :key="user.id"
          >
            <button
              :ref="(el) => setOptionRef(user, el)"
              type="button"
              v-bind="getOptionProps(user, index)"
              class="justify-between shadow-none"
              :class="{
                'menu-active': isSelected(user),
                'menu-focus': index === highlightedIndex,
              }"
            >
              <span class="flex flex-col items-start">
                <span>{{ user.name }}</span>
                <span class="text-xs opacity-70">{{ user.role }}</span>
              </span>
            </button>
          </li>
        </ul>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
/* Popup opens below the control: slide + fade via the Popover API. */
.cbx-popup {
  inset: auto;
  position-try: flip-block;
  opacity: 0;
  margin-block-start: 0;
  transition:
    opacity 0.15s ease,
    margin-block-start 0.15s ease,
    overlay 0.15s ease allow-discrete,
    display 0.15s ease allow-discrete;

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    opacity: 1;
    margin-block-start: 0.5rem;

    @starting-style {
      opacity: 0;
      margin-block-start: 0;
    }
  }
}
</style>
