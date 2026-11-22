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
import { Component, effect, ElementRef, signal, viewChild } from '@angular/core';
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
    @let s = combobox.snapshot();

    <div #container>
      <button
        #trigger
        type="button"
        role="combobox"
        [attr.aria-controls]="s.triggerProps['aria-controls']"
        [attr.aria-expanded]="s.triggerProps['aria-expanded']"
        [attr.aria-haspopup]="s.triggerProps['aria-haspopup']"
        [attr.aria-activedescendant]="s.triggerProps['aria-activedescendant']"
        [attr.aria-disabled]="s.triggerProps['aria-disabled'] || null"
        [attr.aria-readonly]="s.triggerProps['aria-readonly'] || null"
        [disabled]="s.triggerProps.disabled ?? false"
        (click)="s.triggerProps.onClick()"
        (keydown)="s.triggerProps.onKeydown($event)"
      >
        {{ value()?.name ?? 'Select…' }}
      </button>

      @if (s.isOpen) {
        <ul
          #list
          role="listbox"
          [attr.id]="s.listboxProps.id"
          [attr.aria-multiselectable]="s.listboxProps['aria-multiselectable'] || null"
        >
          @for (user of s.filteredOptions; track user.id; let i = $index) {
            @let o = s.getOptionProps(user, i);
            <li
              [attr.id]="o.id"
              role="option"
              [attr.aria-selected]="o['aria-selected']"
              [attr.aria-disabled]="o['aria-disabled'] || null"
              [attr.aria-posinset]="o['aria-posinset']"
              [attr.aria-setsize]="o['aria-setsize']"
              [attr.data-highlighted]="o['data-highlighted'] || null"
              (click)="o.onClick()"
              (mousedown)="o.onMousedown($event)"
              (mouseenter)="o.onMousemove()"
              (focus)="o.onFocus()"
              (keydown)="o.onKeydown($event)"
            >
              {{ user.name }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ExampleComponent {
  readonly value = signal<User | null>(null);

  readonly container = viewChild<ElementRef<HTMLElement>>('container');
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly list = viewChild<ElementRef<HTMLElement>>('list');

  readonly combobox = injectCombobox<User, User>({
    props: () => ({
      modelValue: this.value(),
      options: users,
      optionLabel: (user) => user.name,
    }),
    onChange: (next) => this.value.set(next as User | null),
  });

  constructor() {
    effect(() => {
      const snapshot = this.combobox.snapshot();
      snapshot.setContainerRef(this.container()?.nativeElement ?? null);
      snapshot.setTriggerRef(this.trigger()?.nativeElement ?? null);
      snapshot.setDropdownRef(this.list()?.nativeElement ?? null);
      snapshot.setListRef(this.list()?.nativeElement ?? null);
    });
  }
}
```

`combobox.snapshot()` is a read-only signal. Push new props with `combobox.setProps(...)` when inputs change. `createComboboxStore(options)` is the non-DI factory if you need to manage lifetime yourself.
