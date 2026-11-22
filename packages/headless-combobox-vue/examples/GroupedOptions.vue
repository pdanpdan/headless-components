<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Grouped options';
export const description = 'A filtered list split into labelled sections. getOptionProps(option) resolves each option to its position in the flat filteredOptions array.';
</script>

<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref, useId } from 'vue';

const groups: Record<string, string[]> = {
  Frontend: [
    'Vue',
    'React',
    'Svelte',
    'Solid',
    'Angular',
  ],
  Backend: [
    'Node.js',
    'Deno',
    'Bun',
    'Go',
    'Rust',
  ],
  Database: [
    'PostgreSQL',
    'SQLite',
    'MySQL',
    'MongoDB',
  ],
};

const options = Object.values(groups).flat();
const selected = ref<string | null>('Vue');
const labelId = useId();

// Keep the group order identical to `options`; keyboard navigation follows the
// flat filteredOptions order, not the DOM order.
function groupedOptions(visible: string[]) {
  return Object.entries(groups)
    .map(([ label, items ]) => ({
      label,
      items: items.filter((item) => visible.includes(item)),
    }))
    .filter((group) => group.items.length > 0);
}
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, searchQuery, isSelected, clear,
        cssAnchorName, popupStyle, triggerProps, inputProps, listboxProps,
        getOptionProps, setContainerRef,
      }"
      v-model="selected"
      :options="options"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Technology (grouped)</legend>
        <button
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/70': selected == null }">{{ selected ?? 'Select a technology…' }}</span>
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

      <div
        popover="manual"
        class="
          cbx-popup rounded-box border border-base-content/5 bg-base-200
          shadow-xl
        "
        :style="[popupStyle, {
          left: 'calc(anchor(left) - 0.25rem)',
          width: 'calc(anchor-size(width) + 0.5rem)',
        }]"
      >
        <div class="flex items-center gap-2 border-b border-base-content/10 p-2">
          <input
            v-bind="inputProps"
            :value="searchQuery"
            type="text"
            class="input flex-1 input-sm"
            placeholder="Search technologies…"
            aria-label="Search technologies"
          />
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            @click="clear"
          >
            Clear
          </button>
        </div>

        <ul
          v-bind="listboxProps"
          class="menu max-h-60 w-full flex-nowrap gap-0.5 overflow-y-auto"
        >
          <li
            v-for="group in groupedOptions(filteredOptions)"
            :key="group.label"
            role="group"
            :aria-label="group.label"
          >
            <span aria-hidden="true" class="menu-title">{{ group.label }}</span>
            <button
              v-for="option in group.items"
              :key="option"
              type="button"
              v-bind="getOptionProps(option)"
              class="justify-between shadow-none"
              :class="{
                'menu-active': isSelected(option),
                'menu-focus': filteredOptions[highlightedIndex] === option,
              }"
            >
              <span>{{ option }}</span>
              <svg
                v-if="isSelected(option)"
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

          <li
            v-if="filteredOptions.length === 0"
            class="
              pointer-events-none p-4 text-center text-sm text-base-content/70
            "
            role="presentation"
          >
            No matches.
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
