import type { HeadlessComboboxProps } from './useHeadlessCombobox';
import type { Ref } from 'vue';

import { computed } from 'vue';

/** Late-bound popup action the filtering needs (wired by the orchestrator). */
export interface FilteringHooks {
  /** `selectText: false` when the popup reopens by typing — the input text must not be selected then. */
  open: (selectText?: boolean) => Promise<void>;
}

/** Search query, filtering, and the resulting options list. */
export function useFiltering<O, V, Q>(
  props: HeadlessComboboxProps<O, V, Q>,
  searchQuery: Ref<Q | undefined>,
  hooks: FilteringHooks,
) {
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

  function setSearchQuery(val: Q | undefined) {
    searchQuery.value = val;
  }

  function setQueryFromEvent(event: Event) {
    setSearchQuery((event.target as HTMLInputElement).value as Q);
  }

  // Typing in the typeahead input reopens the popup (open() resets the query
  // first, so the order matters) and filters the options. The text being typed
  // must not be selected by the open, so it opens with selectText disabled.
  function openAndSetQueryFromEvent(event: Event) {
    hooks.open(false);
    setSearchQuery((event.target as HTMLInputElement).value as Q);
  }

  return {
    filteredOptions,
    setSearchQuery,
    setQueryFromEvent,
    openAndSetQueryFromEvent,
  };
}
