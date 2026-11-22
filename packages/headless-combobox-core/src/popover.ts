import type { ComboboxContext } from './context';
import type { HeadlessComboboxDomRefs } from './types';

/** The state and actions the popup lifecycle needs. */
export interface PopoverDeps<O, V> {
  isLocked: () => boolean;
  getSelectedList: () => V[];
  getFilteredOptions: () => O[];
  valueOf: (option: O) => V;
  firstActionableIndex: () => number;
  calculateAlignment: () => void;
  scrollToHighlight: () => Promise<void>;
}

// Elements the user types into. We must never steal focus from these.
function isTextEntryElement(el: Element | null): boolean {
  if (el instanceof HTMLTextAreaElement) {
    return true;
  }
  if (el instanceof HTMLElement && el.isContentEditable) {
    return true;
  }
  if (el instanceof HTMLInputElement) {
    return ![
      'button',
      'submit',
      'reset',
      'checkbox',
      'radio',
      'range',
      'color',
      'file',
      'hidden',
      'image',
    ].includes(el.type);
  }
  return false;
}

/** The open/close lifecycle, the Popover API, focus management, and the outside-close guards. */
export function createPopover<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  refs: HeadlessComboboxDomRefs<O>,
  deps: PopoverDeps<O, V>,
) {
  // If the consumer marked the dropdown as a popover, drive it with the Popover API
  // (top-layer rendering) instead of relying on conditional rendering.
  function popoverEl(): HTMLElement | null {
    return refs.dropdownRef != null && refs.dropdownRef.hasAttribute('popover') && typeof refs.dropdownRef.showPopover === 'function'
      ? refs.dropdownRef
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

  // Closing returns focus to the trigger. In the typeahead pattern the trigger
  // is the text input whose focus handler opens the popup, so refocusing would
  // immediately reopen it. Ignore focus-driven opens for one task after close.
  let suppressFocusOpen = false;
  let suppressFocusGeneration = 0;

  function suppressNextFocusOpen() {
    suppressFocusOpen = true;
    const generation = ++suppressFocusGeneration;
    setTimeout(() => {
      if (generation === suppressFocusGeneration) {
        suppressFocusOpen = false;
      }
    }, 0);
  }

  function openFromFocus() {
    if (suppressFocusOpen) {
      return;
    }
    open();
  }

  async function open(selectText = true) {
    if (ctx.state.isOpen || deps.isLocked()) {
      return;
    }
    ctx.mutate(() => {
      ctx.state.isOpen = true;
      // `clear` opens with an empty input; otherwise the query stays empty and
      // the input keeps showing the current value (typeahead examples fall back
      // to the selection), or has its text selected, per `inputOnOpen`.
      const inputOnOpen = ctx.props.inputOnOpen ?? 'select';
      ctx.state.searchQuery = inputOnOpen === 'clear'
        ? ('' as Q)
        : undefined;

      const firstSelected = deps.getSelectedList()[ 0 ];
      const selectedIndex = firstSelected == null
        ? -1
        : deps.getFilteredOptions().findIndex((o) => ctx.valuesEqual(deps.valueOf(o), firstSelected));
      // A selected option is always actionable; otherwise start on the first one that can be selected.
      ctx.state.highlightedIndex = selectedIndex >= 0
        ? selectedIndex
        : deps.firstActionableIndex();
      ctx.bump();
    });

    await ctx.nextTick();
    showPopoverIfAny();
    deps.calculateAlignment();
    if (!ctx.props.alignSelected) {
      // Bring the first selected option (or the top) into view.
      deps.scrollToHighlight();
    }
    refs.inputRef?.focus({ preventScroll: true });
    // Select the visible text so typing replaces it (not when the popup
    // reopens by typing, and not in `keep`/`clear` modes).
    if (selectText && (ctx.props.inputOnOpen ?? 'select') === 'select') {
      refs.inputRef?.select();
    }
  }

  function close(returnFocus = true) {
    if (!ctx.state.isOpen) {
      return;
    }
    ctx.mutate(() => {
      hidePopoverIfAny();
      ctx.state.isOpen = false;
      ctx.state.highlightedIndex = -1;
      ctx.state.searchQuery = undefined;
      ctx.bump();
    });
    // Return focus only when it is already inside the widget. A programmatic
    // `close()` or `select()` from an external control must leave that control
    // focused instead of yanking focus into the combobox.
    if (returnFocus && isInsideWidget(ctx.runtime.getDocument()?.activeElement ?? null)) {
      suppressNextFocusOpen();
      refs.triggerRef?.focus();
    }
  }

  function toggle() {
    if (deps.isLocked()) {
      return;
    }
    if (ctx.state.isOpen) {
      close();
    } else {
      open();
    }
  }

  // Return focus to the filter input (used when the popup stays open after an interaction).
  function focusInput() {
    refs.inputRef?.focus({ preventScroll: true });
  }

  // Refocus the filter only when it is safe to do so, i.e. don't yank focus away
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
    return [
      refs.containerRef,
      refs.triggerRef,
      refs.inputRef,
      refs.dropdownRef,
    ].some((r) => r != null && r.contains(target));
  }

  function maybeRefocusInput() {
    const input = refs.inputRef;
    if (input == null) {
      return;
    }
    const doc = ctx.runtime.getDocument();
    const active = doc?.activeElement ?? null;
    if (active == null || active === input || active === doc?.body || active === doc?.documentElement) {
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

  function handleClickOutside(e: MouseEvent) {
    if (!ctx.state.isOpen || ctx.props.closeOnClickOutside === false) {
      return;
    }
    if (ctx.props.clickOutsideFilter?.(e.target) === false) {
      return;
    }
    if (!isInsideWidget(e.target as Node)) {
      close(false);
    }
  }

  // ESC closes the popup no matter which control inside the widget has focus
  // (clear button, option buttons, …). This follows the WAI-ARIA combobox pattern.
  function handleDocumentKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && ctx.state.isOpen) {
      e.preventDefault();
      close(true);
    }
  }

  return {
    open,
    openFromFocus,
    close,
    toggle,
    focusInput,
    isInsideWidget,
    maybeRefocusInput,
    handleClickOutside,
    handleDocumentKeydown,
  };
}
