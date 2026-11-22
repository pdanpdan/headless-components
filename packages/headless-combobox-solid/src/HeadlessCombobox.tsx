import type { UseHeadlessComboboxOptions } from './useHeadlessCombobox';
import type { HeadlessComboboxSnapshot } from '@pdanpdan/headless-combobox-core';
import type { JSX } from '@solidjs/web';
import type { Accessor } from 'solid-js';

import { useHeadlessCombobox } from './useHeadlessCombobox';

/** Props for the render-prop component: hook options plus a scope renderer. */
export interface HeadlessComboboxProps<O, V = O, Q = string>
  extends UseHeadlessComboboxOptions<O, V, Q> {
  /** The scope accessor keeps every binding reactive (Solid components run once). */
  children: (scope: Accessor<HeadlessComboboxSnapshot<O, V, Q>>) => JSX.Element;
}

/**
 * Render-prop wrapper around {@link useHeadlessCombobox}. Prefer the hook when
 * the markup does not need to be nested under a component.
 */
export function HeadlessCombobox<O, V = O, Q = string>(
  props: HeadlessComboboxProps<O, V, Q>,
): JSX.Element {
  const scope = useHeadlessCombobox<O, V, Q>(() => props);
  return props.children(scope);
}
