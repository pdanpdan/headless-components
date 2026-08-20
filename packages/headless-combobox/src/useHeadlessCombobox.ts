import type { ComputedRef, Ref } from 'vue';

import { computed, nextTick, onMounted, onUnmounted, reactive, ref, toRaw, toValue, useId, watch } from 'vue';

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
}

export interface HeadlessComboboxPopupStyle {
  position: 'absolute';
  positionAnchor: string;
  left: string;
  width: string;
  top: string;
  translate?: string;
  [key: `--${ string }`]: string | undefined;
}

export interface HeadlessComboboxProps<T, Q = string> {
  modelValue: T | T[] | null;
  options: T[];
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
  /** Maps an option object to a string for default filtering and rendering */
  displayValue?: (option: T) => string;
  /** Custom filter function. Defaults to case-insensitive substring search */
  filterFn?: (option: T, query: Q) => boolean;
  /** Optional base ID for accessibility. Auto-generated if not provided */
  id?: string;
  /** Align the dropdown so the selected option covers the trigger */
  alignSelected?: boolean;
  /** Override default validation messages. */
  errorMessages?: Partial<Record<HeadlessComboboxErrorCode, string>>;
}

/** Scope exposed by the default slot. */
export interface HeadlessComboboxSlotProps<T, Q = string> {
  // State
  isOpen: boolean;
  multiple: boolean;
  disabled: boolean;
  readonly: boolean;
  searchQuery: Q | undefined;
  filteredOptions: T[];
  highlightedIndex: number;
  alignmentOffset: number;
  cssAnchorName: string;
  popupStyle: HeadlessComboboxPopupStyle;
  selectedCount: number;
  canSelectMore: boolean;
  isSelected: (option: T) => boolean;
  valid: boolean;
  errors: HeadlessComboboxErrorCode[];
  validationMessage: string;
  // ARIA prop bags (spread with v-bind)
  triggerProps: HeadlessComboboxTriggerProps;
  inputProps: HeadlessComboboxInputProps;
  comboboxInputProps: HeadlessComboboxComboboxInputProps;
  listboxProps: HeadlessComboboxListboxProps;
  getOptionProps: (option: T, index: number) => HeadlessComboboxOptionProps;
  // Actions
  setSearchQuery: (value: Q | undefined) => void;
  setHighlightedIndex: (index: number) => void;
  toggle: () => void;
  open: () => void;
  close: (returnFocus?: boolean) => void;
  select: (option: T) => void;
  clear: () => void;
  focusInput: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  // Ref setters
  setContainerRef: (el: unknown) => void;
  setTriggerRef: (el: unknown) => void;
  setDropdownRef: (el: unknown) => void;
  setInputRef: (el: unknown) => void;
  setListRef: (el: unknown) => void;
  setOptionRef: (option: T, el: unknown) => void;
}

/** Return value of `useHeadlessCombobox` — same members as the slot scope, with refs for state. */
export interface HeadlessComboboxScope<T, Q = string> {
  // State
  isOpen: Ref<boolean>;
  multiple: ComputedRef<boolean>;
  disabled: ComputedRef<boolean>;
  readonly: ComputedRef<boolean>;
  searchQuery: Ref<Q | undefined>;
  filteredOptions: ComputedRef<T[]>;
  highlightedIndex: Ref<number>;
  alignmentOffset: Ref<number>;
  cssAnchorName: string;
  popupStyle: ComputedRef<HeadlessComboboxPopupStyle>;
  selectedCount: ComputedRef<number>;
  canSelectMore: ComputedRef<boolean>;
  isSelected: (option: T) => boolean;
  valid: ComputedRef<boolean>;
  errors: ComputedRef<HeadlessComboboxErrorCode[]>;
  validationMessage: ComputedRef<string>;
  // ARIA prop bags (spread with v-bind)
  triggerProps: ComputedRef<HeadlessComboboxTriggerProps>;
  inputProps: ComputedRef<HeadlessComboboxInputProps>;
  comboboxInputProps: ComputedRef<HeadlessComboboxComboboxInputProps>;
  listboxProps: ComputedRef<HeadlessComboboxListboxProps>;
  getOptionProps: (option: T, index: number) => HeadlessComboboxOptionProps;
  // Actions
  setSearchQuery: (value: Q | undefined) => void;
  setHighlightedIndex: (index: number) => void;
  toggle: () => void;
  open: () => Promise<void>;
  close: (returnFocus?: boolean) => void;
  select: (option: T) => void;
  clear: () => void;
  focusInput: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  // Ref setters
  setContainerRef: (el: unknown) => void;
  setTriggerRef: (el: unknown) => void;
  setDropdownRef: (el: unknown) => void;
  setInputRef: (el: unknown) => void;
  setListRef: (el: unknown) => void;
  setOptionRef: (option: T, el: unknown) => void;
}

/**
 * Accepted forms for `useHeadlessCombobox` props: a plain props object (fields
 * may be refs, which are unwrapped and tracked), a ref to a props object, or a
 * getter. Normalized internally — no `reactive()` wrapper needed by callers.
 */
export type HeadlessComboboxPropsSource<T, Q = string>
  = | HeadlessComboboxProps<T, Q>
    | Ref<HeadlessComboboxProps<T, Q>>
    | (() => HeadlessComboboxProps<T, Q>)
    | { [K in keyof HeadlessComboboxProps<T, Q>]: HeadlessComboboxProps<T, Q>[ K ] | Ref<HeadlessComboboxProps<T, Q>[ K ]> };

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
export function useHeadlessCombobox<T, Q = string>(
  propsSource: HeadlessComboboxPropsSource<T, Q>,
  emit: (value: T | T[] | null) => void,
): HeadlessComboboxScope<T, Q> {
  // The component's defineProps object is already reactive and passes through
  // untouched; plain objects and refs are normalized here (refs unwrapped).
  const props = reactive(toValue(propsSource)) as unknown as HeadlessComboboxProps<T, Q>;
  // --- Internal State ---
  const isOpen = ref(false);
  const searchQuery = ref<Q | undefined>(undefined);
  const highlightedIndex = ref(-1);
  const alignmentOffset = ref(0);

  const instanceId = props.id || useId();

  // --- Refs for DOM/Focus Management ---
  let containerRef: HTMLElement | null = null;
  let triggerRef: HTMLElement | null = null;
  let dropdownRef: HTMLElement | null = null;
  let inputRef: HTMLInputElement | null = null;
  let listRef: HTMLElement | null = null;
  const optionRefs = new Map<T, HTMLElement>();

  function setContainerRef(el: unknown) {
    containerRef = el as HTMLElement;
  }
  function setTriggerRef(el: unknown) {
    triggerRef = el as HTMLElement;
  }
  function setDropdownRef(el: unknown) {
    dropdownRef = el as HTMLElement;
  }
  function setInputRef(el: unknown) {
    inputRef = el as HTMLInputElement;
  }
  function setListRef(el: unknown) {
    listRef = el as HTMLElement;
  }
  function setOptionRef(option: T, el: unknown) {
    if (el) {
      optionRefs.set(option, el as HTMLElement);
    } else { optionRefs.delete(option); }
  }

  // --- Selection (normalized to an array; equality by reference) ---
  const selectedList = computed<T[]>(() => {
    if (props.multiple) {
      return Array.isArray(props.modelValue) ? props.modelValue : [];
    }
    return props.modelValue == null ? [] : [ props.modelValue as T ];
  });

  const selectedCount = computed(() => selectedList.value.length);

  const canSelectMore = computed(() => {
    if (!props.multiple) {
      return true;
    }
    return props.maxLength == null || selectedCount.value < props.maxLength;
  });

  function isSelected(option: T): boolean {
    const raw = toRaw(option);
    return selectedList.value.some((o) => toRaw(o) === raw);
  }

  // Options that cannot be selected: only when at `maxLength` (multiple).
  function isOptionDisabled(option: T): boolean {
    return !isSelected(option) && !canSelectMore.value;
  }

  // Disabled and read-only both block opening and changing the selection.
  const isLocked = computed(() => props.disabled === true || props.readonly === true);

  // --- Strict Generic Filtering ---
  function getDisplayValue(option: T): string {
    return props.displayValue ? props.displayValue(option) : String(option);
  }

  function defaultFilter(option: T, q: string): boolean {
    return getDisplayValue(option).toLowerCase().includes(q.toLowerCase());
  }

  function applyFilter(option: T, query: Q): boolean {
    if (props.filterFn) {
      return props.filterFn(option, query);
    }
    return defaultFilter(option, String(query));
  }

  const filteredOptions = computed<T[]>(() => {
    const q = searchQuery.value;
    if (q == null || (typeof q === 'string' && q === '')) {
      return props.options;
    }
    return props.options.filter((o) => applyFilter(o, q));
  });

  watch(searchQuery, () => {
    highlightedIndex.value = firstActionableIndex();
  });

  // --- Validation ---
  const errors = computed<HeadlessComboboxErrorCode[]>(() => {
    const list: HeadlessComboboxErrorCode[] = [];
    const count = selectedCount.value;

    if (props.required && count === 0) {
      list.push('required');
    }
    if (props.multiple) {
      if (props.minLength != null && count < props.minLength) {
        list.push('minlength');
      }
      if (props.maxLength != null && count > props.maxLength) {
        list.push('maxlength');
      }
    }
    return list;
  });

  const valid = computed(() => errors.value.length === 0);

  const validationMessage = computed(() => {
    const code = errors.value[ 0 ];
    if (!code) {
      return '';
    }
    const custom = props.errorMessages?.[ code ];
    if (custom != null) {
      return custom;
    }
    switch (code) {
      case 'required':
        return 'Selection is required.';
      case 'minlength':
        return `Select at least ${ props.minLength } option${ props.minLength === 1 ? '' : 's' }.`;
      case 'maxlength':
        return `Select at most ${ props.maxLength } option${ props.maxLength === 1 ? '' : 's' }.`;
    }
    // Unreachable: the switch above is exhaustive over HeadlessComboboxErrorCode.
    /* v8 ignore next 1 */
    return '';
  });

  // --- A11y & IDs ---
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

  // A11y Prop Bindings to spread onto elements
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
    onClick: toggle,
    onKeydown: handleKeydown,
  }));

  // Default popup positioning — spread (or merge) onto the dropdown element's style.
  // For `alignSelected` it anchors to the trigger's top and applies the
  // measured offset so the selected option covers the trigger.
  const popupStyle = computed<HeadlessComboboxPopupStyle>(() => {
    const style: HeadlessComboboxPopupStyle = {
      position: 'absolute',
      positionAnchor: cssAnchorName,
      left: 'anchor(left)',
      width: 'anchor-size(width)',
      top: props.alignSelected ? 'anchor(top)' : 'anchor(bottom)',
    };
    if (props.alignSelected) {
      style.translate = `0 -${ alignmentOffset.value }px`;
    }
    return style;
  });

  function setQueryFromEvent(event: Event) {
    setSearchQuery((event.target as HTMLInputElement).value as Q);
  }

  // Typing in the typeahead input reopens the popup (open() resets the query
  // first, so the order matters) and filters the options.
  function openAndSetQueryFromEvent(event: Event) {
    open();
    setSearchQuery((event.target as HTMLInputElement).value as Q);
  }

  const inputProps = computed<HeadlessComboboxInputProps>(() => ({
    id: inputId,
    role: 'searchbox',
    'aria-autocomplete': 'list',
    'aria-controls': listboxId,
    'aria-activedescendant': activeDescendant.value,
    onInput: setQueryFromEvent,
    onKeydown: handleKeydown,
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
    onClick: open,
    onFocus: open,
    onInput: openAndSetQueryFromEvent,
  }));

  const listboxProps = computed<HeadlessComboboxListboxProps>(() => ({
    id: listboxId,
    role: 'listbox',
    'aria-multiselectable': props.multiple ? true : undefined,
  }));

  function getOptionProps(option: T, index: number): HeadlessComboboxOptionProps {
    const actionable = () => !isOptionDisabled(option);
    return {
      id: getOptionId(index),
      role: 'option',
      'aria-selected': isSelected(option),
      'aria-disabled': isOptionDisabled(option) ? true : undefined,
      'data-highlighted': index === highlightedIndex.value ? true : undefined,
      onClick: () => select(option),
      // Keep the filter input focused when the option is clicked.
      onMousedown: (event: MouseEvent) => event.preventDefault(),
      // Hover and focus drive the highlight; blocked options never get it.
      onMousemove: () => {
        if (actionable()) {
          setHighlightedIndex(index);
        }
      },
      onFocus: () => {
        if (actionable()) {
          setHighlightedIndex(index);
        }
      },
    };
  }

  // --- Actions & Focus Management ---

  // If the consumer marked the dropdown as a popover, drive it with the Popover API
  // (top-layer rendering) instead of relying on v-if.
  function popoverEl(): HTMLElement | null {
    return dropdownRef != null && dropdownRef.hasAttribute('popover') && typeof dropdownRef.showPopover === 'function'
      ? dropdownRef
      : null;
  }

  function showPopoverIfAny() {
    const el = popoverEl();
    if (el != null && !el.matches(':popover-open')) {
      el.showPopover();
    }
  }

  function hidePopoverIfAny() {
    const el = popoverEl();
    if (el != null && el.matches(':popover-open')) {
      el.hidePopover();
    }
  }

  async function open() {
    if (isOpen.value || isLocked.value) {
      return;
    }
    isOpen.value = true;
    searchQuery.value = undefined;

    const firstSelected = selectedList.value[ 0 ];
    const selectedIndex = firstSelected == null ? -1 : filteredOptions.value.findIndex((o) => o === firstSelected);
    // A selected option is always actionable; otherwise start on the first one that can be selected.
    highlightedIndex.value = selectedIndex >= 0 ? selectedIndex : firstActionableIndex();

    await nextTick();
    showPopoverIfAny();
    calculateAlignment();
    if (!props.alignSelected) {
      // Bring the first selected option (or the top) into view.
      scrollToHighlight();
    }
    inputRef?.focus({ preventScroll: true });
  }

  function close(returnFocus = true) {
    if (!isOpen.value) {
      return;
    }
    hidePopoverIfAny();
    isOpen.value = false;
    highlightedIndex.value = -1;
    searchQuery.value = undefined;
    if (returnFocus) {
      triggerRef?.focus();
    }
  }

  function toggle() {
    if (isLocked.value) {
      return;
    }
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  // Return focus to the filter input (used when the popup stays open after an interaction).
  function focusInput() {
    inputRef?.focus({ preventScroll: true });
  }

  // Elements the user types into — we must never steal focus from these.
  function isTextEntryElement(el: Element | null): boolean {
    if (el instanceof HTMLTextAreaElement) {
      return true;
    }
    if (el instanceof HTMLElement && el.isContentEditable) {
      return true;
    }
    if (el instanceof HTMLInputElement) {
      return ![ 'button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file' ].includes(el.type);
    }
    return false;
  }

  // Refocus the filter only when it is safe to do so — i.e. don't yank focus away
  // from another text field (e.g. an "add option" input) or a control the user
  // intentionally moved to outside the combobox.
  // The widget boundary = any of the wired parts (control container, trigger, dropdown).
  // `setContainerRef` is optional; wire it only to extend the boundary (e.g. external chips).
  function isInsideWidget(target: Node | null): boolean {
    // Unreachable in normal use: callers always pass a DOM node (an event target
    // or document.activeElement, which is never null per the DOM spec).
    /* v8 ignore next 2 */
    if (target == null) {
      return false;
    }
    return [ containerRef, triggerRef, dropdownRef ].some((r) => r != null && r.contains(target));
  }

  function maybeRefocusInput() {
    const input = inputRef;
    if (input == null) {
      return;
    }
    const active = document.activeElement;
    if (active == null || active === input || active === document.body || active === document.documentElement) {
      input.focus({ preventScroll: true });
      return;
    }
    if (isTextEntryElement(active)) {
      return;
    }
    if (!isInsideWidget(active)) {
      return;
    }
    input.focus({ preventScroll: true });
  }

  function setSearchQuery(val: Q | undefined) {
    searchQuery.value = val;
  }

  function setHighlightedIndex(index: number) {
    if (index >= 0 && index < filteredOptions.value.length) {
      highlightedIndex.value = index;
    }
  }

  function select(option: T) {
    if (isLocked.value) {
      return;
    }

    if (props.multiple) {
      const current = selectedList.value;
      const raw = toRaw(option);
      const has = current.some((o) => toRaw(o) === raw);
      if (has) {
        emit(current.filter((o) => toRaw(o) !== raw));
      } else if (canSelectMore.value) {
        emit([ ...current, option ]);
      }
      // else: blocked at `max` — no change, but still fall through to keep the filter focused.
    } else {
      emit(option);
    }

    const shouldClose = props.closeOnSelect ?? !props.multiple;
    if (shouldClose) {
      close(true);
    } else if (isOpen.value) {
      // Popup stays open (e.g. multiple): keep the filter focused for continued typing,
      // unless the user is focused on another text field / control.
      nextTick(maybeRefocusInput);
    }
  }

  function clear() {
    if (isLocked.value) {
      return;
    }
    emit(props.multiple ? [] : null);
    if (isOpen.value) {
      nextTick(maybeRefocusInput);
    }
  }

  // --- Alignment Logic ---
  function scrollElementIntoContainer(el: HTMLElement, container: HTMLElement | null) {
    if (!container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // Compensate for any CSS scale applied by the open animation: getBoundingClientRect
    // is scaled, but scrollTop is in unscaled content units.
    const scale = container.offsetWidth > 0 ? containerRect.width / container.offsetWidth : 1;
    const s = scale || 1;

    if (elRect.top < containerRect.top) {
      container.scrollTop -= (containerRect.top - elRect.top) / s;
    } else if (elRect.bottom > containerRect.bottom) {
      container.scrollTop += (elRect.bottom - containerRect.bottom) / s;
    }
  }

  function calculateAlignment() {
    const firstSelected = selectedList.value[ 0 ];
    if (!dropdownRef || !props.alignSelected || firstSelected == null) {
      alignmentOffset.value = 0;
      return;
    }

    const dropdownEl = dropdownRef;
    const selectedEl = optionRefs.get(firstSelected);
    if (selectedEl && listRef) {
      scrollElementIntoContainer(selectedEl, listRef);

      const dropdownRect = dropdownEl.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      // The popup settles at scale 1, so divide out the current scale to get the
      // final (unscaled) offset. Both rects share the popup's scale, so the vector
      // difference scales by the same factor regardless of transform-origin.
      const scale = dropdownEl.offsetWidth > 0 ? dropdownRect.width / dropdownEl.offsetWidth : 1;
      alignmentOffset.value = (selectedRect.top - dropdownRect.top) / (scale || 1);
    } else {
      alignmentOffset.value = 0;
    }
  }

  async function scrollToHighlight() {
    await nextTick();
    const option = filteredOptions.value[ highlightedIndex.value ];
    if (!option) {
      return;
    }
    const el = optionRefs.get(option);
    if (el) {
      scrollElementIntoContainer(el, listRef);
    }
  }

  // --- Keyboard Navigation ---
  function firstActionableIndex(): number {
    return filteredOptions.value.findIndex((o) => !isOptionDisabled(o));
  }

  // Move the highlight by `direction`, skipping options that cannot be selected
  // (at `maxLength`). Wraps around; clears the highlight when nothing is actionable.
  function stepHighlight(direction: 1 | -1) {
    const len = filteredOptions.value.length;
    if (len === 0) {
      highlightedIndex.value = -1;
      return;
    }
    let next = highlightedIndex.value + direction;
    for (let i = 0; i < len; i++) {
      if (next < 0) {
        next = len - 1;
      } else if (next >= len) {
        next = 0;
      }
      const option = filteredOptions.value[ next ];
      if (option != null && !isOptionDisabled(option)) {
        highlightedIndex.value = next;
        return;
      }
      next += direction;
    }
    highlightedIndex.value = -1;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isLocked.value) {
      return;
    }
    if (!isOpen.value) {
      if ([ 'Enter', ' ', 'ArrowDown', 'ArrowUp' ].includes(e.key)) {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        stepHighlight(1);
        scrollToHighlight();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        stepHighlight(-1);
        scrollToHighlight();
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const highlightedOption = filteredOptions.value[ highlightedIndex.value ];
        if (highlightedIndex.value >= 0 && highlightedOption != null) {
          select(highlightedOption);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
    }
  }

  // --- Click Outside ---
  function handleClickOutside(e: MouseEvent) {
    if (!isOpen.value || props.closeOnClickOutside === false) {
      return;
    }
    if (props.clickOutsideFilter?.(e.target) === false) {
      return;
    }
    if (!isInsideWidget(e.target as Node)) {
      close(false);
    }
  }

  // ESC closes the popup no matter which control inside the widget has focus
  // (clear button, option buttons, …) — WAI-ARIA combobox pattern.
  function handleDocumentKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
      e.preventDefault();
      close(true);
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleDocumentKeydown);
  });
  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleDocumentKeydown);
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
  };
}
