# @pdanpdan/headless-combobox-react

Accessible, renderless combobox for React. The state machine comes from [`@pdanpdan/headless-combobox-core`](../headless-combobox-core); this package adds React state synchronization and event-name mapping.

## Install

```bash
pnpm add @pdanpdan/headless-combobox-react
```

`react@>=18` is a peer dependency.

## Usage

```tsx
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-react';
import { useState } from 'react';

const users = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

export function Example() {
  const [ value, setValue ] = useState<typeof users[ number ] | null>(null);

  return (
    <HeadlessCombobox
      options={users}
      optionLabel={(user) => user.name}
      value={value}
      onChange={(next) => setValue(next as typeof users[ number ] | null)}
    >
      {(scope) => (
        <div ref={scope.setContainerRef}>
          <button ref={scope.setTriggerRef} type="button" {...scope.triggerProps}>
            {value?.name ?? 'Select…'}
          </button>
          <ul ref={scope.setDropdownRef} {...scope.listboxProps}>
            {scope.filteredOptions.map((user, index) => (
              <li
                key={user.id}
                ref={(el) => scope.setOptionRef(user, el)}
                {...scope.getOptionProps(user, index)}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </HeadlessCombobox>
  );
}
```

- `value` + `onChange` for controlled usage; omit `value` and pass `defaultValue` for uncontrolled.
- Spread the adapter's prop bags directly. For a raw core snapshot, `toReactProps` maps `onKeydown` / `onMousedown` / `onMousemove` and `autocomplete` to React names.
- `useHeadlessCombobox(options)` returns the same scope without the component wrapper.

The same focus, filtering, validation, and keyboard behavior is tested once in the core and shared with every adapter.
