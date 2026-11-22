import type { AdapterId } from './adapter-examples';

export const COMPOSABLE_NOTES: Record<AdapterId, string[]> = {
  vue: [
    'The component and `useHeadlessCombobox` use the same state machine. The component is a thin wrapper that renders its default slot with the scope; the composable returns that scope directly. Use the composable for programmatic control, wrapper components, or layouts that cannot use a slot.',
    'Props accept plain values, refs, or getters. Pass the `modelValue` ref directly; it is unwrapped and tracked internally. The second argument receives every `update:modelValue` payload.',
    'The return value mirrors the slot scope: refs for state, plain functions for actions and ref setters.',
  ],
  react: [
    '`HeadlessCombobox` is a render-prop wrapper around `useHeadlessCombobox`. Use the hook when the markup cannot sit inside the component.',
    'Pass `value` for controlled use, or omit it and use `defaultValue`. `onChange` receives every selection change. The hook returns the same scope object as the render prop.',
    'Spread ARIA bags with `toReactProps`; actions are plain functions on the scope.',
  ],
  svelte: [
    'The component and `createComboboxStore` share the same props. The store is the lower-level API.',
    'Pass props as a getter so the store tracks reactive changes. Call `mount()` after the view exists and `destroy()` on teardown.',
    'The store is readable with `$combobox` in markup. Spread ARIA bags with `toSvelteProps`.',
  ],
  solid: [
    'The component wraps `useHeadlessCombobox`. Use the hook when you do not need the render-prop wrapper.',
    'Pass an options accessor. `value` is controlled; `defaultValue` seeds an uncontrolled store. `onChange` receives every change.',
    'The hook returns an accessor. Call `scope()` inside JSX so bindings stay reactive; spread bags with `toSolidProps`.',
  ],
  angular: [
    '`injectCombobox` is the Angular entry point. It creates the signal store and registers teardown through `DestroyRef`; `createComboboxStore` is the non-DI factory.',
    'Pass props as an object or getter. `modelValue` stays inside `props`; `onChange` and `injector` are options on the helper.',
    '`snapshot()` is a read-only signal. Read it in the template and call actions from it. Ref setters are on the snapshot.',
  ],
};
