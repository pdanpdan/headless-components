import type { AdapterId } from './adapter-examples';

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface ScopeGroup {
  title: string;
  description: string;
  rows: PropRow[];
}

export interface AdapterDoc {
  id: AdapterId;
  label: string;
  packageName: string;
  repoUrl: string;
  summary: string;
  apiNote: string;
  component: string;
  composable: string;
  spread: string;
  scopeNote: string;
  emits?: PropRow[];
}

export const ADAPTER_DOCS: Record<AdapterId, AdapterDoc> = {
  vue: {
    id: 'vue',
    label: 'Vue',
    packageName: '@pdanpdan/headless-combobox-vue',
    repoUrl: 'https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox-vue',
    summary: 'A renderless Vue 3 component with a scoped slot. Bind v-model for a controlled value, or omit it and let the component keep the selection.',
    apiNote: 'The component emits `update:modelValue`; `v-model` writes it back. The slot scope contains refs.',
    component: 'HeadlessCombobox',
    composable: 'useHeadlessCombobox',
    spread: 'Spread a prop bag with `v-bind`.',
    scopeNote: 'The component renders its default slot with this scope. State entries are refs; actions and ref setters are plain functions.',
    emits: [
      { name: 'update:modelValue', type: 'V | V[] | null', description: 'Emitted when the selection changes. `v-model` writes it back to the bound ref.' },
    ],
  },
  react: {
    id: 'react',
    label: 'React',
    packageName: '@pdanpdan/headless-combobox-react',
    repoUrl: 'https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox-react',
    summary: 'A render-prop component. Pass value and onChange for a controlled combobox, or omit value and use defaultValue for an uncontrolled one.',
    apiNote: 'The component and `useHeadlessCombobox` share the same options and return the same scope object.',
    component: 'HeadlessCombobox',
    composable: 'useHeadlessCombobox',
    spread: 'Spread the React-ready prop bags directly.',
    scopeNote: 'The render prop receives this scope object. The hook returns the same object.',
  },
  svelte: {
    id: 'svelte',
    label: 'Svelte',
    packageName: '@pdanpdan/headless-combobox-svelte',
    repoUrl: 'https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox-svelte',
    summary: 'A renderless Svelte 5 component with a children snippet. modelValue is optional; without onChange the component keeps the selection internally.',
    apiNote: 'The component and `createComboboxStore` share the same props. `createComboboxStore` returns a store; read it with `$combobox`.',
    component: 'HeadlessCombobox',
    composable: 'createComboboxStore',
    spread: 'Spread the Svelte-ready prop bags directly.',
    scopeNote: 'The children snippet receives this scope. The store exposes the same values through `$combobox`.',
  },
  solid: {
    id: 'solid',
    label: 'Solid',
    packageName: '@pdanpdan/headless-combobox-solid',
    repoUrl: 'https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox-solid',
    summary: 'A render-prop component for Solid 2. The render prop receives an accessor, so call scope() inside JSX to keep bindings reactive.',
    apiNote: 'The component and `useHeadlessCombobox` return an accessor. Call it inside JSX, not once at the top.',
    component: 'HeadlessCombobox',
    composable: 'useHeadlessCombobox',
    spread: 'Spread the Solid-ready prop bags directly.',
    scopeNote: 'The render prop receives an accessor. Call `scope()` to read these values; the hook returns the same accessor.',
  },
  angular: {
    id: 'angular',
    label: 'Angular',
    packageName: '@pdanpdan/headless-combobox-angular',
    repoUrl: 'https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox-angular',
    summary: 'A signals store. Call injectCombobox from an injection context and read combobox.snapshot() in the template. Angular gets a store rather than a render-prop component.',
    apiNote: 'There is no Angular component wrapper. The store exposes the same state, actions, and ref setters through its snapshot signal.',
    component: 'none',
    composable: 'injectCombobox',
    spread: 'Bind the attributes you need from `combobox.snapshot()`; Angular templates cannot spread a prop object.',
    scopeNote: 'Read these values from `combobox.snapshot()`. The store exposes the same values as a signal.',
  },
};

export const BASE_PROPS: PropRow[] = [
  {
    name: 'options',
    type: 'O[]',
    default: 'n/a',
    description: 'List of options.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Enable multiple selection.',
  },
  {
    name: 'minLength',
    type: 'number',
    default: 'n/a',
    description: 'Multiple: minimum number of selected options (validation).',
  },
  {
    name: 'maxLength',
    type: 'number',
    default: 'n/a',
    description: 'Multiple: maximum selected. Blocks adding beyond it.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Require a selection (single: a value; multiple: at least one).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disable the control: not focusable, cannot open or change.',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Read-only: focusable, shows the value, but cannot open or change.',
  },
  {
    name: 'closeOnSelect',
    type: 'boolean | null',
    default: '!multiple',
    description: 'Close the dropdown after selecting.',
  },
  {
    name: 'closeOnClickOutside',
    type: 'boolean',
    default: 'true',
    description: 'Close when clicking outside the widget boundary.',
  },
  {
    name: 'clickOutsideFilter',
    type: '(target: EventTarget | null) => boolean',
    default: 'n/a',
    description: 'Return false to keep the dropdown open for an outside target.',
  },
  {
    name: 'selectOnTab',
    type: 'boolean',
    default: 'false',
    description: 'On Tab, when focus leaves the widget: select the highlighted option and close.',
  },
  {
    name: 'optionValue',
    type: '(option: O) => V',
    default: 'option itself',
    description: 'Maps an option to the value stored in the model.',
  },
  {
    name: 'valueEqual',
    type: '(a: V, b: V) => boolean',
    default: 'proxy-unwrapped identity',
    description: 'Compare stored values by ID or another stable key when proxies or clones differ.',
  },
  {
    name: 'optionLabel',
    type: '(option: O) => string',
    default: 'String(option)',
    description: 'Maps an option to a string for filtering and rendering.',
  },
  {
    name: 'optionFilter',
    type: '(option: O, query: Q) => boolean',
    default: 'substring',
    description: 'Custom filter function. Q defaults to string.',
  },
  {
    name: 'id',
    type: 'string',
    default: 'generated',
    description: 'Base id for accessibility attributes.',
  },
  {
    name: 'alignSelected',
    type: 'boolean',
    default: 'false',
    description: 'Align the dropdown so the selected option covers the trigger.',
  },
  {
    name: 'errorMessages',
    type: 'Partial<Record<HeadlessComboboxErrorCode, string>>',
    default: 'n/a',
    description: 'Override default validation messages.',
  },
  {
    name: 'creatable',
    type: 'boolean',
    default: 'false',
    description: 'Offer to commit the typed query as a new value when no option matches.',
  },
  {
    name: 'createOption',
    type: '(query: Q) => V | null | undefined',
    default: 'n/a',
    description: 'Builds the value stored by `createSelection` and by Enter when nothing is highlighted.',
  },
];

export const VALUE_PROPS: Record<AdapterId, PropRow[]> = {
  vue: [
    {
      name: 'v-model',
      type: 'V | V[] | null',
      default: 'internal',
      description: 'Binds `modelValue` and writes `update:modelValue` back to your state.',
    },
    {
      name: 'modelValue',
      type: 'V | V[] | null',
      default: 'internal',
      description: 'Selected value(s). Omit it to let the component keep the selection internally.',
    },
  ],
  react: [
    {
      name: 'value',
      type: 'V | V[] | null',
      default: 'n/a',
      description: 'Controlled value. Omit it for uncontrolled usage.',
    },
    {
      name: 'defaultValue',
      type: 'V | V[] | null',
      default: 'null',
      description: 'Initial value when `value` is omitted.',
    },
    {
      name: 'onChange',
      type: '(value: V | V[] | null) => void',
      default: 'n/a',
      description: 'Called for every selection change.',
    },
  ],
  svelte: [
    {
      name: 'modelValue',
      type: 'V | V[] | null',
      default: 'internal',
      description: 'Selected value(s). Omit `onChange` to keep the selection inside the component.',
    },
    {
      name: 'onChange',
      type: '(value: V | V[] | null) => void',
      default: 'n/a',
      description: 'Called for every selection change.',
    },
  ],
  solid: [
    {
      name: 'value',
      type: 'V | V[] | null',
      default: 'n/a',
      description: 'Controlled value. Omit it for uncontrolled usage.',
    },
    {
      name: 'defaultValue',
      type: 'V | V[] | null',
      default: 'null',
      description: 'Initial value when `value` is omitted.',
    },
    {
      name: 'onChange',
      type: '(value: V | V[] | null) => void',
      default: 'n/a',
      description: 'Called for every selection change.',
    },
  ],
  angular: [
    {
      name: 'props',
      type: 'HeadlessComboboxProps<O, V, Q> | (() => HeadlessComboboxProps<O, V, Q>)',
      default: 'n/a',
      description: 'Props object or getter. The value is passed as `props.modelValue`.',
    },
    {
      name: 'onChange',
      type: '(value: V | V[] | null) => void',
      default: 'n/a',
      description: 'Called for every selection change.',
    },
    {
      name: 'injector',
      type: 'Injector',
      default: 'current injector',
      description: 'Used for `afterNextRender` ticking when creating the store outside DI.',
    },
  ],
};

export const STATE_ROWS: PropRow[] = [
  { name: 'isOpen', type: 'boolean', description: 'Whether the dropdown is open.' },
  { name: 'multiple', type: 'boolean', description: 'Whether multiple selection is enabled.' },
  { name: 'disabled', type: 'boolean', description: 'Whether the control is disabled.' },
  { name: 'readonly', type: 'boolean', description: 'Whether the control is read-only.' },
  { name: 'searchQuery', type: 'Q | undefined', description: 'Current search query. Q defaults to string.' },
  { name: 'filteredOptions', type: 'T[]', description: 'Options after applying the filter.' },
  { name: 'highlightedIndex', type: 'number', description: 'Index of the highlighted option (-1 when none).' },
  { name: 'alignmentOffset', type: 'number', description: 'Pixel offset used for alignment.' },
  { name: 'cssAnchorName', type: 'string', description: 'Unique CSS anchor-name for popover positioning.' },
  { name: 'popupStyle', type: 'HeadlessComboboxPopupStyle', description: 'Default popup positioning style. Spread or merge it onto the dropdown.' },
  { name: 'selectedCount', type: 'number', description: 'Number of selected options.' },
  { name: 'selectedList', type: 'V[]', description: 'Selected values (single mode: a single-element array).' },
  { name: 'canSelectMore', type: 'boolean', description: 'False when at `maxLength` (multiple).' },
  { name: 'isSelected', type: '(option: T) => boolean', description: 'Whether an option is selected, using `valueEqual` when provided.' },
  { name: 'canCreate', type: 'boolean', description: 'Whether the typed query can be committed as a new value (`creatable`).' },
  { name: 'valid', type: 'boolean', description: 'Whether the current selection passes validation.' },
  { name: 'errors', type: 'HeadlessComboboxErrorCode[]', description: "Active validation errors ('required' | 'minlength' | 'maxlength')." },
  { name: 'validationMessage', type: 'string', description: 'Human-readable message for the first error.' },
  { name: 'statusMessage', type: 'string', description: 'Filtered result count for a polite live region; empty while closed.' },
];

export const KEYBOARD_ROWS: PropRow[] = [
  { name: 'Enter / Space / ArrowDown / ArrowUp', type: 'popup closed', description: 'Open the dropdown from the trigger. In a typeahead input, Enter and the arrows open it; Space and printable keys edit the query.' },
  { name: 'Backspace / Delete', type: 'popup closed, or open without a filter input', description: 'Remove the last (or only) selected option. Text inputs keep their native editing behavior.' },
  { name: 'ArrowDown / ArrowUp', type: 'popup open', description: 'Move the highlight; wraps around and skips disabled options.' },
  { name: 'PageDown / PageUp', type: 'popup open', description: 'Move the highlight a full page (visible options), clamped at the ends.' },
  { name: 'Home / End', type: 'popup open', description: 'Jump to the first or last selectable option (native caret behavior in inputs).' },
  { name: 'Enter', type: 'popup open', description: 'Select the highlighted option, or create the typed query when `canCreate`.' },
  { name: 'Space', type: 'popup open', description: 'Does nothing on the trigger; options and text entries keep their native behavior.' },
  { name: 'Tab / Shift+Tab', type: 'popup open', description: 'Skip the options list to the next focusable element; closes when focus leaves the widget (selectOnTab selects first).' },
  { name: 'Escape', type: 'popup open', description: 'Close the popup and return focus to the trigger.' },
];

export const ACTION_ROWS: PropRow[] = [
  { name: 'toggle', type: '() => void', description: 'Toggle the dropdown open or closed.' },
  { name: 'open', type: '() => Promise<void>', description: 'Open the dropdown.' },
  { name: 'close', type: '(returnFocus?: boolean) => void', description: 'Close the dropdown.' },
  { name: 'select', type: '(option: T) => void', description: 'Select (single) or toggle (multiple) an option.' },
  { name: 'createSelection', type: '() => void', description: 'Commit the typed query as a new value. No-op unless `canCreate`.' },
  { name: 'clear', type: '() => void', description: 'Clear the selection (null or []).' },
  { name: 'setSearchQuery', type: '(value: Q | undefined) => void', description: 'Update the search query.' },
  { name: 'setHighlightedIndex', type: '(index: number) => void', description: 'Set the highlighted option. Wire it to hover to match keyboard behavior.' },
  { name: 'focusInput', type: '() => void', description: 'Focus the filter input while the popup stays open.' },
  { name: 'handleKeydown', type: '(event: KeyboardEvent) => void', description: 'Keyboard navigation handler.' },
  { name: 'handleTypeaheadKeydown', type: '(event: KeyboardEvent) => void', description: 'Keyboard handler for typeahead inputs; Space types instead of activating.' },
];

export const REF_ROWS: PropRow[] = [
  { name: 'setContainerRef', type: 'ref fn', description: 'The root container. Auto-discovers the trigger, input, listbox, and dropdown; explicit refs override it.' },
  { name: 'setTriggerRef', type: 'ref fn', description: 'Optional explicit trigger override.' },
  { name: 'setDropdownRef', type: 'ref fn', description: 'Optional explicit popup override.' },
  { name: 'setInputRef', type: 'ref fn', description: 'Optional explicit search/typeahead input override.' },
  { name: 'setListRef', type: 'ref fn', description: 'Optional explicit options list override.' },
  { name: 'setOptionRef', type: '(option, el) => void', description: 'Optional per-option ref. Needed for virtualized windows; standard rendered lists fall back to `aria-posinset`.' },
];

export const ARIA_ROWS: PropRow[] = [
  { name: 'triggerProps', type: 'HeadlessComboboxTriggerProps', description: 'role=combobox, aria-expanded, aria-activedescendant, toggle and keydown handlers.' },
  { name: 'inputProps', type: 'HeadlessComboboxInputProps', description: 'Search input attributes, native autocomplete off, aria-activedescendant, and keydown handling.' },
  { name: 'comboboxInputProps', type: 'HeadlessComboboxComboboxInputProps', description: 'Typeahead input attributes, native autocomplete off, open, focus, input, and Space-safe keydown handlers.' },
  { name: 'listboxProps', type: 'HeadlessComboboxListboxProps', description: 'role=listbox and aria-multiselectable.' },
  { name: 'statusProps', type: 'HeadlessComboboxStatusProps', description: 'role=status, aria-live=polite, aria-atomic; spread on the status message element.' },
  { name: 'getOptionProps', type: '(option, index?) => HeadlessComboboxOptionProps', description: 'role=option, aria-selected, aria-disabled, aria-posinset, aria-setsize, and select and highlight handlers. The index is derived from filteredOptions when omitted.' },
];

export function scopeGroups(adapter: AdapterId): ScopeGroup[] {
  const doc = ADAPTER_DOCS[ adapter ];
  return [
    {
      title: 'State',
      description: 'Live values for the current selection and popup.',
      rows: STATE_ROWS,
    },
    {
      title: 'ARIA prop bags',
      description: doc.spread,
      rows: ARIA_ROWS,
    },
    {
      title: 'Actions',
      description: 'Methods that drive the combobox.',
      rows: ACTION_ROWS,
    },
    {
      title: 'Ref setters',
      description: 'Attach elements to the store. Bind only the elements your markup uses.',
      rows: REF_ROWS,
    },
  ];
}

export function valueProps(adapter: AdapterId): PropRow[] {
  return [
    ...VALUE_PROPS[ adapter ],
    ...BASE_PROPS,
  ];
}
