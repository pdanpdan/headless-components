<script setup lang="ts" generic="O, V = O, Q = string">
import type { HeadlessComboboxProps, HeadlessComboboxSlotProps } from './useHeadlessCombobox';

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
  canCreate,
  valid,
  errors,
  validationMessage,
  statusMessage,
  triggerProps,
  inputProps,
  comboboxInputProps,
  listboxProps,
  statusProps,
  getOptionProps,
  setSearchQuery,
  setHighlightedIndex,
  toggle,
  open,
  close,
  select,
  createSelection,
  clear,
  focusInput,
  handleKeydown,
  handleTypeaheadKeydown,
  setContainerRef,
  setTriggerRef,
  setDropdownRef,
  setInputRef,
  setListRef,
  setOptionRef,
} = useHeadlessCombobox<O, V, Q>(
  // The getter keeps the props reactive: reading `props` inside it tracks
  // every field, and the model ref is read on each access too.
  () => ({ ...props, modelValue: model.value }) as unknown as HeadlessComboboxProps<O, V, Q>,
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
    :can-create="canCreate"
    :valid="valid"
    :errors="errors"
    :validation-message="validationMessage"
    :status-message="statusMessage"
    :trigger-props="triggerProps"
    :input-props="inputProps"
    :combobox-input-props="comboboxInputProps"
    :listbox-props="listboxProps"
    :status-props="statusProps"
    :get-option-props="getOptionProps"
    :set-search-query="setSearchQuery"
    :set-highlighted-index="setHighlightedIndex"
    :toggle="toggle"
    :open="open"
    :close="close"
    :select="select"
    :create-selection="createSelection"
    :clear="clear"
    :focus-input="focusInput"
    :handle-keydown="handleKeydown"
    :handle-typeahead-keydown="handleTypeaheadKeydown"
    :set-container-ref="setContainerRef"
    :set-trigger-ref="setTriggerRef"
    :set-dropdown-ref="setDropdownRef"
    :set-input-ref="setInputRef"
    :set-list-ref="setListRef"
    :set-option-ref="setOptionRef"
  />
</template>
