<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Text options · single · select on tab';
export const description = 'Press Tab with an option highlighted: it is selected and the popup closes (selectOnTab).';
</script>

<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref, useId } from 'vue';

const frameworks = [
  'Vue',
  'React',
  'Svelte',
  'Solid',
  'Angular',
  'Preact',
  'Qwik',
  'Lit',
  'Alpine',
  'Ember',
];

const selected = ref<string | null>(null);
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
      :options="frameworks"
      select-on-tab
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Framework (single, select on tab)</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/70': selected == null }">{{ selected ?? 'Select a framework…' }}</span>
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
          left: 'calc(anchor(left) - 0.25rem)',
          width: 'calc(anchor-size(width) + 0.5rem)',
        }]"
      >
        <li
          v-for="(framework, index) in filteredOptions"
          :key="framework"
        >
          <button
            :ref="(el) => setOptionRef(framework, el)"
            type="button"
            v-bind="getOptionProps(framework, index)"
            class="justify-between shadow-none"
            :class="{
              'menu-active': isSelected(framework),
              'menu-focus': index === highlightedIndex,
            }"
          >
            <span>{{ framework }}</span>
            <svg
              v-if="isSelected(framework)"
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
/* Popup opens below the control: slide + fade via the Popover API. */
.cbx-popup {
  inset: auto;
  position-try: flip-block;
  opacity: 0;
  margin-block-start: 0;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      opacity 0.15s ease,
      margin-block-start 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;
  }

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
