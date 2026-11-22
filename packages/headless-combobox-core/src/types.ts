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
  onKeydown: (event: Event) => void;
}

export interface HeadlessComboboxInputProps {
  id: string;
  role: 'searchbox';
  'aria-autocomplete': 'list';
  'aria-controls': string;
  'aria-activedescendant': string | undefined;
  onInput: (event: Event) => void;
  onKeydown: (event: Event) => void;
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
  onKeydown: (event: Event) => void;
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

/** Flat state and actions exposed by the state machine. */
export interface HeadlessComboboxSnapshot<O, V, Q = string> {
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
  // ARIA prop bags (spread onto your markup)
  triggerProps: HeadlessComboboxTriggerProps;
  inputProps: HeadlessComboboxInputProps;
  comboboxInputProps: HeadlessComboboxComboboxInputProps;
  listboxProps: HeadlessComboboxListboxProps;
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
  handleKeydown: (event: Event) => void;
  // Element wiring
  setContainerRef: (el: unknown) => void;
  setTriggerRef: (el: unknown) => void;
  setDropdownRef: (el: unknown) => void;
  setInputRef: (el: unknown) => void;
  setListRef: (el: unknown) => void;
  setOptionRef: (option: O, el: unknown) => void;
}

/** Mutable DOM refs shared by the feature modules. */
export interface HeadlessComboboxDomRefs<O> {
  containerRef: HTMLElement | null;
  triggerRef: HTMLElement | null;
  dropdownRef: HTMLElement | null;
  inputRef: HTMLInputElement | null;
  listRef: HTMLElement | null;
  optionRefs: Map<O, HTMLElement>;
}
