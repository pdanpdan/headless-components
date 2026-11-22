# @pdanpdan/headless-combobox-solid

Accessible, renderless combobox for Solid. Backed by [`@pdanpdan/headless-combobox-core`](../headless-combobox-core).

## Install

```bash
pnpm add @pdanpdan/headless-combobox-solid
```

`solid-js@>=2` and `@solidjs/web@>=2` are peer dependencies.

## Usage

```tsx
import { HeadlessCombobox, toSolidProps } from '@pdanpdan/headless-combobox-solid';
import { createSignal, For } from 'solid-js';

const users = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

export function Example() {
  const [ value, setValue ] = createSignal<typeof users[ number ] | null>(null);

  return (
    <HeadlessCombobox
      options={users}
      optionLabel={(user) => user.name}
      value={value()}
      onChange={(next) => setValue(next as typeof users[ number ] | null)}
    >
      {(scope) => (
        <div ref={scope().setContainerRef}>
          <button ref={scope().setTriggerRef} type="button" {...toSolidProps(scope().triggerProps)}>
            {value()?.name ?? 'Select…'}
          </button>
          <ul ref={scope().setDropdownRef} {...toSolidProps(scope().listboxProps)}>
            <For each={scope().filteredOptions}>
              {(user, index) => (
                <li {...toSolidProps(scope().getOptionProps(user, index()))}>
                  {user.name}
                </li>
              )}
            </For>
          </ul>
        </div>
      )}
    </HeadlessCombobox>
  );
}
```

The render prop receives an **accessor**. Keep calling `scope()` inside JSX so every binding stays reactive, because Solid components run once. `useHeadlessCombobox(() => options)` returns the same accessor without the component wrapper.
