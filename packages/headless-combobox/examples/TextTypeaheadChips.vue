<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Typeahead · chips inside the field';
export const description = 'GitHub-style topic input: chips and the text input share one bordered field. The field is a plain container, so each chip can carry a remove button without nesting controls.';
</script>

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
        isOpen, filteredOptions, highlightedIndex, searchQuery, open,
        select, isSelected, canSelectMore, handleKeydown, cssAnchorName, popupStyle,
        comboboxInputProps, listboxProps, getOptionProps, setContainerRef, setTriggerRef,
        setInputRef, setDropdownRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="languages"
      multiple
      :max-length="3"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Topics (typeahead, removable chips in the field)</legend>
        <!-- eslint-disable-next-line vue-a11y/click-events-have-key-events, vue-a11y/no-static-element-interactions -- the inner input is the keyboard-operable control; this only widens the pointer target -->
        <div
          class="
            input flex h-auto min-h-10 w-full min-w-0 items-center gap-1 py-1.5
          "
          :style="{ anchorName: cssAnchorName }"
          @click.self="open"
        >
          <div
            ref="chipsRef"
            class="
              flex min-h-10 min-w-0 scrollbar-thin items-center gap-1
              overflow-x-auto
            "
          >
            <span
              v-for="item in selected"
              :key="item"
              class="badge gap-1 badge-soft pr-0"
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
                  class="size-3"
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
          v-for="(language, index) in filteredOptions"
          :key="language"
        >
          <button
            :ref="(el) => setOptionRef(language, el)"
            type="button"
            v-bind="getOptionProps(language, index)"
            class="justify-between shadow-none"
            :class="{
              'menu-active': isSelected(language),
              'menu-focus': index === highlightedIndex,
              'cursor-pointer': canSelectMore || isSelected(language),
            }"
            :disabled="!canSelectMore && !isSelected(language)"
          >
            <span>{{ language }}</span>
            <svg
              v-if="isSelected(language)"
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
