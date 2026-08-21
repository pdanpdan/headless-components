import type { AccessibilityDeps } from './useAccessibility';
import type { FilteringHooks } from './useFiltering';
import type { NavigationDeps } from './useNavigation';
import type { SelectionHooks } from './useSelection';
import type { ComputedRef, Ref } from 'vue';

import { computed, reactive, ref, toRaw, toValue, useId, watch } from 'vue';

import { useAccessibility } from './useAccessibility';
import { useFiltering } from './useFiltering';
import { useNavigation } from './useNavigation';
import { usePopover } from './usePopover';
import { usePositioning } from './usePositioning';
import { useSelection } from './useSelection';
import { useValidation } from './useValidation';

export type HeadlessComboboxErrorCode = 'required' | 'minlength' | 'maxlength';

export interface HeadlessComboboxTriggerProps {
  id: string;
  role: 'combobox';
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'listbox';
  'aria-activedescendant': string | undefined;
  disabled: true | undefined;
  'aria-disabled': true | undefined;
  'aria-readonly': true | undefined;
  onClick: () => void;
  onKeydown: (event: KeyboardEvent) => void;
}

export interface HeadlessComboboxInputProps {
  id: string;
  role: 'searchbox';
  'aria-autocomplete': 'list';
  'aria-controls': string;
  'aria-activedescendant': string | undefined;
  onInput: (event: Event) => void;
  onKeydown: (event: KeyboardEvent) => void;
}

export interface HeadlessComboboxComboboxInputProps {
  id: string;
  role: 'combobox';
  'aria-autocomplete': 'list';
  'aria-controls': string;
  'aria-expanded': boolean;
  'aria-haspopup': 'listbox';
  'aria-activedescendant': string | undefined;
  'aria-disabled': true | undefined;
  'aria-readonly': true | undefined;
  disabled: true | undefined;
  readonly: true | undefined;
  onClick: () => void;
  onFocus: () => void;
  onInput: (event: Event) => void;
}

export interface HeadlessComboboxListboxProps {
  id: string;
  role: 'listbox';
  'aria-multiselectable': true | undefined;
}

export interface HeadlessComboboxOptionProps {
  id: string;
  role: 'option';
  'aria-selected': boolean;
  'aria-disabled': true | undefined;
  'data-highlighted': true | undefined;
  onClick: () => void;
  onMousedown: (event: MouseEvent) => void;
  onMousemove: () => void;
  onFocus: () => void;
  onKeydown: (event: KeyboardEvent) => void;
}

export interface HeadlessComboboxPopupStyle {
  positionAnchor: string;
  left: string;
  width: string;
  top: string;
  translate?: string;
  [key: `--${ string }`]: string | undefined;
}

export interface HeadlessComboboxProps<O, V = O, Q = string> {
  modelValue: V | V[] | null;
  options: O[];
  /** Enable multiple selection. `modelValue` becomes an array. */
  multiple?: boolean;
  /** Multiple: minimum number of selected options (validation). */
  minLength?: number;
  /** Multiple: maximum number of selected options. Blocks adding beyond it. */
  maxLength?: number;
  /** Require a selection (single: a value; multiple: at least one). */
  required?: boolean;
  /** Disable the control: not focusable, cannot open or change. */
  disabled?: boolean;
  /** Read-only: still focusable and shows the value, but cannot open or change. */
  readonly?: boolean;
  /** Close the dropdown after selecting. Defaults to `true` for single, `false` for multiple. */
  closeOnSelect?: boolean | null;
  /** Close the dropdown when clicking outside the widget boundary. Defaults to `true`. */
  closeOnClickOutside?: boolean;
  /** Keep the dropdown open for specific outside targets: return `false` to prevent closing. */
  clickOutsideFilter?: (target: EventTarget | null) => boolean;
  /** On Tab, when focus leaves the widget: select the highlighted option and close the popup. Defaults to `false`. */
  selectOnTab?: boolean;
  /** Maps an option to the value stored in `modelValue` / emitted on select. Defaults to the option itself. */
  optionValue?: (option: O) => V;
  /** Maps an option object to a string for default filtering and rendering */
  optionLabel?: (option: O) => string;
  /** Custom filter function. Defaults to case-insensitive substring search */
  optionFilter?: (option: O, query: Q) => boolean;
  /** Optional base ID for accessibility. Auto-generated if not provided */
  id?: string;
  /** Align the dropdown so the selected option covers the trigger */
  alignSelected?: boolean;
  /**
   * What happens to the input text when the popup opens (typeahead pattern):
   * - `select` (default): keep showing the current value and select it, so typing replaces it;
   * - `keep`: keep showing the current value without selecting it;
   * - `clear`: open with an empty input.
   */
  inputOnOpen?: 'select' | 'keep' | 'clear';
  /** Override default validation messages. */
  errorMessages?: Partial<Record<HeadlessComboboxErrorCode, string>>;
}

/** Scope exposed by the default slot. */
export interface HeadlessComboboxSlotProps<O, V, Q = string> {
  // State
  isOpen: boolean;
  multiple: boolean;
  disabled: boolean;
  readonly: boolean;
  searchQuery: Q | undefined;
  filteredOptions: O[];
  highlightedIndex: number;
  alignmentOffset: number;
  cssAnchorName: string;
  popupStyle: HeadlessComboboxPopupStyle;
  selectedCount: number;
  /** The currently selected values (single mode: a single-element array). */
  selectedList: V[];
  canSelectMore: boolean;
  isSelected: (option: O) => boolean;
  valid: boolean;
  errors: HeadlessComboboxErrorCode[];
  validationMessage: string;
  // ARIA prop bags (spread with v-bind)
  triggerProps: HeadlessComboboxTriggerProps;
  inputProps: HeadlessComboboxInputProps;
  comboboxInputProps: HeadlessComboboxComboboxInputProps;
  listboxProps: HeadlessComboboxListboxProps;
  getOptionProps: (option: O, index: number) => HeadlessComboboxOptionProps;
  // Actions
  setSearchQuery: (value: Q | undefined) => void;
  setHighlightedIndex: (index: number) => void;
  toggle: () => void;
  open: () => void;
  close: (returnFocus?: boolean) => void;
  select: (option: O) => void;
  clear: () => void;
  focusInput: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  // Ref setters
  setContainerRef: (el: unknown) => void;
  setTriggerRef: (el: unknown) => void;
  setDropdownRef: (el: unknown) => void;
  setInputRef: (el: unknown) => void;
  setListRef: (el: unknown) => void;
  setOptionRef: (option: O, el: unknown) => void;
}

/** Return value of `useHeadlessCombobox` — same members as the slot scope, with refs for state. */
export interface HeadlessComboboxScope<O, V, Q = string> {
  // State
  isOpen: Ref<boolean>;
  multiple: ComputedRef<boolean>;
  disabled: ComputedRef<boolean>;
  readonly: ComputedRef<boolean>;
  searchQuery: Ref<Q | undefined>;
  filteredOptions: ComputedRef<O[]>;
  highlightedIndex: Ref<number>;
  alignmentOffset: Ref<number>;
  cssAnchorName: string;
  popupStyle: ComputedRef<HeadlessComboboxPopupStyle>;
  selectedCount: ComputedRef<number>;
  selectedList: ComputedRef<V[]>;
  canSelectMore: ComputedRef<boolean>;
  isSelected: (option: O) => boolean;
  valid: ComputedRef<boolean>;
  errors: ComputedRef<HeadlessComboboxErrorCode[]>;
  validationMessage: ComputedRef<string>;
  // ARIA prop bags (spread with v-bind)
  triggerProps: ComputedRef<HeadlessComboboxTriggerProps>;
  inputProps: ComputedRef<HeadlessComboboxInputProps>;
  comboboxInputProps: ComputedRef<HeadlessComboboxComboboxInputProps>;
  listboxProps: ComputedRef<HeadlessComboboxListboxProps>;
  getOptionProps: (option: O, index: number) => HeadlessComboboxOptionProps;
  // Actions
  setSearchQuery: (value: Q | undefined) => void;
  setHighlightedIndex: (index: number) => void;
  toggle: () => void;
  open: () => Promise<void>;
  close: (returnFocus?: boolean) => void;
  select: (option: O) => void;
  clear: () => void;
  focusInput: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  // Ref setters
  setContainerRef: (el: unknown) => void;
  setTriggerRef: (el: unknown) => void;
  setDropdownRef: (el: unknown) => void;
  setInputRef: (el: unknown) => void;
  setListRef: (el: unknown) => void;
  setOptionRef: (option: O, el: unknown) => void;
}

/**
 * Accepted forms for `useHeadlessCombobox` props: a plain props object (fields
 * may be refs, which are unwrapped and tracked), a ref to a props object, or a
 * getter. Normalized internally — no `reactive()` wrapper needed by callers.
 */
export type HeadlessComboboxPropsSource<O, V = O, Q = string>
  = | HeadlessComboboxProps<O, V, Q>
    | Ref<HeadlessComboboxProps<O, V, Q>>
    | (() => HeadlessComboboxProps<O, V, Q>)
    | { [K in keyof HeadlessComboboxProps<O, V, Q>]: HeadlessComboboxProps<O, V, Q>[ K ] | Ref<HeadlessComboboxProps<O, V, Q>[ K ]> };

/** Mutable DOM refs shared by the feature composables; setters are exposed to consumers. */
export interface HeadlessComboboxDomRefs<O> {
  containerRef: HTMLElement | null;
  triggerRef: HTMLElement | null;
  dropdownRef: HTMLElement | null;
  inputRef: HTMLInputElement | null;
  listRef: HTMLElement | null;
  optionRefs: Map<O, HTMLElement>;
}

/**
 * Headless combobox state machine, usable outside the component.
 *
 * `props` accepts plain values, refs, or a getter — every field is unwrapped
 * and tracked internally, so you can bind your own `modelValue` ref directly:
 *
 * ```ts
 * useHeadlessCombobox({ modelValue: selected, options: users }, (value) => {
 *   selected.value = value;
 * });
 * ```
 *
 * The second argument receives every `update:modelValue` payload; write it
 * back to your state. Call it from `setup()` — it registers document-level
 * listeners and uses `useId()` for default accessibility ids.
 */
export function useHeadlessCombobox<O, V = O, Q = string>(
  propsSource: HeadlessComboboxPropsSource<O, V, Q>,
  emit: (value: V | V[] | null) => void,
): HeadlessComboboxScope<O, V, Q> {
  // The component's defineProps object is already reactive and passes through
  // untouched; plain objects and refs are normalized here (refs unwrapped).
  const props = reactive(toValue(propsSource)) as unknown as HeadlessComboboxProps<O, V, Q>;
  // --- Internal State ---
  const isOpen = ref(false);
  const searchQuery = ref<Q | undefined>(undefined);
  const highlightedIndex = ref(-1);
  const alignmentOffset = ref(0);

  const instanceId = props.id || useId();

  // --- Refs for DOM/Focus Management ---
  const refs: HeadlessComboboxDomRefs<O> = {
    containerRef: null,
    triggerRef: null,
    dropdownRef: null,
    inputRef: null,
    listRef: null,
    optionRefs: new Map(),
  };

  // The container/dropdown keydown listeners are attached on ref set; the
  // handler comes from useNavigation, so it is late-bound.
  /* v8 ignore next 1 -- placeholder replaced by the late binding */
  let keydownHandler: (event: KeyboardEvent) => void = () => {};

  function setContainerRef(el: unknown) {
    if (refs.containerRef != null) {
      refs.containerRef.removeEventListener('keydown', keydownHandler);
    }
    refs.containerRef = el as HTMLElement;
    // Catch keys from elements around the trigger so Tab always skips the
    // options list instead of entering it.
    if (refs.containerRef != null) {
      refs.containerRef.addEventListener('keydown', keydownHandler);
    }
  }
  function setTriggerRef(el: unknown) {
    refs.triggerRef = el as HTMLElement;
  }
  function setDropdownRef(el: unknown) {
    if (refs.dropdownRef != null) {
      refs.dropdownRef.removeEventListener('keydown', keydownHandler);
    }
    refs.dropdownRef = el as HTMLElement;
    // The popup is usually a sibling of the container, so also catch keys
    // from elements inside it (clear buttons, custom controls).
    if (refs.dropdownRef != null) {
      refs.dropdownRef.addEventListener('keydown', keydownHandler);
    }
  }
  function setInputRef(el: unknown) {
    refs.inputRef = el as HTMLInputElement;
  }
  function setListRef(el: unknown) {
    refs.listRef = el as HTMLElement;
  }
  function setOptionRef(option: O, el: unknown) {
    const key = toRaw(option);
    if (el) {
      refs.optionRefs.set(key, el as HTMLElement);
    } else { refs.optionRefs.delete(key); }
  }

  // --- Feature composables (internal split for maintainability) ---
  // The hook objects below start as placeholder no-ops and are replaced by the
  // late binding after all composables exist (they form a dependency cycle).
  /* v8 ignore start */
  const selectionHooks: SelectionHooks = { close: () => {}, maybeRefocusInput: () => {} };
  const selection = useSelection(props, emit, isOpen, selectionHooks);

  const filteringHooks: FilteringHooks = { open: async () => {} };
  const filtering = useFiltering(props, searchQuery as unknown as Ref<Q | undefined>, filteringHooks);

  const validation = useValidation(props, selection.selectedCount);

  const a11yDeps: AccessibilityDeps<O> = {
    select: () => {},
    setHighlightedIndex: () => {},
    toggle: () => {},
    handleKeydown: () => {},
    open: async () => {},
    setQueryFromEvent: () => {},
    openAndSetQueryFromEvent: () => {},
    isSelected: () => false,
    isOptionDisabled: () => false,
  };
  /* v8 ignore stop */
  const a11y = useAccessibility(props, instanceId, isOpen, highlightedIndex, a11yDeps);

  const positioning = usePositioning(props, a11y.cssAnchorName, alignmentOffset, refs, {
    selectedList: selection.selectedList,
    filteredOptions: filtering.filteredOptions,
    highlightedIndex,
    findOptionByValue: selection.findOptionByValue,
  });

  /* v8 ignore start */
  const navigationDeps: NavigationDeps<O> = {
    filteredOptions: filtering.filteredOptions,
    isOptionDisabled: selection.isOptionDisabled,
    isLocked: selection.isLocked,
    open: async () => {},
    select: selection.select,
    close: () => {},
    isInsideWidget: () => false,
    scrollToHighlight: positioning.scrollToHighlight,
    removeLastSelected: () => {},
  };
  /* v8 ignore stop */
  const navigation = useNavigation(props, isOpen, highlightedIndex, refs, navigationDeps);

  const popover = usePopover(props, isOpen, searchQuery as unknown as Ref<Q | undefined>, highlightedIndex, refs, {
    isLocked: selection.isLocked,
    selectedList: selection.selectedList,
    filteredOptions: filtering.filteredOptions,
    valueOf: selection.valueOf,
    firstActionableIndex: navigation.firstActionableIndex,
    calculateAlignment: positioning.calculateAlignment,
    scrollToHighlight: positioning.scrollToHighlight,
  });

  // --- Late-bound cross-links between the feature composables ---
  selectionHooks.close = popover.close;
  selectionHooks.maybeRefocusInput = popover.maybeRefocusInput;
  filteringHooks.open = popover.open;
  navigationDeps.open = popover.open;
  navigationDeps.close = popover.close;
  navigationDeps.isInsideWidget = popover.isInsideWidget;
  navigationDeps.removeLastSelected = selection.removeLastSelected;
  a11yDeps.select = selection.select;
  a11yDeps.setHighlightedIndex = navigation.setHighlightedIndex;
  a11yDeps.toggle = popover.toggle;
  a11yDeps.handleKeydown = navigation.handleKeydown;
  a11yDeps.open = popover.open;
  a11yDeps.setQueryFromEvent = filtering.setQueryFromEvent;
  a11yDeps.openAndSetQueryFromEvent = filtering.openAndSetQueryFromEvent;
  a11yDeps.isSelected = selection.isSelected;
  a11yDeps.isOptionDisabled = selection.isOptionDisabled;
  keydownHandler = navigation.handleKeydown;

  watch(searchQuery, () => {
    highlightedIndex.value = navigation.firstActionableIndex();
  });

  const multiple = computed(() => props.multiple === true);
  const disabled = computed(() => props.disabled === true);
  const readonly = computed(() => props.readonly === true);

  return {
    isOpen,
    multiple,
    disabled,
    readonly,
    // `ref` types the value as `UnwrapRef<Q>`; the public contract is `Q`.
    searchQuery: searchQuery as unknown as Ref<Q | undefined>,
    filteredOptions: filtering.filteredOptions,
    highlightedIndex,
    alignmentOffset,
    cssAnchorName: a11y.cssAnchorName,
    popupStyle: positioning.popupStyle,
    selectedCount: selection.selectedCount,
    selectedList: selection.selectedList,
    canSelectMore: selection.canSelectMore,
    isSelected: selection.isSelected,
    valid: validation.valid,
    errors: validation.errors,
    validationMessage: validation.validationMessage,
    triggerProps: a11y.triggerProps,
    inputProps: a11y.inputProps,
    comboboxInputProps: a11y.comboboxInputProps,
    listboxProps: a11y.listboxProps,
    getOptionProps: a11y.getOptionProps,
    setSearchQuery: filtering.setSearchQuery,
    setHighlightedIndex: navigation.setHighlightedIndex,
    toggle: popover.toggle,
    open: popover.open,
    close: popover.close,
    select: selection.select,
    clear: selection.clear,
    focusInput: popover.focusInput,
    handleKeydown: navigation.handleKeydown,
    setContainerRef,
    setTriggerRef,
    setDropdownRef,
    setInputRef,
    setListRef,
    setOptionRef,
  };
}
