<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Typeahead · custom value';
export const description = 'Editable combobox that accepts a value outside the options list. Press Enter or use the Create action to commit the typed query.';
</script>

<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
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
];

const selected = ref<string | null>(null);
const labelId = useId();
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, searchQuery, open,
        isSelected, canCreate, statusMessage, createSelection, cssAnchorName, popupStyle,
        comboboxInputProps, listboxProps, statusProps, getOptionProps, setContainerRef,
        setTriggerRef, setInputRef, setDropdownRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="languages"
      creatable
      :create-option="(query: string) => query.trim()"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Language or custom value</legend>
        <!-- eslint-disable-next-line vue-a11y/click-events-have-key-events, vue-a11y/no-static-element-interactions -- the inner input is the keyboard-operable control; this only widens the pointer target -->
        <div
          class="input relative flex w-full items-center"
          :style="{ anchorName: cssAnchorName }"
          @click.self="open"
        >
          <input
            :ref="(el) => { setTriggerRef(el); setInputRef(el); }"
            v-bind="comboboxInputProps"
            :aria-labelledby="labelId"
            :value="searchQuery ?? (selected ?? '')"
            type="text"
            class="w-full pe-6"
            placeholder="Search or type a value…"
          />
          <svg
            class="
              pointer-events-none absolute top-1/2 right-2 size-4
              -translate-y-1/2 opacity-70
            "
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
        </div>
      </fieldset>

      <p v-bind="statusProps" class="sr-only">{{ statusMessage }}</p>

      <div
        :ref="setDropdownRef"
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
        <ul
          :ref="setListRef"
          v-bind="listboxProps"
          class="menu max-h-60 w-full flex-nowrap gap-0.5 overflow-y-auto"
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
              }"
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
            No matches. Press Enter to create.
          </li>
        </ul>

        <div v-if="canCreate" class="border-t border-base-content/10 p-2">
          <button
            type="button"
            class="btn w-full justify-start btn-ghost btn-sm"
            @click="createSelection()"
          >
            Create "{{ searchQuery?.trim() }}"
          </button>
        </div>
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
