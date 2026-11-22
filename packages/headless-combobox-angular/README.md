# @pdanpdan/headless-combobox-angular

Accessible, renderless combobox for Angular, backed by [`@pdanpdan/headless-combobox-core`](../headless-combobox-core) and exposed through Angular signals.

## Install

```bash
pnpm add @pdanpdan/headless-combobox-angular
```

`@angular/core@>=19` is a peer dependency.

## Usage

Call `injectCombobox` from an injection context (component constructor or field initializer). It registers teardown with the component's `DestroyRef`.

```ts
import { Component, signal } from '@angular/core';
import { injectCombobox } from '@pdanpdan/headless-combobox-angular';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

@Component({
  standalone: true,
  selector: 'app-example',
  template: `
    <div>
      <button
        type="button"
        [attr.aria-expanded]="combobox.snapshot().triggerProps['aria-expanded']"
        (click)="combobox.snapshot().triggerProps.onClick()"
      >
        {{ value()?.name ?? 'Select…' }}
      </button>

      <ul [attr.role]="combobox.snapshot().listboxProps.role">
        @for (user of combobox.snapshot().filteredOptions; track user.id) {
          <li
            [attr.role]="'option'"
            [attr.aria-selected]="combobox.snapshot().isSelected(user)"
            (click)="combobox.snapshot().select(user)"
          >
            {{ user.name }}
          </li>
        }
      </ul>
    </div>
  `,
})
export class ExampleComponent {
  readonly value = signal<User | null>(null);

  readonly combobox = injectCombobox<User, User>({
    props: () => ({
      modelValue: this.value(),
      options: users,
      optionLabel: (user) => user.name,
    }),
    onChange: (next) => this.value.set(next as User | null),
  });
}
```

`combobox.snapshot()` is a read-only signal. Push new props with `combobox.setProps(...)` when inputs change. `createComboboxStore(options)` is the non-DI factory if you need to manage lifetime yourself.
