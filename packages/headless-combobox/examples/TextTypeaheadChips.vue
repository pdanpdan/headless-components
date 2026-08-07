<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox';
import { nextTick, ref, useId, watch } from 'vue';

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

const selected = ref<string[]>([ 'TypeScript' ]);
const labelId = useId();
const chipsRef = ref<HTMLElement | null>(null);

// Keep the newest chip in view when the chip row overflows.
watch(selected, () => {
  nextTick(() => {
    const el = chipsRef.value;
    if (el) {
      el.scrollTo({ left: el.scrollWidth });
    }
  });
});
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        isOpen, filteredOptions, highlightedIndex, searchQuery,
        select, isSelected, canSelectMore, handleKeydown, cssAnchorName, popupStyle,
        comboboxInputProps, listboxProps, getOptionProps, setContainerRef, setTriggerRef,
        setInputRef, setDropdownRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="languages"
      multiple
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset w-full min-w-0"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Topics (typeahead, removable chips in the field)</legend>
        <div
          class="input flex min-w-0 w-full items-center gap-1"
          :style="{ anchorName: cssAnchorName }"
        >
          <div
            ref="chipsRef"
            class="flex min-w-0 items-center gap-1 overflow-x-auto"
          >
            <span
              v-for="item in selected"
              :key="item"
              class="badge badge-soft badge-primary gap-1 pr-1"
            >
              {{ item }}
              <button
                type="button"
                class="btn btn-circle btn-ghost btn-xs"
                :aria-label="`Remove ${ item }`"
                @mousedown.prevent
                @click.stop="select(item)"
              >
                <svg
                  class="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          </div>
          <input
            :ref="(el) => { setTriggerRef(el); setInputRef(el); }"
            v-bind="comboboxInputProps"
            :aria-labelledby="labelId"
            :value="isOpen ? searchQuery : ''"
            type="text"
            class="min-w-24 flex-1"
            placeholder="Add a topic…"
            @keydown="(e) => {
              if (e.key === 'Backspace' && !searchQuery && selected.length > 0) {
                const last = selected[selected.length - 1];
                if (last) { select(last); }
              }
              else if (e.key !== ' ') {
                handleKeydown(e);
              }
            }"
          />
        </div>
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
              'cursor-pointer': canSelectMore || isSelected(language),
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
