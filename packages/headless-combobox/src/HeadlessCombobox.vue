<script setup lang="ts" generic="O, V = O, Q = string">
import type { HeadlessComboboxProps, HeadlessComboboxPropsSource, HeadlessComboboxSlotProps } from './useHeadlessCombobox';

import { useHeadlessCombobox } from './useHeadlessCombobox';

export type {
  HeadlessComboboxComboboxInputProps,
  HeadlessComboboxErrorCode,
  HeadlessComboboxInputProps,
  HeadlessComboboxListboxProps,
  HeadlessComboboxOptionProps,
  HeadlessComboboxPopupStyle,
  HeadlessComboboxProps,
  HeadlessComboboxPropsSource,
  HeadlessComboboxScope,
  HeadlessComboboxSlotProps,
  HeadlessComboboxTriggerProps,
} from './useHeadlessCombobox';

const props = withDefaults(defineProps<HeadlessComboboxProps<O, V, Q>>(), {
  // defaults to auto based on `multiple`.
  closeOnSelect: null,
  // Vue casts absent boolean props to `false`; the default must be explicit.
  closeOnClickOutside: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: V | V[] | null): void;
}>();

defineSlots<{
  default: (props: HeadlessComboboxSlotProps<O, Q>) => unknown;
}>();

const {
  isOpen,
  multiple,
  disabled,
  readonly,
  searchQuery,
  filteredOptions,
  highlightedIndex,
  alignmentOffset,
  cssAnchorName,
  popupStyle,
  selectedCount,
  canSelectMore,
  isSelected,
  valid,
  errors,
  validationMessage,
  triggerProps,
  inputProps,
  comboboxInputProps,
  listboxProps,
  getOptionProps,
  setSearchQuery,
  setHighlightedIndex,
  toggle,
  open,
  close,
  select,
  clear,
  focusInput,
  handleKeydown,
  setContainerRef,
  setTriggerRef,
  setDropdownRef,
  setInputRef,
  setListRef,
  setOptionRef,
} = useHeadlessCombobox<O, V, Q>(
  // defineProps widens optionals to `O | undefined` (exactOptionalPropertyTypes);
  // the composable treats undefined and absent identically.
  props as unknown as HeadlessComboboxPropsSource<O, V, Q>,
  (value) => emit('update:modelValue', value),
);
</script>

<template>
  <slot
    :is-open="isOpen"
    :multiple="multiple === true"
    :disabled="disabled === true"
    :readonly="readonly === true"
    :search-query="(searchQuery as Q | undefined)"
    :filtered-options="filteredOptions"
    :highlighted-index="highlightedIndex"
    :alignment-offset="alignmentOffset"
    :css-anchor-name="cssAnchorName"
    :popup-style="popupStyle"
    :selected-count="selectedCount"
    :can-select-more="canSelectMore"
    :is-selected="isSelected"
    :valid="valid"
    :errors="errors"
    :validation-message="validationMessage"
    :trigger-props="triggerProps"
    :input-props="inputProps"
    :combobox-input-props="comboboxInputProps"
    :listbox-props="listboxProps"
    :get-option-props="getOptionProps"
    :set-search-query="setSearchQuery"
    :set-highlighted-index="setHighlightedIndex"
    :toggle="toggle"
    :open="open"
    :close="close"
    :select="select"
    :clear="clear"
    :focus-input="focusInput"
    :handle-keydown="handleKeydown"
    :set-container-ref="setContainerRef"
    :set-trigger-ref="setTriggerRef"
    :set-dropdown-ref="setDropdownRef"
    :set-input-ref="setInputRef"
    :set-list-ref="setListRef"
    :set-option-ref="setOptionRef"
  />
</template>
