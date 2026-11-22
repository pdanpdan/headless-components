import type {
  HeadlessComboboxProps as CoreComboboxProps,
  HeadlessComboboxSnapshot,
} from '@pdanpdan/headless-combobox-core';
import type { Accessor, Setter } from 'solid-js';

import { createCombobox } from '@pdanpdan/headless-combobox-core';
import { createEffect, createSignal, onCleanup, onSettled, untrack } from 'solid-js';

/** Options accepted by the Solid hook and component. */
export type UseHeadlessComboboxOptions<O, V = O, Q = string>
  = Omit<CoreComboboxProps<O, V, Q>, 'modelValue'> & {
    /** Controlled value (`value` present) or omit for uncontrolled. */
    value?: V | V[] | null;
    /** Initial value for uncontrolled usage. */
    defaultValue?: V | V[] | null;
    /** Called for every selection change. */
    onChange?: (value: V | V[] | null) => void;
  };

const CORE_PROP_KEYS = [
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

/**
 * Solid adapter for the framework-independent combobox core.
 *
 * Returns an accessor for the snapshot, so `<button {...toSolidProps(scope().triggerProps)} />`
 * stays reactive. The options accessor is tracked by a `createEffect`.
 */
export function useHeadlessCombobox<O, V = O, Q = string>(
  options: Accessor<UseHeadlessComboboxOptions<O, V, Q>>,
): Accessor<HeadlessComboboxSnapshot<O, V, Q>> {
  // Solid 2's createSignal overloads cannot express a generic `V | V[] | null`
  // initial value; the runtime value is the same.
  const [ uncontrolled, setUncontrolled ] = createSignal<unknown>(
    untrack(() => options().defaultValue ?? null),
  ) as unknown as [Accessor<V | V[] | null>, Setter<V | V[] | null>];
  const controlled = () => 'value' in options();
  const modelValue = () => (controlled()
    ? (options().value ?? null)
    : uncontrolled());

  const store = createCombobox<O, V, Q>({
    props: untrack(() => toCoreProps(options(), modelValue())),
    onChange: (value) => {
      if (!controlled()) {
        setUncontrolled(() => value);
      }
      options().onChange?.(value);
    },
    runtime: {
      nextTick: () => Promise.resolve(),
    },
  });

  const [ snapshot, setSnapshot ] = createSignal(store.getSnapshot(), { equals: false });

  createEffect(
    () => toCoreProps(options(), modelValue()),
    (next) => store.setProps(next),
  );

  onCleanup(store.subscribe(() => setSnapshot(store.getSnapshot())));
  onSettled(() => {
    store.mount();
    return () => store.destroy();
  });

  return snapshot;
}

const SOLID_EVENT_NAMES: Record<string, string> = {
  onKeydown: 'onKeyDown',
  onMousedown: 'onMouseDown',
  onMousemove: 'onMouseMove',
};

/**
 * Adapt a core ARIA prop bag to Solid's JSX event prop names:
 *
 * ```tsx
 * <button {...toSolidProps(scope().triggerProps)} />
 * ```
 */
export function toSolidProps<T extends object>(props: T): Record<string, unknown> {
  const adapted: Record<string, unknown> = {};
  for (const [ key, value ] of Object.entries(props)) {
    const name = SOLID_EVENT_NAMES[ key ] ?? key;
    // Solid 2 removes attributes set to false, including ARIA state.
    adapted[ name ] = name.startsWith('aria-') && typeof value === 'boolean'
      ? String(value)
      : value;
  }
  return adapted;
}

function toCoreProps<O, V, Q>(
  options: UseHeadlessComboboxOptions<O, V, Q>,
  modelValue: V | V[] | null,
): CoreComboboxProps<O, V, Q> {
  const resolved: Record<string, unknown> = {};
  for (const key of CORE_PROP_KEYS) {
    resolved[ key ] = options[ key ];
  }
  resolved.modelValue = modelValue;
  return resolved as unknown as CoreComboboxProps<O, V, Q>;
}
