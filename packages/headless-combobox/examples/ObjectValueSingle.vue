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
        filteredOptions, highlightedIndex, isSelected, canSelectMore,
        cssAnchorName, triggerProps, listboxProps,
        getOptionProps, setContainerRef, setTriggerRef, setDropdownRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="frameworks"
      :option-label="(framework: Framework) => framework.label"
      :option-value="(framework: Framework) => framework.value"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset w-full"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Framework id (single, separate value)</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between shadow-sm"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/50': selected == null }">{{ selectedLabel }}</span>
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
        :style="{
          positionAnchor: cssAnchorName,
          top: 'calc(anchor(bottom) + 0.375rem)',
          left: 'calc(anchor(left) - 0.25rem)',
          width: 'calc(anchor-size(width) + 0.5rem)',
        }"
      >
        <li
          v-for="(framework, index) in filteredOptions"
          :key="framework.value"
        >
          <button
            :ref="(el) => setOptionRef(framework, el)"
            type="button"
            v-bind="getOptionProps(framework, index)"
            class="justify-between shadow-none hover:bg-primary/20 hover:text-primary"
            :class="{
              'menu-active': isSelected(framework),
              'hover:brightness-95': isSelected(framework),
              'menu-focus': index === highlightedIndex,

              'bg-primary/20': index === highlightedIndex,

              'text-primary': index === highlightedIndex,
              'cursor-pointer': canSelectMore || isSelected(framework),
            }"
          >
            <span>{{ framework.label }}</span>
            <span
              class="text-xs"
              :class="isSelected(framework) || index === highlightedIndex ? 'text-current' : 'text-base-content/40'"
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
  /* The popover UA pins the element with `inset: 0`, so reset it and let
     `flip-block` flip the anchored position when there is no space. */
  inset: auto;
  position-try: flip-block;
  opacity: 0;
  translate: 0 -0.375rem;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      opacity 0.15s ease,
      translate 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;
  }

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
