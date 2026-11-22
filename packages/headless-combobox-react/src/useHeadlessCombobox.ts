import type {
  HeadlessComboboxProps as CoreComboboxProps,
  HeadlessComboboxSnapshot,
} from '@pdanpdan/headless-combobox-core';

import { createCombobox } from '@pdanpdan/headless-combobox-core';
import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

/** Options accepted by the React hook and component. */
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
 * React adapter for the framework-independent combobox core.
 *
 * State is read through `useSyncExternalStore`, so any `select`/`open`/`close`
 * call (from this hook or a child) re-renders the component tree.
 */
export function useHeadlessCombobox<O, V = O, Q = string>(
  options: UseHeadlessComboboxOptions<O, V, Q>,
): HeadlessComboboxSnapshot<O, V, Q> {
  const controlled = 'value' in options;
  const [ uncontrolled, setUncontrolled ] = useState<V | V[] | null>(() => options.defaultValue ?? null);
  const modelValue = controlled
    ? (options.value ?? null)
    : uncontrolled;

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const controlledRef = useRef(controlled);
  controlledRef.current = controlled;

  const id = useId();
  const tickRef = useRef<(() => Promise<void>) | null>(null);
  const resolversRef = useRef<Array<() => void>>([]);
  const [ , forceRender ] = useReducer((n: number) => n + 1, 0);

  // Resolve the next tick after React has committed the DOM. A forced render
  // guarantees a layout effect even when the state change produced no new
  // store snapshot (e.g. only a DOM ref was involved).
  tickRef.current = () => {
    const { promise, resolve } = Promise.withResolvers<void>();
    resolversRef.current.push(resolve);
    forceRender();
    return promise;
  };

  const [ store ] = useState(() => createCombobox<O, V, Q>({
    props: toCoreProps(optionsRef.current, modelValue),
    onChange: (value) => {
      if (!controlledRef.current) {
        setUncontrolled(value);
      }
      optionsRef.current.onChange?.(value);
    },
    runtime: {
      nextTick: () => tickRef.current!(),
      createId: () => id,
    },
  }));

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  // Push each render's props into the core. The store no-ops when shallow-equal.
  useEffect(() => {
    store.setProps(toCoreProps(optionsRef.current, modelValue));
  });

  useEffect(() => {
    const resolvers = resolversRef.current;
    resolversRef.current = [];
    for (const resolve of resolvers) {
      resolve();
    }
  });

  useEffect(() => {
    store.mount();
    return () => store.destroy();
  }, [ store ]);

  return snapshot;
}

const REACT_PROP_NAMES: Record<string, string> = {
  autocomplete: 'autoComplete',
  onKeydown: 'onKeyDown',
  onMousedown: 'onMouseDown',
  onMousemove: 'onMouseMove',
};

/**
 * Adapt a core ARIA prop bag to React's prop names (`autocomplete` → `autoComplete`, event camelCase):
 *
 * ```tsx
 * <button {...toReactProps(scope.triggerProps)} />
 * ```
 */
export function toReactProps<T extends object>(props: T): Record<string, unknown> {
  const adapted: Record<string, unknown> = {};
  for (const [ key, value ] of Object.entries(props)) {
    adapted[ REACT_PROP_NAMES[ key ] ?? key ] = value;
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
