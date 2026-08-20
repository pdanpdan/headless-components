<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Composable · single · typeahead';
export const description = 'Same headless behavior without the component: useHeadlessCombobox exposes state, ARIA bags, and actions directly — wire your own markup with plain refs.';
</script>

<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref, useId } from 'vue';

const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'C#',
  'C++',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Dart',
  'Elixir',
  'Haskell',
  'Scala',
];

const selected = ref<string | null>('TypeScript');
const labelId = useId();

// Same state machine as <HeadlessCombobox> — no slot indirection. Props accept
// plain values or refs (unwrapped and tracked internally); the callback
// receives every update:modelValue payload.
const {
  isOpen,
  filteredOptions,
  highlightedIndex,
  searchQuery,
  toggle,
  isSelected,
  handleKeydown,
  cssAnchorName,
  comboboxInputProps,
  listboxProps,
  getOptionProps,
  setContainerRef,
  setTriggerRef,
  setInputRef,
  setDropdownRef,
  setListRef,
  setOptionRef,
} = useHeadlessCombobox<string>(
  {
    modelValue: selected,
    options: languages,
  },
  (value) => {
    selected.value = value as string | null;
  },
);
</script>

<template>
  <div class="w-full max-w-sm">
    <fieldset
      :ref="setContainerRef"
      class="flex flex-col gap-1"
    >
      <legend :id="labelId" class="font-semibold">Language (composable, typeahead)</legend>
      <div
        class="input relative flex w-full items-center"
        :style="{ anchorName: cssAnchorName }"
      >
        <input
          :ref="(el) => { setTriggerRef(el); setInputRef(el); }"
          v-bind="comboboxInputProps"
          :aria-labelledby="labelId"
          :value="isOpen ? searchQuery : (selected ?? '')"
          type="text"
          class="w-full pr-8"
          placeholder="Search a language…"
          @keydown="(e) => { if (e.key !== ' ') { handleKeydown(e); } }"
        />
        <button
          type="button"
          tabindex="-1"
          class="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer text-base-content/50"
          aria-label="Toggle suggestions"
          @click.stop="toggle"
        >
          <svg
            class="motion-safe:transition-transform h-4 w-4"
            :class="{ 'rotate-180': isOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

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
          v-for="(language, index) in filteredOptions"
          :key="language"
        >
          <button
            :ref="(el) => setOptionRef(language, el)"
            type="button"
            v-bind="getOptionProps(language, index)"
            class="justify-between shadow-none hover:bg-primary/20 hover:text-primary"
            :class="{
              'menu-active': isSelected(language),
              'hover:brightness-95': isSelected(language),
              'menu-focus': index === highlightedIndex,

              'bg-primary/20': index === highlightedIndex,

              'text-primary': index === highlightedIndex,
            }"
          >
            <span>{{ language }}</span>
            <svg
              v-if="isSelected(language)"
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
          No matches.
        </li>
      </ul>
    </fieldset>
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
