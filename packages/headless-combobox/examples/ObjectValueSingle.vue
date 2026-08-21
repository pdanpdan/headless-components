<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Object options · single · separate value';
export const description = 'Options carry a label and a value; the model holds the value only.';
</script>

<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox';
import { computed, ref, useId } from 'vue';

interface Framework {
  label: string;
  value: number;
}

const frameworks: Framework[] = [
  { label: 'Vue', value: 1 },
  { label: 'React', value: 2 },
  { label: 'Svelte', value: 3 },
  { label: 'Solid', value: 4 },
  { label: 'Angular', value: 5 },
  { label: 'Preact', value: 6 },
  { label: 'Qwik', value: 7 },
  { label: 'Lit', value: 8 },
];

const selected = ref<number | null>(3);
const labelId = useId();

const selectedLabel = computed(
  () => frameworks.find((framework) => framework.value === selected.value)?.label ?? 'Select a framework…',
);
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
      :option-label="(framework: Framework) => framework.label"
      :option-value="(framework: Framework) => framework.value"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Framework id (single, separate value)</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/70': selected == null }">{{ selectedLabel }}</span>
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
          :key="framework.value"
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
            <span>{{ framework.label }}</span>
            <span
              class="text-xs"
              :class="isSelected(framework) || index === highlightedIndex ? `
                text-current
              ` : `text-base-content/70`"
            >{{ framework.value }}</span>
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
