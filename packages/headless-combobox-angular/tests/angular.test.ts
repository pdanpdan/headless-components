import type { EnvironmentInjector } from '@angular/core';

import { createEnvironmentInjector, Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { createComboboxStore, injectCombobox } from '../src';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
];

describe('angular adapter', () => {
  it('exposes the snapshot through an Angular signal', () => {
    const onChange = vi.fn();
    const combobox = createComboboxStore<User, User>({
      props: {
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      },
      onChange,
    });

    expect(combobox.snapshot().isOpen).toBe(false);

    combobox.store.getSnapshot().select(users[ 0 ]!);

    expect(onChange).toHaveBeenCalledWith(users[ 0 ]);
    expect(combobox.snapshot().isSelected(users[ 0 ]!)).toBe(true);

    combobox.destroy();
  });

  it('accepts a props getter', () => {
    const combobox = createComboboxStore<User, User>({
      props: () => ({
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      }),
    });

    expect(combobox.snapshot().filteredOptions).toEqual(users);
    combobox.destroy();
  });

  it('pushes new props into the core through setProps', () => {
    const combobox = createComboboxStore<User, User>({
      props: {
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      },
    });

    combobox.setProps({
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
      options: users,
      optionLabel: (user) => user.name,
      multiple: true,
      required: true,
      minLength: 2,
    });

    expect(combobox.snapshot().selectedCount).toBe(2);
    expect(combobox.snapshot().valid).toBe(true);

    combobox.destroy();
  });

  it('registers teardown through the injection context', () => {
    // Angular 22 requires a parent; a null injector is enough for a detached scope.
    const parent = Injector.NULL as unknown as EnvironmentInjector;
    const injector = createEnvironmentInjector([], parent);

    const combobox = runInInjectionContext(injector, () => injectCombobox<User, User>({
      props: {
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      },
    }));

    const listener = vi.fn();
    combobox.store.subscribe(listener);
    expect(combobox.snapshot().filteredOptions).toEqual(users);

    injector.destroy();
    combobox.store.setState({ searchQuery: 'wade' });

    expect(listener).not.toHaveBeenCalled();
  });
});
