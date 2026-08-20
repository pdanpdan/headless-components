import type { HeadlessComboboxDomRefs, HeadlessComboboxProps } from './useHeadlessCombobox';
import type { ComputedRef, Ref } from 'vue';

import { nextTick, onMounted, onUnmounted, toRaw } from 'vue';

/** The state and actions the popup lifecycle needs. */
export interface PopoverDeps<O, V> {
  isLocked: ComputedRef<boolean>;
  selectedList: ComputedRef<V[]>;
  filteredOptions: ComputedRef<O[]>;
  valueOf: (option: O) => V;
  firstActionableIndex: () => number;
  calculateAlignment: () => void;
  scrollToHighlight: () => Promise<void>;
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

/** The open/close lifecycle, the Popover API, focus management, and the outside-close guards. */
export function usePopover<O, V, Q>(
  props: HeadlessComboboxProps<O, V, Q>,
  isOpen: Ref<boolean>,
  searchQuery: Ref<Q | undefined>,
  highlightedIndex: Ref<number>,
  refs: HeadlessComboboxDomRefs<O>,
  deps: PopoverDeps<O, V>,
) {
  // If the consumer marked the dropdown as a popover, drive it with the Popover API
  // (top-layer rendering) instead of relying on v-if.
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

  async function open() {
    if (isOpen.value || deps.isLocked.value) {
      return;
    }
    isOpen.value = true;
    searchQuery.value = undefined;

    const firstSelected = deps.selectedList.value[ 0 ];
    const selectedIndex = firstSelected == null ? -1 : deps.filteredOptions.value.findIndex((o) => toRaw(deps.valueOf(o)) === toRaw(firstSelected));
    // A selected option is always actionable; otherwise start on the first one that can be selected.
    highlightedIndex.value = selectedIndex >= 0 ? selectedIndex : deps.firstActionableIndex();

    await nextTick();
    showPopoverIfAny();
    deps.calculateAlignment();
    if (!props.alignSelected) {
      // Bring the first selected option (or the top) into view.
      deps.scrollToHighlight();
    }
    refs.inputRef?.focus({ preventScroll: true });
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
      refs.triggerRef?.focus();
    }
  }

  function toggle() {
    if (deps.isLocked.value) {
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
    refs.inputRef?.focus({ preventScroll: true });
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
    return [ refs.containerRef, refs.triggerRef, refs.dropdownRef ].some((r) => r != null && r.contains(target));
  }

  function maybeRefocusInput() {
    const input = refs.inputRef;
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

  return {
    open,
    close,
    toggle,
    focusInput,
    isInsideWidget,
    maybeRefocusInput,
  };
}
