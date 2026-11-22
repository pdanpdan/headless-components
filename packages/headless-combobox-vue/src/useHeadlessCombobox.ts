import type {
  HeadlessComboboxProps,
  HeadlessComboboxSnapshot,
} from '@pdanpdan/headless-combobox-core';
import type { ComputedRef, Ref } from 'vue';

import { createCombobox } from '@pdanpdan/headless-combobox-core';
import {
  computed,
  getCurrentInstance,
  isRef,
  nextTick,
  onMounted,
  onUnmounted,
  shallowRef,
  toRaw,
  useId,
  watch,
} from 'vue';

export type {
  HeadlessComboboxComboboxInputProps,
  HeadlessComboboxErrorCode,
  HeadlessComboboxInputProps,
  HeadlessComboboxListboxProps,
  HeadlessComboboxOptionProps,
  HeadlessComboboxPopupStyle,
  HeadlessComboboxProps,
  HeadlessComboboxTriggerProps,
} from '@pdanpdan/headless-combobox-core';

/** Scope exposed by the default slot: plain values, no refs. */
export type HeadlessComboboxSlotProps<O, V, Q = string> = HeadlessComboboxSnapshot<O, V, Q>;

/**
 * Accepted forms for `useHeadlessCombobox` props: a plain props object (fields
 * may be refs, which are unwrapped and tracked), a ref to a props object, or a
 * getter. Normalized internally, so no `reactive()` wrapper needed by callers.
 */
export type HeadlessComboboxPropsSource<O, V = O, Q = string>
  = | HeadlessComboboxProps<O, V, Q>
    | Ref<HeadlessComboboxProps<O, V, Q>>
    | (() => HeadlessComboboxProps<O, V, Q>)
    | { [K in keyof HeadlessComboboxProps<O, V, Q>]: HeadlessComboboxProps<O, V, Q>[ K ] | Ref<HeadlessComboboxProps<O, V, Q>[ K ]> };

/** Return value of `useHeadlessCombobox`: Vue refs for state, stable actions. */
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
  popupStyle: ComputedRef<HeadlessComboboxSnapshot<O, V, Q>[ 'popupStyle' ]>;
  selectedCount: ComputedRef<number>;
  selectedList: ComputedRef<V[]>;
  canSelectMore: ComputedRef<boolean>;
  isSelected: (option: O) => boolean;
  valid: ComputedRef<boolean>;
  errors: ComputedRef<HeadlessComboboxSnapshot<O, V, Q>[ 'errors' ]>;
  validationMessage: ComputedRef<string>;
  // ARIA prop bags (spread with v-bind)
  triggerProps: ComputedRef<HeadlessComboboxSnapshot<O, V, Q>[ 'triggerProps' ]>;
  inputProps: ComputedRef<HeadlessComboboxSnapshot<O, V, Q>[ 'inputProps' ]>;
  comboboxInputProps: ComputedRef<HeadlessComboboxSnapshot<O, V, Q>[ 'comboboxInputProps' ]>;
  listboxProps: ComputedRef<HeadlessComboboxSnapshot<O, V, Q>[ 'listboxProps' ]>;
  getOptionProps: (option: O, index: number) => HeadlessComboboxSnapshot<O, V, Q>[ 'getOptionProps' ] extends (option: O, index: number) => infer R
    ? R
    : never;
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

/** The props fields read from a props source; a fixed list keeps tracking deterministic. */
const PROP_KEYS = [
  'modelValue',
  'options',
  'multiple',
  'minLength',
  'maxLength',
  'required',
  'disabled',
  'readonly',
  'closeOnSelect',
  'closeOnClickOutside',
  'clickOutsideFilter',
  'selectOnTab',
  'optionValue',
  'optionLabel',
  'optionFilter',
  'id',
  'alignSelected',
  'inputOnOpen',
  'errorMessages',
] as const;

function resolveProps<O, V, Q>(source: HeadlessComboboxPropsSource<O, V, Q>): HeadlessComboboxProps<O, V, Q> {
  const base = isRef(source)
    ? source.value
    : typeof source === 'function'
      ? source()
      : source;
  const resolved: Record<string, unknown> = {};
  for (const key of PROP_KEYS) {
    const value = (base as Record<string, unknown>)[ key ];
    resolved[ key ] = isRef(value)
      ? value.value
      : value;
  }
  return resolved as unknown as HeadlessComboboxProps<O, V, Q>;
}

/**
 * Vue adapter for the framework-independent combobox core.
 *
 * Returns Vue refs backed by the core snapshot. Call it from `setup()`; it
 * mounts the document listeners and uses Vue's `useId()` for default ids.
 */
export function useHeadlessCombobox<O, V = O, Q = string>(
  propsSource: HeadlessComboboxPropsSource<O, V, Q>,
  emit: (value: V | V[] | null) => void,
): HeadlessComboboxScope<O, V, Q> {
  const resolvedProps = computed(() => resolveProps(propsSource));
  const instance = getCurrentInstance();
  const generatedId = instance
    ? useId()
    : undefined;

  const store = createCombobox<O, V, Q>({
    props: resolvedProps.value,
    onChange: emit,
    runtime: {
      nextTick: () => nextTick(),
      unwrap: (value) => toRaw(value),
      getDocument: () => (typeof document === 'undefined'
        ? null
        : document),
      ...(generatedId != null
        ? {
          createId: () => generatedId,
        }
        : {}),
    },
  });

  const snapshot = shallowRef(store.getSnapshot());
  const unsubscribe = store.subscribe(() => {
    snapshot.value = store.getSnapshot();
  });

  // Props may be Vue-reactive (component props) or contain refs (composable
  // callers). The computed tracks both; push each change into the core.
  watch(resolvedProps, (next) => store.setProps(next), { immediate: true });

  if (instance) {
    onMounted(() => store.mount());
    onUnmounted(() => {
      unsubscribe();
      store.destroy();
    });
  } else {
    store.mount();
  }

  const isSelected = (option: O) => store.getSnapshot().isSelected(option);
  const getOptionProps = (option: O, index: number) =>
    store.getSnapshot().getOptionProps(option, index);

  return {
    isOpen: computed({
      get: () => snapshot.value.isOpen,
      set: (value) => store.setState({ isOpen: value }),
    }),
    multiple: computed(() => snapshot.value.multiple),
    disabled: computed(() => snapshot.value.disabled),
    readonly: computed(() => snapshot.value.readonly),
    searchQuery: computed({
      get: () => snapshot.value.searchQuery,
      set: (value) => store.getSnapshot().setSearchQuery(value),
    }),
    filteredOptions: computed(() => snapshot.value.filteredOptions),
    highlightedIndex: computed({
      get: () => snapshot.value.highlightedIndex,
      set: (value) => store.setState({ highlightedIndex: value }),
    }),
    alignmentOffset: computed({
      get: () => snapshot.value.alignmentOffset,
      set: (value) => store.setState({ alignmentOffset: value }),
    }),
    cssAnchorName: snapshot.value.cssAnchorName,
    popupStyle: computed(() => snapshot.value.popupStyle),
    selectedCount: computed(() => snapshot.value.selectedCount),
    selectedList: computed(() => snapshot.value.selectedList),
    canSelectMore: computed(() => snapshot.value.canSelectMore),
    isSelected,
    valid: computed(() => snapshot.value.valid),
    errors: computed(() => snapshot.value.errors),
    validationMessage: computed(() => snapshot.value.validationMessage),
    triggerProps: computed(() => snapshot.value.triggerProps),
    inputProps: computed(() => snapshot.value.inputProps),
    comboboxInputProps: computed(() => snapshot.value.comboboxInputProps),
    listboxProps: computed(() => snapshot.value.listboxProps),
    getOptionProps,
    setSearchQuery: (value) => store.getSnapshot().setSearchQuery(value),
    setHighlightedIndex: (index) => store.getSnapshot().setHighlightedIndex(index),
    toggle: () => store.getSnapshot().toggle(),
    open: () => store.getSnapshot().open(),
    close: (returnFocus) => store.getSnapshot().close(returnFocus),
    select: (option) => store.getSnapshot().select(option),
    clear: () => store.getSnapshot().clear(),
    focusInput: () => store.getSnapshot().focusInput(),
    handleKeydown: (event) => store.getSnapshot().handleKeydown(event),
    setContainerRef: (el) => store.getSnapshot().setContainerRef(el),
    setTriggerRef: (el) => store.getSnapshot().setTriggerRef(el),
    setDropdownRef: (el) => store.getSnapshot().setDropdownRef(el),
    setInputRef: (el) => store.getSnapshot().setInputRef(el),
    setListRef: (el) => store.getSnapshot().setListRef(el),
    setOptionRef: (option, el) => store.getSnapshot().setOptionRef(option, el),
  };
}
