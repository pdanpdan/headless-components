<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Text options · multiple · with filter';
export const description = 'Multiple selection capped with max; selecting toggles, dropdown stays open.';
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

const selected = ref<string[]>([ 'Vue', 'Svelte' ]);
const labelId = useId();
const MAX = 3;
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, searchQuery,
        clear, isSelected, canSelectMore, selectedCount,
        cssAnchorName, popupStyle, triggerProps, inputProps, listboxProps, getOptionProps, setContainerRef,
        setTriggerRef, setDropdownRef, setInputRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="frameworks"
      multiple
      :max-length="MAX"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset"
      >
        <legend :id="labelId" class="fieldset-legend">Frameworks (multiple, max {{ MAX }})</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="
            input flex h-auto min-h-10 w-full cursor-pointer items-center
            justify-between py-1.5
          "
          :style="{ anchorName: cssAnchorName }"
        >
          <span v-if="selected.length" class="flex flex-wrap gap-1">
            <span
              v-for="item in selected"
              :key="item"
              class="badge badge-soft badge-sm"
            >{{ item }}</span>
          </span>
          <span v-else class="text-base-content/70">Select frameworks…</span>
          <span class="text-xs opacity-70">{{ selectedCount }}/{{ MAX }}</span>
        </button>
      </fieldset>

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
        <div class="flex items-center gap-2 border-b border-base-content/10 p-2">
          <input
            :ref="setInputRef"
            v-bind="inputProps"
            :value="searchQuery"
            type="text"
            class="input flex-1 input-sm"
            placeholder="Search…"
            aria-label="Search frameworks"
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
          :ref="setListRef"
          v-bind="listboxProps"
          class="menu max-h-60 w-full flex-nowrap gap-0.5 overflow-y-auto"
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
              :disabled="!canSelectMore && !isSelected(framework)"
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
