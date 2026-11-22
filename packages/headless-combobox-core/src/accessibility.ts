import type { ComboboxContext } from './context';
import type { HeadlessComboboxComboboxInputProps, HeadlessComboboxInputProps, HeadlessComboboxListboxProps, HeadlessComboboxOptionProps, HeadlessComboboxTriggerProps } from './types';

import { createMemo } from './context';

/** Late-bound actions the ARIA prop bags need (wired by the store). */
export interface AccessibilityDeps<O> {
  select: (option: O) => void;
  setHighlightedIndex: (index: number) => void;
  toggle: () => void;
  handleKeydown: (event: Event) => void;
  open: () => Promise<void>;
  openFromFocus: () => void;
  setQueryFromEvent: (event: Event) => void;
  openAndSetQueryFromEvent: (event: Event) => void;
  isSelected: (option: O) => boolean;
  isOptionDisabled: (option: O) => boolean;
}

/** Ids, the anchor name, and the ARIA prop bags spread onto consumer markup. */
export function createAccessibility<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  instanceId: string,
  deps: AccessibilityDeps<O>,
) {
  // Vue's default useId contains a colon; React's contains «». Strip anything
  // that is not valid in an id or a CSS custom property.
  const safeInstanceId = instanceId.replace(/[^\w-]/g, '-');

  const listboxId = `${ safeInstanceId }-listbox`;
  const triggerId = `${ safeInstanceId }-trigger`;
  const inputId = `${ safeInstanceId }-input`;
  const getOptionId = (index: number) => `${ safeInstanceId }-opt-${ index }`;
  const cssAnchorName = `--anchor-${ safeInstanceId }`;

  const getActiveDescendant = createMemo<string | undefined>(ctx)(() => {
    if (!ctx.state.isOpen || ctx.state.highlightedIndex === -1) {
      return undefined;
    }
    return getOptionId(ctx.state.highlightedIndex);
  });

  const getTriggerProps = createMemo<HeadlessComboboxTriggerProps>(ctx)(() => ({
    id: triggerId,
    role: 'combobox',
    'aria-controls': listboxId,
    'aria-expanded': ctx.state.isOpen,
    'aria-haspopup': 'listbox',
    'aria-activedescendant': getActiveDescendant(),
    disabled: ctx.props.disabled ? true : undefined,
    'aria-disabled': ctx.props.disabled ? true : undefined,
    'aria-readonly': ctx.props.readonly ? true : undefined,
    onClick: deps.toggle,
    onKeydown: deps.handleKeydown,
  }));

  const getInputProps = createMemo<HeadlessComboboxInputProps>(ctx)(() => ({
    id: inputId,
    role: 'searchbox',
    'aria-autocomplete': 'list',
    'aria-controls': listboxId,
    'aria-activedescendant': getActiveDescendant(),
    onInput: deps.setQueryFromEvent,
    onKeydown: deps.handleKeydown,
  }));

  // For the canonical editable (typeahead) pattern where the text input *is* the combobox.
  const getComboboxInputProps = createMemo<HeadlessComboboxComboboxInputProps>(ctx)(() => ({
    id: inputId,
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-controls': listboxId,
    'aria-expanded': ctx.state.isOpen,
    'aria-haspopup': 'listbox',
    'aria-activedescendant': getActiveDescendant(),
    'aria-disabled': ctx.props.disabled ? true : undefined,
    'aria-readonly': ctx.props.readonly ? true : undefined,
    disabled: ctx.props.disabled ? true : undefined,
    readonly: ctx.props.readonly ? true : undefined,
    onClick: deps.open,
    onFocus: deps.openFromFocus,
    onInput: deps.openAndSetQueryFromEvent,
  }));

  const getListboxProps = createMemo<HeadlessComboboxListboxProps>(ctx)(() => ({
    id: listboxId,
    role: 'listbox',
    'aria-multiselectable': ctx.props.multiple ? true : undefined,
  }));

  function getOptionProps(option: O, index: number): HeadlessComboboxOptionProps {
    const actionable = () => !deps.isOptionDisabled(option);
    return {
      id: getOptionId(index),
      role: 'option',
      'aria-selected': deps.isSelected(option),
      'aria-disabled': deps.isOptionDisabled(option)
        ? true
        : undefined,
      'data-highlighted': index === ctx.state.highlightedIndex
        ? true
        : undefined,
      onClick: () => deps.select(option),
      // Keep the filter input focused when the option is clicked.
      onMousedown: (event: Event) => (event as MouseEvent).preventDefault(),
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
    getTriggerProps,
    getInputProps,
    getComboboxInputProps,
    getListboxProps,
    getOptionProps,
  };
}
