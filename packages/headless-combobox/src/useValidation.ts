import type { HeadlessComboboxErrorCode, HeadlessComboboxProps } from './useHeadlessCombobox';
import type { ComputedRef } from 'vue';

import { computed } from 'vue';

/** Reactive validation derived from the selection count. */
export function useValidation<O, V, Q>(
  props: HeadlessComboboxProps<O, V, Q>,
  selectedCount: ComputedRef<number>,
) {
  const errors = computed<HeadlessComboboxErrorCode[]>(() => {
    const list: HeadlessComboboxErrorCode[] = [];
    const count = selectedCount.value;

    if (props.required && count === 0) {
      list.push('required');
    }
    if (props.multiple) {
      if (props.minLength != null && count < props.minLength) {
        list.push('minlength');
      }
      if (props.maxLength != null && count > props.maxLength) {
        list.push('maxlength');
      }
    }
    return list;
  });

  const valid = computed(() => errors.value.length === 0);

  const validationMessage = computed(() => {
    const code = errors.value[ 0 ];
    if (!code) {
      return '';
    }
    const custom = props.errorMessages?.[ code ];
    if (custom != null) {
      return custom;
    }
    switch (code) {
      case 'required':
        return 'Selection is required.';
      case 'minlength':
        return `Select at least ${ props.minLength } option${ props.minLength === 1 ? '' : 's' }.`;
      case 'maxlength':
        return `Select at most ${ props.maxLength } option${ props.maxLength === 1 ? '' : 's' }.`;
    }
    // Unreachable: the switch above is exhaustive over HeadlessComboboxErrorCode.
    /* v8 ignore next 1 */
    return '';
  });

  return {
    errors,
    valid,
    validationMessage,
  };
}
