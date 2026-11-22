import type { AccessibilityDeps } from './accessibility';
import type { ComboboxContext, ComboboxState } from './context';
import type { FilteringHooks } from './filtering';
import type { NavigationDeps } from './navigation';
import type { PopoverDeps } from './popover';
import type { ComboboxRuntimeOverrides } from './runtime';
import type { SelectionHooks } from './selection';
import type { HeadlessComboboxDomRefs, HeadlessComboboxProps, HeadlessComboboxSnapshot } from './types';

import { createAccessibility } from './accessibility';
import { createFiltering } from './filtering';
import { createNavigation } from './navigation';
import { createPopover } from './popover';
import { createPositioning } from './positioning';
import { createRuntime } from './runtime';
import { createSelection } from './selection';
import { createValidation } from './validation';

/** Store surface the adapters drive. All UI state lives in `getSnapshot()`. */
export interface ComboboxStore<O, V, Q = string> {
  /** Current flat state + actions. Stable identity until something changes. */
  getSnapshot: () => HeadlessComboboxSnapshot<O, V, Q>;
  /** Subscribe to state/props changes. Returns the unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
  /** Push new props (from the adapter's reactive layer). No-op when shallow-equal. */
  setProps: (props: HeadlessComboboxProps<O, V, Q>) => void;
  /** Override individual state fields (adapter-backed writable refs). */
  setState: (patch: Partial<ComboboxState<Q>>) => void;
  /** Attach document-level listeners. Idempotent; safe on the server. */
  mount: () => void;
  /** Remove listeners and drop subscribers. */
  destroy: () => void;
}

export interface CreateComboboxOptions<O, V, Q = string> {
  props: HeadlessComboboxProps<O, V, Q>;
  /** Receives every model change (`select`, `clear`, backspace removal). */
  onChange?: (value: V | V[] | null) => void;
  /** Framework hooks: tick, unwrap, id generation, document lookup. */
  runtime?: ComboboxRuntimeOverrides;
}

const UNSET = Symbol('unset');
type PendingModel<V> = V | V[] | null | typeof UNSET;

/**
 * Framework-independent combobox state machine.
 *
 * The store owns every piece of behavior: selection, filtering, validation,
 * keyboard navigation, popup lifecycle, anchoring, and focus management. It
 * touches the DOM only after `mount()` and only through the element refs the
 * adapter wires up. Framework adapters translate its snapshot into their own
 * reactive primitive and implement `nextTick`/`unwrap`/`createId`.
 */
export function createCombobox<O, V, Q = string>(
  options: CreateComboboxOptions<O, V, Q>,
): ComboboxStore<O, V, Q> {
  const runtime = createRuntime(options.runtime);

  const state: ComboboxState<Q> = {
    isOpen: false,
    searchQuery: undefined,
    highlightedIndex: -1,
    alignmentOffset: 0,
  };

  const refs: HeadlessComboboxDomRefs<O> = {
    containerRef: null,
    triggerRef: null,
    dropdownRef: null,
    inputRef: null,
    listRef: null,
    optionRefs: new Map(),
  };

  let props = options.props;
  let pendingModel: PendingModel<V> = UNSET;
  let version = 0;
  let batchDepth = 0;
  let dirty = false;
  let mounted = false;

  const subscribers = new Set<() => void>();

  function notify() {
    for (const listener of [ ...subscribers ]) {
      listener();
    }
  }

  function bump() {
    version++;
    if (batchDepth > 0) {
      dirty = true;
      return;
    }
    notify();
  }

  function mutate<T>(fn: () => T): T {
    batchDepth++;
    try {
      return fn();
    } finally {
      batchDepth--;
      if (batchDepth === 0 && dirty) {
        dirty = false;
        notify();
      }
    }
  }

  function getModelValue(): V | V[] | null {
    return pendingModel === UNSET
      ? props.modelValue
      : pendingModel;
  }

  function emitModel(value: V | V[] | null) {
    pendingModel = value;
    bump();
    options.onChange?.(value);
  }

  const ctx: ComboboxContext<O, V, Q> = {
    get props() {
      return props;
    },
    state,
    refs,
    runtime,
    get version() {
      return version;
    },
    mutate,
    bump,
    getModelValue,
    emitModel,
    nextTick: () => runtime.nextTick(),
    unwrap: runtime.unwrap,
    valuesEqual: (a, b) => props.valueEqual?.(a, b) ?? runtime.unwrap(a) === runtime.unwrap(b),
  };

  // --- Feature modules (dependency cycle broken with late-bound hooks) ---
  const selectionHooks: SelectionHooks = {
    /* v8 ignore next 1 */
    close: () => {},
    /* v8 ignore next 1 */
    maybeRefocusInput: () => {},
  };
  const selection = createSelection(ctx, selectionHooks);

  const filteringHooks: FilteringHooks = {
    /* v8 ignore next 1 */
    open: async () => {},
  };
  const filtering = createFiltering(ctx, filteringHooks);

  const validation = createValidation(ctx, selection.getSelectedCount);

  const accessibilityDeps: AccessibilityDeps<O> = {
    /* v8 ignore next 1 */
    select: () => {},
    /* v8 ignore next 1 */
    setHighlightedIndex: () => {},
    /* v8 ignore next 1 */
    toggle: () => {},
    /* v8 ignore next 1 */
    handleKeydown: () => {},
    /* v8 ignore next 1 */
    handleTypeaheadKeydown: () => {},
    /* v8 ignore next 1 */
    getFilteredOptions: () => [],
    /* v8 ignore next 1 */
    open: async () => {},
    /* v8 ignore next 1 */
    openFromFocus: () => {},
    /* v8 ignore next 1 */
    setQueryFromEvent: () => {},
    /* v8 ignore next 1 */
    openAndSetQueryFromEvent: () => {},
    /* v8 ignore next 1 */
    isSelected: () => false,
    /* v8 ignore next 1 */
    isOptionDisabled: () => false,
  };
  const accessibility = createAccessibility(
    ctx,
    props.id || runtime.createId(),
    accessibilityDeps,
  );

  const positioning = createPositioning(ctx, accessibility.cssAnchorName, refs, {
    getSelectedList: selection.getSelectedList,
    getFilteredOptions: filtering.getFilteredOptions,
    findOptionByValue: selection.findOptionByValue,
  });

  const navigationDeps: NavigationDeps<O> = {
    getFilteredOptions: filtering.getFilteredOptions,
    isOptionDisabled: selection.isOptionDisabled,
    isLocked: selection.isLocked,
    /* v8 ignore next 1 */
    open: async () => {},
    select: selection.select,
    /* v8 ignore next 1 */
    close: () => {},
    /* v8 ignore next 1 */
    isInsideWidget: () => false,
    scrollToHighlight: positioning.scrollToHighlight,
    /* v8 ignore next 1 */
    removeLastSelected: () => {},
    /* v8 ignore next 1 */
    canCreate: () => false,
    /* v8 ignore next 1 */
    createSelection: () => {},
  };
  const navigation = createNavigation(ctx, refs, navigationDeps);

  const popoverDeps: PopoverDeps<O, V> = {
    isLocked: selection.isLocked,
    getSelectedList: selection.getSelectedList,
    getFilteredOptions: filtering.getFilteredOptions,
    valueOf: selection.valueOf,
    firstActionableIndex: navigation.firstActionableIndex,
    calculateAlignment: positioning.calculateAlignment,
    scrollToHighlight: positioning.scrollToHighlight,
  };
  const popover = createPopover(ctx, refs, popoverDeps);

  // --- Late-bound cross-links ---
  selectionHooks.close = popover.close;
  selectionHooks.maybeRefocusInput = popover.maybeRefocusInput;
  filteringHooks.open = popover.open;
  filteringHooks.onQueryChange = () => {
    ctx.mutate(() => {
      ctx.state.highlightedIndex = navigation.firstActionableIndex();
      ctx.bump();
    });
  };
  navigationDeps.open = popover.open;
  navigationDeps.close = popover.close;
  navigationDeps.isInsideWidget = popover.isInsideWidget;
  navigationDeps.removeLastSelected = selection.removeLastSelected;
  navigationDeps.canCreate = selection.getCanCreate;
  navigationDeps.createSelection = selection.createSelection;
  accessibilityDeps.select = selection.select;
  accessibilityDeps.setHighlightedIndex = navigation.setHighlightedIndex;
  accessibilityDeps.toggle = popover.toggle;
  accessibilityDeps.handleKeydown = navigation.handleKeydown;
  accessibilityDeps.handleTypeaheadKeydown = navigation.handleTypeaheadKeydown;
  accessibilityDeps.getFilteredOptions = filtering.getFilteredOptions;
  accessibilityDeps.open = popover.open;
  accessibilityDeps.openFromFocus = popover.openFromFocus;
  accessibilityDeps.setQueryFromEvent = filtering.setQueryFromEvent;
  accessibilityDeps.openAndSetQueryFromEvent = filtering.openAndSetQueryFromEvent;
  accessibilityDeps.isSelected = selection.isSelected;
  accessibilityDeps.isOptionDisabled = selection.isOptionDisabled;

  // --- Element refs ---
  // The handler is late-bound because navigation is created after the refs.
  const keydownHandler = (event: Event) => navigation.handleKeydown(event);

  let containerObserver: MutationObserver | null = null;

  function discoverRefs(root: HTMLElement) {
    if (refs.containerRef !== root) {
      return;
    }
    const trigger = root.querySelector<HTMLElement>('[role="combobox"]');
    if (trigger && (refs.triggerRef == null || !refs.triggerRef.isConnected)) {
      setTriggerRef(trigger);
    }
    const controlsId = trigger?.getAttribute('aria-controls');
    const list = (controlsId
      ? root.ownerDocument.getElementById(controlsId)
      : null)
    ?? root.querySelector<HTMLElement>('[role="listbox"]');
    if (list) {
      if (refs.listRef == null || !refs.listRef.isConnected) {
        setListRef(list);
      }
      const dropdown = list.closest<HTMLElement>('[popover]') ?? list;
      if (refs.dropdownRef == null || !refs.dropdownRef.isConnected) {
        setDropdownRef(dropdown);
      }
    }
    const input = trigger instanceof HTMLInputElement
      ? trigger
      : (list?.closest<HTMLElement>('[popover]') ?? list?.parentElement ?? list)
        ?.querySelector<HTMLInputElement>('[role="searchbox"]')
        ?? root.querySelector<HTMLInputElement>('[role="searchbox"]');
    if (input && (refs.inputRef == null || !refs.inputRef.isConnected)) {
      setInputRef(input);
    }
  }

  function queueRefDiscovery(root: HTMLElement) {
    queueMicrotask(() => discoverRefs(root));
  }

  function setContainerRef(el: unknown) {
    if (refs.containerRef != null) {
      refs.containerRef.removeEventListener('keydown', keydownHandler);
    }
    refs.containerRef = el as HTMLElement | null;
    containerObserver?.disconnect();
    containerObserver = null;
    // Catch keys from elements around the trigger so Tab always skips the
    // options list instead of entering it.
    if (refs.containerRef != null) {
      refs.containerRef.addEventListener('keydown', keydownHandler);
      const root = refs.containerRef;
      discoverRefs(root);
      if (typeof MutationObserver !== 'undefined') {
        containerObserver = new MutationObserver(() => queueRefDiscovery(root));
        containerObserver.observe(root, {
          attributes: true,
          attributeFilter: [
            'aria-controls',
            'aria-expanded',
            'id',
            'role',
          ],
          childList: true,
          subtree: true,
        });
      }
    }
  }
  function setTriggerRef(el: unknown) {
    refs.triggerRef = el as HTMLElement | null;
  }
  function setDropdownRef(el: unknown) {
    if (refs.dropdownRef != null) {
      refs.dropdownRef.removeEventListener('keydown', keydownHandler);
    }
    refs.dropdownRef = el as HTMLElement | null;
    // The popup is usually a sibling of the container, so also catch keys
    // from elements inside it (clear buttons, custom controls).
    if (refs.dropdownRef != null) {
      refs.dropdownRef.addEventListener('keydown', keydownHandler);
    }
  }
  function setInputRef(el: unknown) {
    refs.inputRef = el as HTMLInputElement | null;
  }
  function setListRef(el: unknown) {
    refs.listRef = el as HTMLElement | null;
  }
  function setOptionRef(option: O, el: unknown) {
    const key = runtime.unwrap(option);
    if (el) {
      refs.optionRefs.set(key, el as HTMLElement);
    } else { refs.optionRefs.delete(key); }
  }

  // --- Snapshot ---
  // Result counts are the useful thing to announce while filtering. The region
  // is rendered by the consumer and stays empty while the popup is closed.
  function getStatusMessage(): string {
    if (!state.isOpen) {
      return '';
    }
    const count = filtering.getFilteredOptions().length;
    if (count === 0) {
      return 'No results found.';
    }
    return `${ count } result${ count === 1
      ? ''
      : 's' } available.`;
  }

  let cachedSnapshot: HeadlessComboboxSnapshot<O, V, Q> | undefined;
  let cachedVersion = -1;

  function getSnapshot(): HeadlessComboboxSnapshot<O, V, Q> {
    if (cachedSnapshot !== undefined && cachedVersion === version) {
      return cachedSnapshot;
    }

    const selectedList = selection.getSelectedList();
    cachedSnapshot = {
      isOpen: state.isOpen,
      multiple: props.multiple === true,
      disabled: props.disabled === true,
      readonly: props.readonly === true,
      searchQuery: state.searchQuery,
      filteredOptions: filtering.getFilteredOptions(),
      highlightedIndex: state.highlightedIndex,
      alignmentOffset: state.alignmentOffset,
      cssAnchorName: accessibility.cssAnchorName,
      popupStyle: positioning.getPopupStyle(),
      selectedCount: selectedList.length,
      selectedList,
      canSelectMore: selection.getCanSelectMore(),
      isSelected: selection.isSelected,
      canCreate: selection.getCanCreate(),
      valid: validation.getValid(),
      errors: validation.getErrors(),
      validationMessage: validation.getValidationMessage(),
      statusMessage: getStatusMessage(),
      triggerProps: accessibility.getTriggerProps(),
      inputProps: accessibility.getInputProps(),
      comboboxInputProps: accessibility.getComboboxInputProps(),
      listboxProps: accessibility.getListboxProps(),
      statusProps: accessibility.statusProps,
      getOptionProps: accessibility.getOptionProps,
      setSearchQuery: filtering.setSearchQuery,
      setHighlightedIndex: navigation.setHighlightedIndex,
      toggle: popover.toggle,
      open: popover.open,
      close: popover.close,
      select: selection.select,
      createSelection: selection.createSelection,
      clear: selection.clear,
      focusInput: popover.focusInput,
      handleKeydown: navigation.handleKeydown,
      handleTypeaheadKeydown: navigation.handleTypeaheadKeydown,
      setContainerRef,
      setTriggerRef,
      setDropdownRef,
      setInputRef,
      setListRef,
      setOptionRef,
    };
    cachedVersion = version;
    return cachedSnapshot;
  }

  function setProps(next: HeadlessComboboxProps<O, V, Q>) {
    const previous = props as unknown as Record<string, unknown>;
    const incoming = next as unknown as Record<string, unknown>;
    let changed = false;

    for (const key of new Set([
      ...Object.keys(previous),
      ...Object.keys(incoming),
    ])) {
      if (!Object.is(previous[ key ], incoming[ key ])) {
        changed = true;
        break;
      }
    }

    props = next;
    // Any props round-trip is authoritative: once the adapter has pushed the
    // new model back, the local mirror is no longer needed.
    if (pendingModel !== UNSET) {
      pendingModel = UNSET;
      changed = true;
    }

    if (changed) {
      bump();
    }
  }

  function setState(patch: Partial<ComboboxState<Q>>) {
    let changed = false;
    for (const key of Object.keys(patch) as Array<keyof ComboboxState<Q>>) {
      if (!Object.is(state[ key ], patch[ key ])) {
        state[ key ] = patch[ key ] as never;
        changed = true;
      }
    }
    if (changed) {
      bump();
    }
  }

  function subscribe(listener: () => void) {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  }

  function mount() {
    if (mounted) {
      return;
    }
    const doc = runtime.getDocument();
    if (!doc) {
      return;
    }
    mounted = true;
    doc.addEventListener('mousedown', popover.handleClickOutside);
    doc.addEventListener('keydown', popover.handleDocumentKeydown);
  }

  function destroy() {
    const doc = runtime.getDocument();
    if (doc && mounted) {
      doc.removeEventListener('mousedown', popover.handleClickOutside);
      doc.removeEventListener('keydown', popover.handleDocumentKeydown);
    }
    mounted = false;
    containerObserver?.disconnect();
    containerObserver = null;
    refs.containerRef?.removeEventListener('keydown', keydownHandler);
    refs.dropdownRef?.removeEventListener('keydown', keydownHandler);
    subscribers.clear();
  }

  return {
    getSnapshot,
    subscribe,
    setProps,
    setState,
    mount,
    destroy,
  };
}
