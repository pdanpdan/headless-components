let idCounter = 0;

/**
 * The three host capabilities the core needs. Adapters override them with
 * framework-specific implementations:
 *
 * - `nextTick`: resolves after the framework has committed the DOM, so the
 *   popup can be measured/focused;
 * - `unwrap`: strips framework proxies before identity comparisons (Vue
 *   passes `toRaw`, every other adapter keeps the identity default);
 * - `createId`: stable id source (React/Vue pass their own `useId`).
 */
export interface ComboboxRuntime {
  nextTick: () => Promise<void>;
  unwrap: <T>(value: T) => T;
  createId: () => string;
  getDocument: () => Document | null;
}

export type ComboboxRuntimeOverrides = Partial<ComboboxRuntime>;

export function createRuntime(overrides: ComboboxRuntimeOverrides = {}): ComboboxRuntime {
  return {
    nextTick: overrides.nextTick ?? (() => Promise.resolve()),
    unwrap: overrides.unwrap ?? (<T>(value: T): T => value),
    createId: overrides.createId ?? (() => `headless-combobox-${ ++idCounter }`),
    getDocument: overrides.getDocument ?? (() => typeof document === 'undefined'
      ? null
      : document),
  };
}
