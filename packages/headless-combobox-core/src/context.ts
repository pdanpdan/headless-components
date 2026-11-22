import type { ComboboxRuntime } from './runtime';
import type { HeadlessComboboxDomRefs, HeadlessComboboxProps } from './types';

export interface ComboboxState<Q> {
  isOpen: boolean;
  searchQuery: Q | undefined;
  highlightedIndex: number;
  alignmentOffset: number;
}

/**
 * Shared mutable context. Feature modules receive it instead of Vue refs and
 * computed values; every mutation goes through `mutate`, which bumps `version`
 * so lazily computed values know they are stale.
 */
export interface ComboboxContext<O, V, Q> {
  props: HeadlessComboboxProps<O, V, Q>;
  state: ComboboxState<Q>;
  refs: HeadlessComboboxDomRefs<O>;
  runtime: ComboboxRuntime;
  /** Monotonic revision; changes whenever props or state change. */
  version: number;
  /** Batch state changes and notify subscribers once at the end. */
  mutate: <T>(fn: () => T) => T;
  /** Mark state as changed (invalidates memoized values immediately). */
  bump: () => void;
  /** The model value, including any change emitted but not yet round-tripped through props. */
  getModelValue: () => V | V[] | null;
  /** Record and publish a model change. Call inside `mutate`. */
  emitModel: (value: V | V[] | null) => void;
  nextTick: () => Promise<void>;
  unwrap: <T>(value: T) => T;
}

/**
 * Lazy memoization keyed by the context revision. A state change bumps the
 * version, so values read later in the same mutation are recomputed, while
 * repeated reads in one revision stay cached.
 */
export function createMemo<T>(ctx: Pick<ComboboxContext<never, never, never>, 'version'>): (compute: () => T) => () => T {
  return (compute) => {
    let version = -1;
    let value!: T;
    return () => {
      if (version !== ctx.version) {
        value = compute();
        version = ctx.version;
      }
      return value;
    };
  };
}
