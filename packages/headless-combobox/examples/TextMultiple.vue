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
        filteredOptions, highlightedIndex, searchQuery, setSearchQuery, toggle, select,
        clear, isSelected, canSelectMore, selectedCount, setHighlightedIndex, handleKeydown,
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
        class="fieldset w-full"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Frameworks (multiple, max {{ MAX }})</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex h-auto min-h-10 w-full cursor-pointer items-center justify-between gap-2 py-1.5 shadow-sm"
          :style="{ anchorName: cssAnchorName }"
          @click="toggle"
          @keydown="handleKeydown"
        >
          <span v-if="selected.length" class="flex flex-wrap gap-1">
            <span
              v-for="item in selected"
              :key="item"
              class="badge badge-sm badge-primary"
            >{{ item }}</span>
          </span>
          <span v-else class="text-base-content/50">Select frameworks…</span>
          <span class="text-xs opacity-60">{{ selectedCount }}/{{ MAX }}</span>
        </button>
      </fieldset>

      <div
        :ref="setDropdownRef"
        popover="manual"
        class="cbx-popup rounded-box bg-base-200 shadow-xl"
        :style="[popupStyle, {
          top: 'calc(anchor(bottom) + 0.375rem)',
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
            class="input input-sm flex-1"
            placeholder="Search…"
            aria-label="Search frameworks"
            @input="(e) => setSearchQuery((e.target as HTMLInputElement).value)"
            @keydown="handleKeydown"
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
          class="menu max-h-60 w-full flex-nowrap overflow-y-auto"
        >
          <li
            v-for="(framework, index) in filteredOptions"
            :key="framework"
          >
            <button
              :ref="(el) => setOptionRef(framework, el)"
              type="button"
              v-bind="getOptionProps(framework, index)"
              class="justify-between"
              :class="{
                'menu-active': isSelected(framework),
                'menu-focus': index === highlightedIndex,
                'opacity-40': !canSelectMore && !isSelected(framework),
              }"
              @click="select(framework)"
              @mousemove="setHighlightedIndex(index)"
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
      </div>
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
