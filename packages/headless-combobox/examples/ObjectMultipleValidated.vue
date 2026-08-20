<script lang="ts">
/* eslint-disable import/first -- the exports below precede the setup imports in the compiled module */
export const title = 'Object options · multiple · validated';
export const description = 'Multiple selection with required + min/max validation and a rendered message.';
</script>

<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref, useId } from 'vue';

interface User {
  id: number;
  name: string;
  role: string;
}

const users = ref<User[]>([
  { id: 1, name: 'Wade Cooper', role: 'Admin' },
  { id: 2, name: 'Arlene Mccoy', role: 'Editor' },
  { id: 3, name: 'Devon Webb', role: 'Viewer' },
  { id: 4, name: 'Tom Cook', role: 'Editor' },
  { id: 5, name: 'Tanya Fox', role: 'Admin' },
  { id: 6, name: 'Hellen Schmidt', role: 'Viewer' },
  { id: 7, name: 'Caroline Schultz', role: 'Admin' },
  { id: 8, name: 'Mason Heaney', role: 'Editor' },
]);

const selected = ref<User[]>([ users.value[ 1 ] as User ]);
const labelId = useId();
</script>

<template>
  <div class="w-full max-w-sm">
    <HeadlessCombobox
      v-slot="{
        filteredOptions, highlightedIndex, searchQuery,
        isSelected, canSelectMore, selectedCount, valid, validationMessage,
        cssAnchorName, popupStyle, triggerProps, inputProps, listboxProps, getOptionProps,
        setContainerRef, setTriggerRef, setDropdownRef, setInputRef, setListRef, setOptionRef,
      }"
      v-model="selected"
      :options="users"
      :display-value="(u: User) => u.name"
      multiple
      required
      :min-length="2"
      :max-length="4"
    >
      <fieldset
        :ref="setContainerRef"
        class="fieldset w-full"
      >
        <legend :id="labelId" class="fieldset-legend font-semibold">Reviewers (multiple, 2–4 required)</legend>
        <button
          :ref="setTriggerRef"
          v-bind="triggerProps"
          :aria-labelledby="labelId"
          type="button"
          class="input flex w-full cursor-pointer items-center justify-between shadow-sm"
          :class="valid ? '' : 'input-error'"
          :style="{ anchorName: cssAnchorName }"
        >
          <span :class="{ 'text-base-content/50': selectedCount === 0 }">
            {{ selectedCount ? `${ selectedCount } selected` : 'Select reviewers…' }}
          </span>
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
        <p
          class="fieldset-label"
          :class="valid ? 'text-success' : 'text-error'"
        >
          {{ valid ? 'Looks good.' : validationMessage }}
        </p>
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
        <div class="border-b border-base-content/10 p-2">
          <input
            :ref="setInputRef"
            v-bind="inputProps"
            :value="searchQuery"
            type="text"
            class="input input-sm w-full"
            placeholder="Search reviewers…"
            aria-label="Search reviewers"
          />
        </div>

        <ul
          :ref="setListRef"
          v-bind="listboxProps"
          class="menu max-h-60 w-full flex-nowrap gap-0.5 overflow-y-auto"
        >
          <li
            v-for="(user, index) in filteredOptions"
            :key="user.id"
          >
            <button
              :ref="(el) => setOptionRef(user, el)"
              type="button"
              v-bind="getOptionProps(user, index)"
              class="justify-between shadow-none hover:bg-primary/20 hover:text-primary"
              :class="{
                'menu-active': isSelected(user),
                'hover:brightness-95': isSelected(user),
                'menu-focus': index === highlightedIndex && (canSelectMore || isSelected(user)),

                'bg-primary/20': index === highlightedIndex && (canSelectMore || isSelected(user)),

                'text-primary': index === highlightedIndex && (canSelectMore || isSelected(user)),
                'cursor-pointer': canSelectMore || isSelected(user),
                'pointer-events-none': !canSelectMore && !isSelected(user),
                'opacity-40': !canSelectMore && !isSelected(user),
              }"
            >
              <span class="flex flex-col items-start gap-0.5">
                <span>{{ user.name }}</span>
                <span class="text-xs opacity-60">{{ user.role }}</span>
              </span>
              <svg
                v-if="isSelected(user)"
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
