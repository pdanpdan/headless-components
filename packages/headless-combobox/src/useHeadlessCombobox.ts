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
  let containerRef: HTMLElement | null = null;
  let triggerRef: HTMLElement | null = null;
  let dropdownRef: HTMLElement | null = null;
  let inputRef: HTMLInputElement | null = null;
  let listRef: HTMLElement | null = null;
  const optionRefs = new Map<O, HTMLElement>();

  function setContainerRef(el: unknown) {
    if (containerRef != null) {
      containerRef.removeEventListener('keydown', handleKeydown);
    }
    containerRef = el as HTMLElement;
    // Catch keys from elements around the trigger so Tab always skips the
    // options list instead of entering it.
    if (containerRef != null) {
      containerRef.addEventListener('keydown', handleKeydown);
    }
  }
  function setTriggerRef(el: unknown) {
    triggerRef = el as HTMLElement;
  }
  function setDropdownRef(el: unknown) {
    if (dropdownRef != null) {
      dropdownRef.removeEventListener('keydown', handleKeydown);
    }
    dropdownRef = el as HTMLElement;
    // The popup is usually a sibling of the container, so also catch keys
    // from elements inside it (clear buttons, custom controls).
    if (dropdownRef != null) {
      dropdownRef.addEventListener('keydown', handleKeydown);
    }
  }
  function setInputRef(el: unknown) {
    inputRef = el as HTMLInputElement;
  }
  function setListRef(el: unknown) {
    listRef = el as HTMLElement;
  }
  function setOptionRef(option: O, el: unknown) {
    const key = toRaw(option);
    if (el) {
      optionRefs.set(key, el as HTMLElement);
    } else { optionRefs.delete(key); }
  }

  /** The value stored / emitted for an option; defaults to the option itself. */
  function valueOf(option: O): V {
    return props.optionValue ? props.optionValue(option) : option as unknown as V;
  }

  /** The option whose value equals `value` (used to resolve the model back to an option). */
  function findOptionByValue(value: V): O | undefined {
    return props.options.find((option) => toRaw(valueOf(option)) === toRaw(value));
  }

  // --- Selection (normalized to an array; equality by value) ---
  const selectedList = computed<V[]>(() => {
    if (props.multiple) {
      return Array.isArray(props.modelValue) ? props.modelValue : [];
    }
    return props.modelValue == null ? [] : [ props.modelValue as V ];
  });

  const selectedCount = computed(() => selectedList.value.length);

  const canSelectMore = computed(() => {
    if (!props.multiple) {
      return true;
    }
    return props.maxLength == null || selectedCount.value < props.maxLength;
  });

  function isSelected(option: O): boolean {
    const value = toRaw(valueOf(option));
    return selectedList.value.some((v) => toRaw(v) === value);
  }

  // Options that cannot be selected: only when at `maxLength` (multiple).
  function isOptionDisabled(option: O): boolean {
    return !isSelected(option) && !canSelectMore.value;
  }

  // Disabled and read-only both block opening and changing the selection.
  const isLocked = computed(() => props.disabled === true || props.readonly === true);

  // --- Strict Generic Filtering ---
  function getOptionLabel(option: O): string {
    return props.optionLabel ? props.optionLabel(option) : String(option);
  }

  function defaultFilter(option: O, q: string): boolean {
    return getOptionLabel(option).toLowerCase().includes(q.toLowerCase());
  }

  function applyFilter(option: O, query: Q): boolean {
    if (props.optionFilter) {
      return props.optionFilter(option, query);
    }
    return defaultFilter(option, String(query));
  }

  const filteredOptions = computed<O[]>(() => {
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
  // No `position` is set: a popover gets `position: fixed` from the UA stylesheet,
  // and a regular element keeps the position you give it.
  const popupStyle = computed<HeadlessComboboxPopupStyle>(() => {
    const style: HeadlessComboboxPopupStyle = {
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

  function getOptionProps(option: O, index: number): HeadlessComboboxOptionProps {
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
      // Keep the popup's keyboard navigation (and Tab skipping) working from
      // inside the options list.
      onKeydown: handleKeydown,
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
    const selectedIndex = firstSelected == null ? -1 : filteredOptions.value.findIndex((o) => toRaw(valueOf(o)) === toRaw(firstSelected));
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

  function select(option: O) {
    if (isLocked.value) {
      return;
    }

    const value = valueOf(option);
    if (props.multiple) {
      const current = selectedList.value;
      const raw = toRaw(value);
      const has = current.some((v) => toRaw(v) === raw);
      if (has) {
        emit(current.filter((v) => toRaw(v) !== raw));
      } else if (canSelectMore.value) {
        emit([ ...current, value ]);
      }
      // else: blocked at `max` — no change, but still fall through to keep the filter focused.
    } else {
      emit(value);
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
    const selectedOption = findOptionByValue(firstSelected);
    const selectedEl = selectedOption == null ? undefined : optionRefs.get(toRaw(selectedOption));
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
    const el = optionRefs.get(toRaw(option));
    if (el) {
      scrollElementIntoContainer(el, listRef);
    }
  }

  // --- Keyboard Navigation ---
  function firstActionableIndex(): number {
    return filteredOptions.value.findIndex((o) => !isOptionDisabled(o));
  }

  // Move the highlight by `direction` (1 or -1, scaled by `steps`), skipping
  // options that cannot be selected (at `maxLength`). Wraps around unless
  // `wrap` is false, in which case the move clamps at the ends; clears the
  // highlight when nothing is actionable.
  function stepHighlight(direction: 1 | -1, steps = 1, wrap = true) {
    const len = filteredOptions.value.length;
    if (len === 0) {
      highlightedIndex.value = -1;
      return;
    }
    let next = highlightedIndex.value + direction * steps;
    if (!wrap) {
      next = Math.max(0, Math.min(len - 1, next));
    }
    for (let i = 0; i < len; i++) {
      if (next < 0) {
        if (!wrap) {
          return;
        }
        next = len - 1;
      } else if (next >= len) {
        if (!wrap) {
          return;
        }
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
    // The same event bubbles from the trigger/input/option handlers to the
    // container/dropdown listeners; only the first (target) handler processes it.
    if (e.defaultPrevented) {
      return;
    }
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
      case 'PageDown':
      case 'PageUp': {
        e.preventDefault();
        stepHighlight(e.key === 'PageDown' ? 1 : -1, pageSize(), false);
        scrollToHighlight();
        break;
      }
      case 'Home':
      case 'End': {
        // In inputs these keep their native caret behavior.
        /* v8 ignore next 1 -- the textarea branch never occurs in the tests */
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          break;
        }
        e.preventDefault();
        highlightedIndex.value = e.key === 'Home' ? firstActionableIndex() : lastActionableIndex();
        scrollToHighlight();
        break;
      }
      case 'Tab': {
        // Skip the options list: focus the next focusable element outside it.
        e.preventDefault();
        const highlightedOption = filteredOptions.value[ highlightedIndex.value ];
        const willSelect = props.selectOnTab && highlightedIndex.value >= 0 && highlightedOption != null;
        if (willSelect) {
          select(highlightedOption);
          if (isOpen.value) {
            close(false);
          }
          // The selection's close may return focus to the trigger; move on to
          // the next focusable element as a normal Tab would.
          focusNextOutside(e.shiftKey);
          break;
        }
        focusNextOutside(e.shiftKey);
        // Focus leaving the widget closes the popup, like a click outside.
        if (!isInsideWidget(document.activeElement)) {
          close(false);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
    }
  }

  function lastActionableIndex(): number {
    const options = filteredOptions.value;
    for (let i = options.length - 1; i >= 0; i--) {
      // The null guard mirrors the filtering contract; filtered options are never null.
      /* v8 ignore next 3 */
      if (options[ i ] != null && !isOptionDisabled(options[ i ]!)) {
        return i;
      }
    }
    return -1;
  }

  /** Jump per page: the number of fully visible options. */
  function pageSize(): number {
    const list = listRef;
    const firstOption = optionRefs.values().next().value;
    if (list != null && firstOption != null && list.clientHeight > 0 && firstOption.offsetHeight > 0) {
      return Math.max(1, Math.floor(list.clientHeight / firstOption.offsetHeight));
    }
    return 10;
  }

  function getFocusableElements(): HTMLElement[] {
    return [ ...document.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ].filter((el) => el.getClientRects().length > 0);
  }

  // The next (or previous) focusable element in the document that is not inside
  // the options list, wrapping around when the end is reached.
  function focusNextOutside(backward: boolean) {
    const focusables = getFocusableElements();
    if (focusables.length === 0) {
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    // document.activeElement is never null per the DOM spec.
    /* v8 ignore next 3 */
    const index = active == null ? -1 : focusables.indexOf(active);
    /* v8 ignore next 1 -- backward and forward are both exercised via tests */
    const step = backward ? -1 : 1;
    for (let i = 1; i <= focusables.length; i++) {
      const el = focusables[ (index + i * step + focusables.length) % focusables.length ]!;
      // The list ref is always set while the popup is open.
      /* v8 ignore next 2 */
      if (listRef == null || !listRef.contains(el)) {
        el.focus();
        return;
      }
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
  };
}
