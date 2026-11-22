import type {
  HeadlessComboboxProps,
  HeadlessComboboxSnapshot,
} from '@pdanpdan/headless-combobox-core';

import { createCombobox } from '@pdanpdan/headless-combobox-core';
import { tick } from 'svelte';

/** Props read from a Svelte component; a fixed list keeps tracking deterministic. */
const CORE_PROP_KEYS = [
  'modelValue',
  'options',
  'multiple',
  'minLength',
  'maxLength',
  'required',
  'disabled',
  'readonly',
  'closeOnSelect',
  'closeOnClickOutside',
  'clickOutsideFilter',
  'selectOnTab',
  'optionValue',
  'optionLabel',
  'optionFilter',
  'id',
  'alignSelected',
  'inputOnOpen',
  'errorMessages',
  'creatable',
  'createOption',
] as const;

const SVELTE_EVENT_NAMES: Record<string, string> = {
  onClick: 'onclick',
  onKeydown: 'onkeydown',
  onMousedown: 'onmousedown',
  onMousemove: 'onmousemove',
  onFocus: 'onfocus',
  onInput: 'oninput',
};

export interface CreateSvelteComboboxOptions<O, V = O, Q = string> {
  /** A plain props object or a reactive getter. */
  props: HeadlessComboboxProps<O, V, Q> | (() => HeadlessComboboxProps<O, V, Q>);
  onChange?: (value: V | V[] | null) => void;
}

/** Svelte store (`$store` / `get(store)`) plus the adapter wiring. */
export interface SvelteComboboxStore<O, V, Q = string> {
  subscribe: (run: (value: HeadlessComboboxSnapshot<O, V, Q>) => void) => () => void;
  getSnapshot: () => HeadlessComboboxSnapshot<O, V, Q>;
  setProps: (props: HeadlessComboboxProps<O, V, Q>) => void;
  mount: () => void;
  destroy: () => void;
}

/**
 * Svelte adapter for the framework-independent combobox core.
 *
 * `$combobox` in a component gives the live snapshot (state + actions):
 *
 * ```svelte
 * <script>
 *   const combobox = createComboboxStore({ props: () => ({ modelValue, options }) });
 * </script>
 * <button {...toSvelteProps($combobox.triggerProps)} />
 * ```
 */
export function createComboboxStore<O, V = O, Q = string>(
  options: CreateSvelteComboboxOptions<O, V, Q>,
): SvelteComboboxStore<O, V, Q> {
  const resolve = () => (typeof options.props === 'function'
    ? options.props()
    : options.props);

  const store = createCombobox<O, V, Q>({
    props: resolve(),
    onChange: (value) => options.onChange?.(value),
    runtime: {
      nextTick: () => tick(),
    },
  });

  return {
    subscribe: (run) => {
      run(store.getSnapshot());
      return store.subscribe(() => run(store.getSnapshot()));
    },
    getSnapshot: store.getSnapshot,
    setProps: store.setProps,
    mount: store.mount,
    destroy: store.destroy,
  };
}

/**
 * Pick the combobox props out of a Svelte `$props()` object and drop component
 * plumbing (`children`, `onChange`). Reading inside an `$effect` tracks them.
 */
export function toCoreProps<O, V, Q>(props: Record<string, unknown>): HeadlessComboboxProps<O, V, Q> {
  const resolved: Record<string, unknown> = {};
  for (const key of CORE_PROP_KEYS) {
    resolved[ key ] = props[ key ];
  }
  return resolved as unknown as HeadlessComboboxProps<O, V, Q>;
}

/**
 * Adapt a core ARIA prop bag to Svelte 5 event attribute names:
 *
 * ```svelte
 * <button {...toSvelteProps(scope.triggerProps)} />
 * ```
 */
export function toSvelteProps<T extends object>(props: T): Record<string, unknown> {
  const adapted: Record<string, unknown> = {};
  for (const [ key, value ] of Object.entries(props)) {
    adapted[ SVELTE_EVENT_NAMES[ key ] ?? key ] = value;
  }
  return adapted;
}
