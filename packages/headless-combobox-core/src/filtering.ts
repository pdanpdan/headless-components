import type { ComboboxContext } from './context';

import { createMemo } from './context';

/** Late-bound popup action the filtering needs (wired by the store). */
export interface FilteringHooks {
  /** `selectText: false` when the popup reopens by typing, so the input text must not be selected then. */
  open: (selectText?: boolean) => Promise<void>;
  /** Reset the highlight after a query change (wired by the store). */
  onQueryChange?: () => void;
}

/** Search query, filtering, and the resulting options list. */
export function createFiltering<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  hooks: FilteringHooks,
) {
  function getOptionLabel(option: O): string {
    return ctx.props.optionLabel
      ? ctx.props.optionLabel(option)
      : String(option);
  }

  function applyFilter(option: O, query: Q): boolean {
    if (ctx.props.optionFilter) {
      return ctx.props.optionFilter(option, query);
    }
    return getOptionLabel(option).toLowerCase().includes(String(query).toLowerCase());
  }

  const getFilteredOptions = createMemo<O[]>(ctx)(() => {
    const q = ctx.state.searchQuery;
    if (q == null || (typeof q === 'string' && q === '')) {
      return ctx.props.options;
    }
    return ctx.props.options.filter((o) => applyFilter(o, q));
  });

  function setSearchQuery(val: Q | undefined) {
    if (Object.is(ctx.state.searchQuery, val)) {
      return;
    }
    ctx.mutate(() => {
      ctx.state.searchQuery = val;
      ctx.bump();
      // The store wires this to `setHighlightedIndex(firstActionableIndex())`
      // after construction; the hook keeps the two modules decoupled.
      hooks.onQueryChange?.();
    });
  }

  function setQueryFromEvent(event: Event) {
    setSearchQuery((event.target as HTMLInputElement).value as Q);
  }

  // Typing in the typeahead input reopens the popup (open() resets the query
  // first, so the order matters) and filters the options. The text being typed
  // must not be selected by the open, so it opens with selectText disabled.
  function openAndSetQueryFromEvent(event: Event) {
    hooks.open(false);
    setQueryFromEvent(event);
  }

  return {
    getFilteredOptions,
    setSearchQuery,
    setQueryFromEvent,
    openAndSetQueryFromEvent,
  };
}
