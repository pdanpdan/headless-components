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

const selected = ref<string | null>('Vue');
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
      :options="frameworks"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset w-full"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Framework (single, no filter)</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between shadow-sm"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/50': selected == null }">{{ selected ?? 'Select a framework…' }}</span>
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
          top: 'calc(anchor(bottom) + 0.375rem)',
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
            <span>{{ framework }}</span>
            <svg
              v-if="isSelected(framework)"
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
/* Popup opens below the control: slide + fade via the Popover API. */
.cbx-popup {
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
