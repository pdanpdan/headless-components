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

const props = withDefaults(defineProps<Omit<HeadlessComboboxProps<O, V, Q>, 'modelValue'>>(), {
  // defaults to auto based on `multiple`.
  closeOnSelect: null,
  // Vue casts absent boolean props to `false`; the default must be explicit.
  closeOnClickOutside: true,
  inputOnOpen: 'select',
});

defineSlots<{
  default: (props: HeadlessComboboxSlotProps<O, V, Q>) => unknown;
}>();

// No parent `v-model`? The model falls back to local state (`defineModel`
// keeps the last set value internally) so the component still works.
const model = defineModel<V | V[] | null>('modelValue', { default: null });

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
  selectedList,
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
  // the composable treats undefined and absent identically. The model ref is
  // passed directly so the internal fallback state stays in sync.
  { ...props, modelValue: model } as unknown as HeadlessComboboxPropsSource<O, V, Q>,
  (value) => {
    model.value = value;
  },
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
    :selected-list="selectedList"
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
