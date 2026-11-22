import type { ComboboxContext } from './context';

import { createMemo } from './context';

/** Late-bound popup actions the selection needs (wired by the store). */
export interface SelectionHooks {
  close: (returnFocus?: boolean) => void;
  maybeRefocusInput: () => void;
}

/**
 * Selection state: the model values, membership by resolved option value, and
 * the select/clear actions. Equality is by the resolved option value.
 */
export function createSelection<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  hooks: SelectionHooks,
) {
  /** The value stored / emitted for an option; defaults to the option itself. */
  function valueOf(option: O): V {
    return ctx.props.optionValue
      ? ctx.props.optionValue(option)
      : option as unknown as V;
  }

  function labelOf(option: O): string {
    return ctx.props.optionLabel
      ? ctx.props.optionLabel(option)
      : String(option);
  }

  /** The option whose value equals `value` (used to resolve the model back to an option). */
  function findOptionByValue(value: V): O | undefined {
    return ctx.props.options.find((option) => ctx.unwrap(valueOf(option)) === ctx.unwrap(value));
  }

  const getSelectedList = createMemo<V[]>(ctx)(() => {
    const model = ctx.getModelValue();
    if (ctx.props.multiple) {
      return Array.isArray(model)
        ? model as V[]
        : [];
    }
    return model == null
      ? []
      : [ model as V ];
  });

  const getSelectedCount = createMemo<number>(ctx)(() => getSelectedList().length);

  const getCanSelectMore = createMemo<boolean>(ctx)(() => {
    if (!ctx.props.multiple) {
      return true;
    }
    return ctx.props.maxLength == null || getSelectedCount() < ctx.props.maxLength;
  });

  const isLocked = createMemo<boolean>(ctx)(() => ctx.props.disabled === true || ctx.props.readonly === true);

  // Free-solo: the typed query can become a value when it is non-empty, no
  // existing option already has that label, and the multiple cap allows it.
  const getCanCreate = createMemo<boolean>(ctx)(() => {
    if (ctx.props.creatable !== true || ctx.props.createOption == null || isLocked() || !getCanSelectMore()) {
      return false;
    }
    const query = ctx.state.searchQuery;
    if (query == null) {
      return false;
    }
    const text = String(query).trim().toLowerCase();
    if (text === '') {
      return false;
    }
    return !ctx.props.options.some((option) => labelOf(option).trim().toLowerCase() === text);
  });

  function isSelected(option: O): boolean {
    const value = ctx.unwrap(valueOf(option));
    return getSelectedList().some((v) => ctx.unwrap(v) === value);
  }

  // Options that cannot be selected: only when at `maxLength` (multiple).
  function isOptionDisabled(option: O): boolean {
    return !isSelected(option) && !getCanSelectMore();
  }

  function select(option: O) {
    if (isLocked()) {
      return;
    }

    const value = valueOf(option);
    ctx.mutate(() => {
      if (ctx.props.multiple) {
        const current = getSelectedList();
        const raw = ctx.unwrap(value);
        const has = current.some((v) => ctx.unwrap(v) === raw);
        if (has) {
          ctx.emitModel(current.filter((v) => ctx.unwrap(v) !== raw));
        } else if (getCanSelectMore()) {
          ctx.emitModel([ ...current, value ]);
        }
        // else: blocked at `max`: no change, but still fall through to keep the filter focused.
      } else {
        ctx.emitModel(value);
      }

      const shouldClose = ctx.props.closeOnSelect ?? !ctx.props.multiple;
      if (shouldClose) {
        hooks.close(true);
      } else if (ctx.state.isOpen) {
        // Popup stays open (e.g. multiple): keep the filter focused for continued typing,
        // unless the user is focused on another text field / control.
        ctx.nextTick().then(hooks.maybeRefocusInput);
      }
    });
  }

  // Commit the current query as a new value. The consumer supplies the value
  // through `createOption`; it is stored exactly like a selected option value.
  function createSelection() {
    const query = ctx.state.searchQuery;
    const createOption = ctx.props.createOption;
    if (!getCanCreate() || query == null || createOption == null) {
      return;
    }
    const created = createOption(query);
    if (created == null) {
      return;
    }
    ctx.mutate(() => {
      if (ctx.props.multiple) {
        const current = getSelectedList();
        const raw = ctx.unwrap(created);
        if (getCanSelectMore() && !current.some((value) => ctx.unwrap(value) === raw)) {
          ctx.emitModel([ ...current, created ]);
        }
      } else {
        ctx.emitModel(created);
      }

      // The query became a committed value; clear it so the next keystroke
      // starts a new search and the same value is not offered again.
      ctx.state.searchQuery = undefined;

      const shouldClose = ctx.props.closeOnSelect ?? !ctx.props.multiple;
      if (shouldClose) {
        hooks.close(true);
      } else if (ctx.state.isOpen) {
        ctx.nextTick().then(hooks.maybeRefocusInput);
      }
    });
  }

  function clear() {
    if (isLocked()) {
      return;
    }
    ctx.mutate(() => {
      ctx.emitModel(ctx.props.multiple
        ? []
        : null);
      if (ctx.state.isOpen) {
        ctx.nextTick().then(hooks.maybeRefocusInput);
      }
    });
  }

  // Backspace/Delete: drop the trailing selection (multiple) or the sole value
  // (single). Same focus handling as `clear`.
  function removeLastSelected() {
    /* v8 ignore next 3 -- handleKeydown guards isLocked; removeLastSelected is not exposed */
    if (isLocked()) {
      return;
    }
    const current = getSelectedList();
    if (current.length === 0) {
      return;
    }
    ctx.mutate(() => {
      ctx.emitModel(ctx.props.multiple
        ? current.slice(0, -1)
        : null);
      if (ctx.state.isOpen) {
        ctx.nextTick().then(hooks.maybeRefocusInput);
      }
    });
  }

  return {
    valueOf,
    findOptionByValue,
    getSelectedList,
    getSelectedCount,
    getCanSelectMore,
    getCanCreate,
    isSelected,
    isOptionDisabled,
    isLocked,
    select,
    createSelection,
    clear,
    removeLastSelected,
  };
}
