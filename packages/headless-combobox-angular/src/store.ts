import type { DestroyRef, Signal } from '@angular/core';
import type {
  ComboboxStore,
  CreateComboboxOptions,
  HeadlessComboboxProps,
  HeadlessComboboxSnapshot,
} from '@pdanpdan/headless-combobox-core';

import { afterNextRender, DestroyRef as DestroyRefToken, inject, Injector, signal } from '@angular/core';
import { createCombobox } from '@pdanpdan/headless-combobox-core';

export interface AngularComboboxOptions<O, V = O, Q = string> {
  /** A plain props object or a getter (call it from a template/computed). */
  props: HeadlessComboboxProps<O, V, Q> | (() => HeadlessComboboxProps<O, V, Q>);
  onChange?: (value: V | V[] | null) => void;
  /** Enables `afterNextRender`-based ticking; pass the component injector. */
  injector?: Injector;
}

/** Angular signal-backed combobox: `snapshot()` in templates, actions in the snapshot. */
export interface AngularComboboxStore<O, V, Q = string> {
  /** Live state + actions for the template. */
  snapshot: Signal<HeadlessComboboxSnapshot<O, V, Q>>;
  /** Push new props after inputs change. */
  setProps: (props: HeadlessComboboxProps<O, V, Q>) => void;
  /** Detach listeners and subscribers. */
  destroy: () => void;
  /** The underlying framework-independent store. */
  store: ComboboxStore<O, V, Q>;
}

/**
 * Create a combobox backed by Angular signals.
 *
 * Call it from a component constructor or an injection context; prefer
 * {@link injectCombobox}, which also registers teardown.
 */
export function createComboboxStore<O, V = O, Q = string>(
  options: AngularComboboxOptions<O, V, Q>,
): AngularComboboxStore<O, V, Q> {
  const resolve = () => (typeof options.props === 'function'
    ? options.props()
    : options.props);

  const injector = options.injector;
  const storeOptions: CreateComboboxOptions<O, V, Q> = {
    props: resolve(),
    onChange: (value) => options.onChange?.(value),
  };
  if (injector) {
    storeOptions.runtime = {
      nextTick: () => new Promise<void>((resolveNext) => {
        afterNextRender(() => resolveNext(), { injector });
      }),
    };
  }
  const store = createCombobox<O, V, Q>(storeOptions);

  const state = signal(store.getSnapshot());
  const unsubscribe = store.subscribe(() => state.set(store.getSnapshot()));

  if (typeof document !== 'undefined') {
    store.mount();
  }

  return {
    snapshot: state.asReadonly(),
    setProps: store.setProps,
    destroy: () => {
      unsubscribe();
      store.destroy();
    },
    store,
  };
}

/**
 * Injection-context helper: creates the store and destroys it with the
 * component. Must be called from an injection context.
 */
export function injectCombobox<O, V = O, Q = string>(
  options: Omit<AngularComboboxOptions<O, V, Q>, 'injector'>,
): AngularComboboxStore<O, V, Q> {
  const destroyRef = inject(DestroyRefToken) as DestroyRef;
  const injector = inject(Injector);
  const instance = createComboboxStore<O, V, Q>({ ...options, injector });
  destroyRef.onDestroy(instance.destroy);
  return instance;
}
