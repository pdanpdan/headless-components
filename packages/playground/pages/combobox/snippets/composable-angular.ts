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
    @let s = combobox.snapshot();

    <div #container>
      <input
        #input
        role="combobox"
        [attr.aria-expanded]="s.isOpen"
        [value]="s.searchQuery ?? value()?.name ?? ''"
        (input)="s.setSearchQuery($any($event.target).value)"
        (keydown)="s.handleTypeaheadKeydown($event)"
      />
      @if (s.isOpen) {
        <ul role="listbox">
          @for (user of s.filteredOptions; track user.id) {
            <li
              role="option"
              [attr.aria-selected]="s.isSelected(user)"
              (click)="s.select(user)"
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

  readonly combobox = injectCombobox<User, User>({
    props: () => ({
      modelValue: this.value(),
      options: users,
      optionLabel: (user) => user.name,
    }),
    onChange: (next) => this.value.set(next as User | null),
  });
}
