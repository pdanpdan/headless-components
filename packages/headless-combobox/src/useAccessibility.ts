import type {
  HeadlessComboboxComboboxInputProps,
  HeadlessComboboxInputProps,
  HeadlessComboboxListboxProps,
  HeadlessComboboxOptionProps,
  HeadlessComboboxProps,
  HeadlessComboboxTriggerProps,
} from './useHeadlessCombobox';
import type { Ref } from 'vue';

import { computed } from 'vue';

/** Late-bound actions the ARIA prop bags need (wired by the orchestrator). */
export interface AccessibilityDeps<O> {
  select: (option: O) => void;
  setHighlightedIndex: (index: number) => void;
  toggle: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  open: () => Promise<void>;
  setQueryFromEvent: (event: Event) => void;
  openAndSetQueryFromEvent: (event: Event) => void;
  isSelected: (option: O) => boolean;
  isOptionDisabled: (option: O) => boolean;
}

/** Ids, the anchor name, and the ARIA prop bags spread onto consumer markup. */
export function useAccessibility<O, V, Q>(
  props: HeadlessComboboxProps<O, V, Q>,
  instanceId: string,
  isOpen: Ref<boolean>,
  highlightedIndex: Ref<number>,
  deps: AccessibilityDeps<O>,
) {
  // Ensure the colon from Vue's default useId (e.g., v-0) is stripped if used in CSS custom properties
  const safeInstanceId = instanceId.replace(/:/g, '-');

  const listboxId = `${ safeInstanceId }-listbox`;
  const triggerId = `${ safeInstanceId }-trigger`;
  const inputId = `${ safeInstanceId }-input`;
  const getOptionId = (index: number) => `${ safeInstanceId }-opt-${ index }`;
  const cssAnchorName = `--anchor-${ safeInstanceId }`;

  const activeDescendant = computed(() => {
    if (!isOpen.value || highlightedIndex.value === -1) {
      return undefined;
    }
    return getOptionId(highlightedIndex.value);
  });

  const triggerProps = computed<HeadlessComboboxTriggerProps>(() => ({
    id: triggerId,
    role: 'combobox',
    'aria-controls': listboxId,
    'aria-expanded': isOpen.value,
    'aria-haspopup': 'listbox',
    'aria-activedescendant': activeDescendant.value,
    disabled: props.disabled ? true : undefined,
    'aria-disabled': props.disabled ? true : undefined,
    'aria-readonly': props.readonly ? true : undefined,
    onClick: deps.toggle,
    onKeydown: deps.handleKeydown,
  }));

  const inputProps = computed<HeadlessComboboxInputProps>(() => ({
    id: inputId,
    role: 'searchbox',
    'aria-autocomplete': 'list',
    'aria-controls': listboxId,
    'aria-activedescendant': activeDescendant.value,
    onInput: deps.setQueryFromEvent,
    onKeydown: deps.handleKeydown,
  }));

  // For the canonical editable (typeahead) pattern where the text input *is* the combobox.
  const comboboxInputProps = computed<HeadlessComboboxComboboxInputProps>(() => ({
    id: inputId,
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-controls': listboxId,
    'aria-expanded': isOpen.value,
    'aria-haspopup': 'listbox',
    'aria-activedescendant': activeDescendant.value,
    'aria-disabled': props.disabled ? true : undefined,
    'aria-readonly': props.readonly ? true : undefined,
    disabled: props.disabled ? true : undefined,
    readonly: props.readonly ? true : undefined,
    onClick: deps.open,
    onFocus: deps.open,
    onInput: deps.openAndSetQueryFromEvent,
  }));

  const listboxProps = computed<HeadlessComboboxListboxProps>(() => ({
    id: listboxId,
    role: 'listbox',
    'aria-multiselectable': props.multiple ? true : undefined,
  }));

  function getOptionProps(option: O, index: number): HeadlessComboboxOptionProps {
    const actionable = () => !deps.isOptionDisabled(option);
    return {
      id: getOptionId(index),
      role: 'option',
      'aria-selected': deps.isSelected(option),
      'aria-disabled': deps.isOptionDisabled(option) ? true : undefined,
      'data-highlighted': index === highlightedIndex.value ? true : undefined,
      onClick: () => deps.select(option),
      // Keep the filter input focused when the option is clicked.
      onMousedown: (event: MouseEvent) => event.preventDefault(),
      // Hover and focus drive the highlight; blocked options never get it.
      onMousemove: () => {
        if (actionable()) {
          deps.setHighlightedIndex(index);
        }
      },
      onFocus: () => {
        if (actionable()) {
          deps.setHighlightedIndex(index);
        }
      },
      // Keep the popup's keyboard navigation (and Tab skipping) working from
      // inside the options list.
      onKeydown: deps.handleKeydown,
    };
  }

  return {
    cssAnchorName,
    triggerProps,
    inputProps,
    comboboxInputProps,
    listboxProps,
    getOptionProps,
  };
}
