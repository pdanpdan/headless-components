import type { ComboboxContext } from './context';
import type { HeadlessComboboxErrorCode } from './types';

import { createMemo } from './context';

/** Validation derived from the selection count. */
export function createValidation<O, V, Q>(
  ctx: ComboboxContext<O, V, Q>,
  getSelectedCount: () => number,
) {
  const getErrors = createMemo<HeadlessComboboxErrorCode[]>(ctx)(() => {
    const list: HeadlessComboboxErrorCode[] = [];
    const count = getSelectedCount();

    if (ctx.props.required && count === 0) {
      list.push('required');
    }
    if (ctx.props.multiple) {
      if (ctx.props.minLength != null && count < ctx.props.minLength) {
        list.push('minlength');
      }
      if (ctx.props.maxLength != null && count > ctx.props.maxLength) {
        list.push('maxlength');
      }
    }
    return list;
  });

  const getValid = createMemo<boolean>(ctx)(() => getErrors().length === 0);

  const getValidationMessage = createMemo<string>(ctx)(() => {
    const code = getErrors()[ 0 ];
    if (!code) {
      return '';
    }
    const custom = ctx.props.errorMessages?.[ code ];
    if (custom != null) {
      return custom;
    }
    switch (code) {
      case 'required':
        return 'Selection is required.';
      case 'minlength':
        return `Select at least ${ ctx.props.minLength } option${ ctx.props.minLength === 1
          ? ''
          : 's' }.`;
      case 'maxlength':
        return `Select at most ${ ctx.props.maxLength } option${ ctx.props.maxLength === 1
          ? ''
          : 's' }.`;
    }
    // Unreachable: the switch above is exhaustive over HeadlessComboboxErrorCode.
    /* v8 ignore next 1 */
    return '';
  });

  return {
    getErrors,
    getValid,
    getValidationMessage,
  };
}
