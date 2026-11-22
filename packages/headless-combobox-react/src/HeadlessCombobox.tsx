import type { UseHeadlessComboboxOptions } from './useHeadlessCombobox';
import type { HeadlessComboboxSnapshot } from '@pdanpdan/headless-combobox-core';
import type { ReactNode } from 'react';

import { useHeadlessCombobox } from './useHeadlessCombobox';

/** Props for the render-prop component: hook options plus a scope renderer. */
export interface HeadlessComboboxProps<O, V = O, Q = string>
  extends UseHeadlessComboboxOptions<O, V, Q> {
  children: (scope: HeadlessComboboxSnapshot<O, V, Q>) => ReactNode;
}

/**
 * Render-prop wrapper around {@link useHeadlessCombobox}. Prefer the hook when
 * the markup does not need to be nested under a component.
 */
export function HeadlessCombobox<O, V = O, Q = string>(
  props: HeadlessComboboxProps<O, V, Q>,
): ReactNode {
  const scope = useHeadlessCombobox<O, V, Q>(props);
  return props.children(scope);
}
