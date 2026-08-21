import type { HeadlessComboboxProps } from './useHeadlessCombobox';
import type { Ref } from 'vue';

import { computed, nextTick, toRaw } from 'vue';

/** Late-bound popup actions the selection needs (wired by the orchestrator). */
export interface SelectionHooks {
  close: (returnFocus?: boolean) => void;
  maybeRefocusInput: () => void;
}

/**
 * Selection state: the model values, membership by option value, and the
 * select/clear actions. Equality is by the resolved option value.
 */
export function useSelection<O, V, Q>(
  props: HeadlessComboboxProps<O, V, Q>,
  emit: (value: V | V[] | null) => void,
  isOpen: Ref<boolean>,
  hooks: SelectionHooks,
) {
  /** The value stored / emitted for an option; defaults to the option itself. */
  function valueOf(option: O): V {
    return props.optionValue ? props.optionValue(option) : option as unknown as V;
  }

  /** The option whose value equals `value` (used to resolve the model back to an option). */
  function findOptionByValue(value: V): O | undefined {
    return props.options.find((option) => toRaw(valueOf(option)) === toRaw(value));
  }

  const selectedList = computed<V[]>(() => {
    if (props.multiple) {
      return Array.isArray(props.modelValue) ? props.modelValue : [];
    }
    return props.modelValue == null ? [] : [ props.modelValue as V ];
  });

  const selectedCount = computed(() => selectedList.value.length);

  const canSelectMore = computed(() => {
    if (!props.multiple) {
      return true;
    }
    return props.maxLength == null || selectedCount.value < props.maxLength;
  });

  function isSelected(option: O): boolean {
    const value = toRaw(valueOf(option));
    return selectedList.value.some((v) => toRaw(v) === value);
  }

  // Options that cannot be selected: only when at `maxLength` (multiple).
  function isOptionDisabled(option: O): boolean {
    return !isSelected(option) && !canSelectMore.value;
  }

  // Disabled and read-only both block opening and changing the selection.
  const isLocked = computed(() => props.disabled === true || props.readonly === true);

  function select(option: O) {
    if (isLocked.value) {
      return;
    }

    const value = valueOf(option);
    if (props.multiple) {
      const current = selectedList.value;
      const raw = toRaw(value);
      const has = current.some((v) => toRaw(v) === raw);
      if (has) {
        emit(current.filter((v) => toRaw(v) !== raw));
      } else if (canSelectMore.value) {
        emit([ ...current, value ]);
      }
      // else: blocked at `max` — no change, but still fall through to keep the filter focused.
    } else {
      emit(value);
    }

    const shouldClose = props.closeOnSelect ?? !props.multiple;
    if (shouldClose) {
      hooks.close(true);
    } else if (isOpen.value) {
      // Popup stays open (e.g. multiple): keep the filter focused for continued typing,
      // unless the user is focused on another text field / control.
      nextTick(hooks.maybeRefocusInput);
    }
  }

  function clear() {
    if (isLocked.value) {
      return;
    }
    emit(props.multiple ? [] : null);
    if (isOpen.value) {
      nextTick(hooks.maybeRefocusInput);
    }
  }

  // Backspace/Delete: drop the trailing selection (multiple) or the sole value
  // (single). Same focus handling as `clear`.
  function removeLastSelected() {
    /* v8 ignore next 3 -- handleKeydown already guards isLocked and removeLastSelected is not exposed */
    if (isLocked.value) {
      return;
    }
    const current = selectedList.value;
    if (current.length === 0) {
      return;
    }
    emit(props.multiple ? current.slice(0, -1) : null);
    if (isOpen.value) {
      nextTick(hooks.maybeRefocusInput);
    }
  }

  return {
    valueOf,
    findOptionByValue,
    selectedList,
    selectedCount,
    canSelectMore,
    isSelected,
    isOptionDisabled,
    isLocked,
    select,
    clear,
    removeLastSelected,
  };
}
