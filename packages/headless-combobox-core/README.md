# @pdanpdan/headless-combobox-core

The framework-independent combobox state machine behind every adapter. Zero dependencies, no framework imports. It owns selection, filtering, validation, keyboard navigation, popup lifecycle, CSS-anchor positioning, and focus management; adapters only translate its snapshot into their reactive primitive and supply DOM refs.

## Install

```bash
pnpm add @pdanpdan/headless-combobox-core
```

## Usage

```ts
import { createCombobox } from '@pdanpdan/headless-combobox-core';

const store = createCombobox<string>({
  props: {
    modelValue: null,
    options: [ 'JavaScript', 'TypeScript', 'Rust' ],
  },
  onChange: (value) => {
    console.log('selected', value);
  },
});

// Lazy, revision-keyed snapshot: state + actions + ARIA prop bags.
const subscribe = store.subscribe(() => {
  render(store.getSnapshot());
});

const triggerElement = document.createElement('button');
const dropdownElement = document.createElement('div');
store.getSnapshot().setTriggerRef(triggerElement);
store.getSnapshot().setDropdownRef(dropdownElement);
store.mount(); // document-level click-outside / Escape listeners

render(store.getSnapshot());

function render(scope) {
  // bind scope.triggerProps, scope.listboxProps, scope.getOptionProps(...)
  console.log(scope.triggerProps.id, scope.filteredOptions.length);
}

// teardown
subscribe();
store.destroy();
```

Adapters pass a runtime for the framework-specific concerns:

```ts
import { createCombobox } from '@pdanpdan/headless-combobox-core';

const props = {
  modelValue: null,
  options: [ 'One', 'Two' ],
};
const onChange = (value) => console.log(value);

createCombobox({
  props,
  onChange,
  runtime: {
    nextTick: () => Promise.resolve(), // resolve after the framework commits the DOM
    unwrap: (value) => value, // Vue passes toRaw; others keep identity
    createId: () => 'combobox', // optional stable id source
    getDocument: () => document, // defaults to the global document when available
  },
});
```

The store is a plain object: `getSnapshot()`, `subscribe()`, `setProps()`, `setState()`, `mount()`, `destroy()`. The snapshot's identity changes only when state or props change, so it plugs directly into React's `useSyncExternalStore`, Svelte stores, Solid signals, and Angular signals.
