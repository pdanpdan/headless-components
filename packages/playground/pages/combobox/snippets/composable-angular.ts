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
      <input
        #input
        role="combobox"
        aria-label="Search users"
        [attr.aria-controls]="s.comboboxInputProps['aria-controls']"
        [attr.aria-expanded]="s.comboboxInputProps['aria-expanded']"
        [attr.aria-haspopup]="s.comboboxInputProps['aria-haspopup']"
        [attr.aria-activedescendant]="s.comboboxInputProps['aria-activedescendant']"
        [attr.aria-disabled]="s.comboboxInputProps['aria-disabled'] || null"
        [attr.aria-readonly]="s.comboboxInputProps['aria-readonly'] || null"
        [disabled]="s.comboboxInputProps.disabled ?? false"
        [readOnly]="s.comboboxInputProps.readonly ?? false"
        [value]="s.searchQuery ?? value()?.name ?? ''"
        (click)="s.comboboxInputProps.onClick()"
        (focus)="s.comboboxInputProps.onFocus()"
        (input)="s.comboboxInputProps.onInput($event)"
        (keydown)="s.comboboxInputProps.onKeydown($event)"
      />
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
export class Example {
  readonly value = signal<User | null>(null);

  readonly container = viewChild<ElementRef<HTMLElement>>('container');
  readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
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
      snapshot.setTriggerRef(this.input()?.nativeElement ?? null);
      snapshot.setInputRef(this.input()?.nativeElement ?? null);
      snapshot.setDropdownRef(this.list()?.nativeElement ?? null);
      snapshot.setListRef(this.list()?.nativeElement ?? null);
    });
  }
}
