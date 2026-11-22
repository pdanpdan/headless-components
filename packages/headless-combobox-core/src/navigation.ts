import type { ComboboxContext } from './context';
import type { HeadlessComboboxDomRefs } from './types';

/** The selection/popover pieces the keyboard navigation needs. */
export interface NavigationDeps<O> {
  getFilteredOptions: () => O[];
  isOptionDisabled: (option: O) => boolean;
  isLocked: () => boolean;
  open: () => Promise<void>;
  select: (option: O) => void;
  close: (returnFocus?: boolean) => void;
  isInsideWidget: (target: Node | null) => boolean;
  scrollToHighlight: () => Promise<void>;
  removeLastSelected: () => void;
  canCreate: () => boolean;
  createSelection: () => void;
}

// Backspace/Delete fall through to native behavior when the key is meant to
// edit text (e.g. the typeahead input still holds a query).
function hasTextValue(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.value.length > 0;
  }
  /* v8 ignore next 1 -- element.textContent is never null ('' when empty) */
  return target instanceof HTMLElement && target.isContentEditable && (target.textContent?.length ?? 0) > 0;
}

/** The highlight state and the keyboard navigation (arrows, paging, Home/End, Tab). */
export function createNavigation<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  refs: HeadlessComboboxDomRefs<O>,
  deps: NavigationDeps<O>,
) {
  function getFocusableElements(): HTMLElement[] {
    const doc = ctx.runtime.getDocument();
    if (!doc) {
      return [];
    }
    return [
      ...doc.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
      ),
    ].filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);
  }

  function setHighlightedIndex(index: number) {
    if (ctx.state.highlightedIndex !== index && index >= 0 && index < deps.getFilteredOptions().length) {
      ctx.mutate(() => {
        ctx.state.highlightedIndex = index;
        ctx.bump();
      });
    }
  }

  function firstActionableIndex(): number {
    return deps.getFilteredOptions().findIndex((o) => !deps.isOptionDisabled(o));
  }

  function lastActionableIndex(): number {
    const options = deps.getFilteredOptions();
    for (let i = options.length - 1; i >= 0; i--) {
      // The null guard mirrors the filtering contract; filtered options are never null.
      /* v8 ignore next 3 */
      if (options[ i ] != null && !deps.isOptionDisabled(options[ i ]!)) {
        return i;
      }
    }
    return -1;
  }

  // Move the highlight by `direction` (1 or -1, scaled by `steps`), skipping
  // options that cannot be selected (at `maxLength`). Wraps around unless
  // `wrap` is false, in which case the move clamps at the ends; clears the
  // highlight when nothing is actionable.
  function stepHighlight(direction: 1 | -1, steps = 1, wrap = true) {
    const len = deps.getFilteredOptions().length;
    if (len === 0) {
      ctx.mutate(() => {
        ctx.state.highlightedIndex = -1;
        ctx.bump();
      });
      return;
    }
    let next = ctx.state.highlightedIndex + direction * steps;
    if (!wrap) {
      next = Math.max(0, Math.min(len - 1, next));
    }
    for (let i = 0; i < len; i++) {
      if (next < 0) {
        next = len - 1;
      } else if (next >= len) {
        next = 0;
      }
      const option = deps.getFilteredOptions()[ next ];
      if (option != null && !deps.isOptionDisabled(option)) {
        if (ctx.state.highlightedIndex !== next) {
          ctx.mutate(() => {
            ctx.state.highlightedIndex = next;
            ctx.bump();
          });
        }
        return;
      }
      next += direction;
    }
    ctx.mutate(() => {
      ctx.state.highlightedIndex = -1;
      ctx.bump();
    });
  }

  /** Jump per page: the number of fully visible options. */
  function pageSize(): number {
    const list = refs.listRef;
    const firstOption = refs.optionRefs.values().next().value;
    if (list != null && firstOption != null && list.clientHeight > 0 && firstOption.offsetHeight > 0) {
      return Math.max(1, Math.floor(list.clientHeight / firstOption.offsetHeight));
    }
    return 10;
  }

  // The next (or previous) focusable element in the document that is not inside
  // the options list, wrapping around when the end is reached.
  function focusNextOutside(backward: boolean) {
    const focusables = getFocusableElements();
    if (focusables.length === 0) {
      return;
    }
    const doc = ctx.runtime.getDocument();
    const active = doc?.activeElement as HTMLElement | null;
    // document.activeElement is never null per the DOM spec.
    /* v8 ignore next 3 */
    const index = active == null
      ? -1
      : focusables.indexOf(active);
    const step = backward
      ? -1
      : 1;
    for (let i = 1; i <= focusables.length; i++) {
      const el = focusables[ (index + i * step + focusables.length) % focusables.length ]!;
      // The list ref is always set while the popup is open.
      /* v8 ignore next 2 */
      if (refs.listRef == null || !refs.listRef.contains(el)) {
        el.focus();
        return;
      }
    }
  }

  function handleKeydown(event: Event) {
    const e = event as KeyboardEvent;
    // The same event bubbles from the trigger/input/option handlers to the
    // container/dropdown listeners; only the first (target) handler processes it.
    if (e.defaultPrevented) {
      return;
    }
    if (deps.isLocked()) {
      return;
    }
    // The container/dropdown listeners exist to catch Tab (so it skips the
    // options list) from elements around the trigger. Keys aimed at non-wired
    // elements (chip remove buttons, popup clear buttons) must fall through
    // to their native activation instead of driving the combobox.
    if (e.currentTarget !== e.target && e.key !== 'Tab') {
      return;
    }
    if (!ctx.state.isOpen) {
      if ([ 'Enter', ' ', 'ArrowDown', 'ArrowUp' ].includes(e.key)) {
        e.preventDefault();
        deps.open();
      } else if ([ 'Backspace', 'Delete' ].includes(e.key) && !hasTextValue(e.target)) {
        e.preventDefault();
        deps.removeLastSelected();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        stepHighlight(1);
        deps.scrollToHighlight();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        stepHighlight(-1);
        deps.scrollToHighlight();
        break;
      }
      case 'Enter': {
        e.preventDefault();
        // A trigger button paired with a separate filter input is not the
        // combobox editor. Enter on it closes the popup instead of toggling
        // whichever option happens to be highlighted.
        if (e.target === refs.triggerRef && refs.inputRef != null && refs.triggerRef !== refs.inputRef) {
          deps.close();
          break;
        }
        const option = deps.getFilteredOptions()[ ctx.state.highlightedIndex ];
        if (ctx.state.highlightedIndex >= 0 && option != null) {
          deps.select(option);
        } else if (deps.canCreate()) {
          // Free-solo: the typed query becomes the selection when no option is highlighted.
          deps.createSelection();
        }
        break;
      }
      case ' ': {
        // Space types in text entries and natively activates option buttons
        // (click → select). On the trigger its native click would toggle the
        // popup closed; suppress that, because Space does nothing there.
        if (e.target !== refs.triggerRef) {
          break;
        }
        e.preventDefault();
        break;
      }
      case 'Backspace':
      case 'Delete': {
        // Without a filter input there is no text to delete, so Backspace/
        // Delete drop the last (or only) selected option instead. The typeahead
        // trigger doubles as the filter input: while it holds the selection
        // label or a query, Backspace edits/deletes the text natively; only an
        // empty input removes the selection.
        const typeahead = e.target === refs.triggerRef && refs.triggerRef === refs.inputRef;
        if ((refs.inputRef == null || typeahead) && !hasTextValue(e.target)) {
          e.preventDefault();
          deps.removeLastSelected();
        }
        break;
      }
      case 'PageDown':
      case 'PageUp': {
        e.preventDefault();
        stepHighlight(e.key === 'PageDown'
          ? 1
          : -1, pageSize(), false);
        deps.scrollToHighlight();
        break;
      }
      case 'Home':
      case 'End': {
        // In inputs these keep their native caret behavior.
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          break;
        }
        e.preventDefault();
        ctx.mutate(() => {
          ctx.state.highlightedIndex = e.key === 'Home'
            ? firstActionableIndex()
            : lastActionableIndex();
          ctx.bump();
        });
        deps.scrollToHighlight();
        break;
      }
      case 'Tab': {
        // Skip the options list: focus the next focusable element outside it.
        e.preventDefault();
        const option = deps.getFilteredOptions()[ ctx.state.highlightedIndex ];
        const willSelect = ctx.props.selectOnTab && ctx.state.highlightedIndex >= 0 && option != null;
        if (willSelect) {
          deps.select(option);
          if (ctx.state.isOpen) {
            deps.close(false);
          }
          // The selection's close may return focus to the trigger; move on to
          // the next focusable element as a normal Tab would.
          focusNextOutside(e.shiftKey);
          break;
        }
        focusNextOutside(e.shiftKey);
        // Focus leaving the widget closes the popup, like a click outside.
        if (!deps.isInsideWidget(ctx.runtime.getDocument()?.activeElement ?? null)) {
          deps.close(false);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        deps.close(true);
        break;
    }
  }

  // A typeahead input is a text field: Space inserts a space instead of
  // opening the popup (the regular matrix treats Space on the trigger as
  // activation). Everything else uses the same keyboard behavior.
  function handleTypeaheadKeydown(event: Event) {
    if ((event as KeyboardEvent).key === ' ') {
      return;
    }
    handleKeydown(event);
  }

  return {
    setHighlightedIndex,
    firstActionableIndex,
    lastActionableIndex,
    stepHighlight,
    pageSize,
    getFocusableElements,
    focusNextOutside,
    handleKeydown,
    handleTypeaheadKeydown,
  };
}
