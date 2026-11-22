import type { HeadlessComboboxProps } from '../src';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCombobox } from '../src';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
];

function makeStore(overrides: Partial<HeadlessComboboxProps<User, User>> = {}, onChange = vi.fn()) {
  const props: HeadlessComboboxProps<User, User> = {
    modelValue: null,
    options: users,
    optionLabel: (user) => user.name,
    ...overrides,
  };
  const store = createCombobox<User, User>({ props, onChange });
  return { store, props, onChange };
}

describe('core combobox', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts closed with the full option list', () => {
    const { store } = makeStore();

    expect(store.getSnapshot().isOpen).toBe(false);
    expect(store.getSnapshot().filteredOptions).toEqual(users);
    expect(store.getSnapshot().selectedList).toEqual([]);
    expect(store.getSnapshot().valid).toBe(true);
  });

  it('selects a single value and closes', () => {
    const { store, onChange } = makeStore();
    const trigger = document.createElement('button');
    store.getSnapshot().setTriggerRef(trigger);

    store.getSnapshot().select(users[ 1 ]!);

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(store.getSnapshot().isSelected(users[ 1 ]!)).toBe(true);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('keeps the emitted value visible before the adapter round-trips props', () => {
    const { store } = makeStore();

    store.getSnapshot().select(users[ 0 ]!);

    expect(store.getSnapshot().selectedCount).toBe(1);
    expect(store.getSnapshot().isSelected(users[ 0 ]!)).toBe(true);

    // The adapter pushes the new props back; the local mirror clears.
    store.setProps({
      ...usersToProps([ users[ 0 ]! ]),
      modelValue: users[ 0 ]!,
    });
    expect(store.getSnapshot().isSelected(users[ 0 ]!)).toBe(true);
  });

  it('toggles multiple selection and respects maxLength', () => {
    const { store, onChange } = makeStore({
      multiple: true,
      modelValue: [],
      maxLength: 1,
    });

    store.getSnapshot().select(users[ 0 ]!);
    expect(onChange).toHaveBeenLastCalledWith([ users[ 0 ] ]);
    expect(store.getSnapshot().isOpen).toBe(false);
    expect(store.getSnapshot().canSelectMore).toBe(false);
    expect(store.getSnapshot().getOptionProps(users[ 1 ]!, 1)[ 'aria-disabled' ]).toBe(true);

    store.getSnapshot().select(users[ 0 ]!);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('filters as the query changes and moves the highlight to the first match', () => {
    const { store } = makeStore();

    store.getSnapshot().setSearchQuery('wade');

    expect(store.getSnapshot().filteredOptions).toEqual([ users[ 0 ] ]);
    expect(store.getSnapshot().highlightedIndex).toBe(0);

    store.getSnapshot().setSearchQuery(undefined);
    expect(store.getSnapshot().filteredOptions).toEqual(users);
  });

  it('uses a custom filter and option value mapper', () => {
    const { store, onChange } = makeStore({
      options: [ 'Alpha', 'Beta' ] as unknown as User[],
      optionFilter: (option, query) => String(option) === query,
      optionValue: (option) => ({
        id: 1,
        name: String(option),
      }),
    });

    store.getSnapshot().setSearchQuery('Beta');
    expect(store.getSnapshot().filteredOptions).toEqual([ 'Beta' ]);

    store.getSnapshot().select('Beta' as unknown as User);
    expect(onChange).toHaveBeenCalledWith({ id: 1, name: 'Beta' });
  });

  it('validates required/minLength/maxLength', () => {
    const { store } = makeStore({
      multiple: true,
      modelValue: [],
      required: true,
      minLength: 2,
    });

    expect(store.getSnapshot().errors).toEqual([ 'required', 'minlength' ]);
    expect(store.getSnapshot().validationMessage).toBe('Selection is required.');

    store.setProps({
      ...usersToProps([ users[ 0 ]!, users[ 1 ]! ]),
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
      multiple: true,
      required: true,
      minLength: 2,
    });
    expect(store.getSnapshot().errors).toEqual([]);
    expect(store.getSnapshot().valid).toBe(true);
  });

  it('navigates with the keyboard and selects with Enter', () => {
    const { store, onChange } = makeStore();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);

    const { triggerProps } = store.getSnapshot();
    trigger.addEventListener('click', triggerProps.onClick);
    trigger.addEventListener('keydown', triggerProps.onKeydown);
    store.getSnapshot().setTriggerRef(trigger);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(store.getSnapshot().isOpen).toBe(true);
    expect(store.getSnapshot().highlightedIndex).toBe(0);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(store.getSnapshot().highlightedIndex).toBe(1);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(onChange).toHaveBeenLastCalledWith(users[ 1 ]);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('closes on Escape and on an outside mousedown after mount', async () => {
    const { store } = makeStore();
    const container = document.createElement('div');
    document.body.appendChild(container);
    store.getSnapshot().setContainerRef(container);
    store.mount();

    await store.getSnapshot().open();
    expect(store.getSnapshot().isOpen).toBe(true);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(false);

    await store.getSnapshot().open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(false);

    store.destroy();
  });

  it('does not close for clicks inside the widget boundary', async () => {
    const { store } = makeStore();
    const container = document.createElement('div');
    document.body.appendChild(container);
    store.getSnapshot().setContainerRef(container);
    store.mount();

    await store.getSnapshot().open();
    container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(true);

    store.destroy();
  });

  it('returns a stable snapshot until something changes', () => {
    const { store, props } = makeStore();

    const first = store.getSnapshot();
    expect(store.getSnapshot()).toBe(first);

    store.setProps(props);
    expect(store.getSnapshot()).toBe(first);

    store.getSnapshot().setSearchQuery('wade');
    expect(store.getSnapshot()).not.toBe(first);
  });

  it('notifies subscribers once per batch and stops after destroy', () => {
    const { store } = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.getSnapshot().setSearchQuery('wade');
    expect(listener).toHaveBeenCalledTimes(1);

    store.getSnapshot().select(users[ 0 ]!);
    expect(listener).toHaveBeenCalledTimes(2);

    store.destroy();
    store.getSnapshot().setSearchQuery('devon');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('sanitizes framework ids for CSS anchor names', () => {
    const { store } = makeStore({ id: '«r0:combobox»' });
    const snapshot = store.getSnapshot();

    expect(snapshot.cssAnchorName).toBe('--anchor--r0-combobox-');
    expect(snapshot.listboxProps.id).toBe('-r0-combobox--listbox');
    expect(snapshot.triggerProps[ 'aria-controls' ]).toBe(snapshot.listboxProps.id);
  });

  it('exposes anchor positioning and the alignSelected offset', () => {
    const { store } = makeStore({ alignSelected: true });

    expect(store.getSnapshot().popupStyle.top).toBe('anchor(top)');
    expect(store.getSnapshot().popupStyle.translate).toBe('0 -0px');
  });

  it('backspace removes the trailing selection in multiple mode', async () => {
    const { store, onChange } = makeStore({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
    });
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    store.getSnapshot().setTriggerRef(trigger);
    trigger.addEventListener('keydown', store.getSnapshot().handleKeydown);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));

    expect(onChange).toHaveBeenLastCalledWith([ users[ 0 ] ]);
  });

  it('opens with an empty query in clear mode and selects the input text otherwise', async () => {
    const clearStore = makeStore({ inputOnOpen: 'clear' }).store;
    await clearStore.getSnapshot().open();
    expect(clearStore.getSnapshot().searchQuery).toBe('');

    const selectStore = makeStore().store;
    const input = document.createElement('input');
    input.value = 'Wade';
    document.body.appendChild(input);
    selectStore.getSnapshot().setInputRef(input);
    await selectStore.getSnapshot().open();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(4);
  });
});

function usersToProps(options: User[]): HeadlessComboboxProps<User, User> {
  return {
    modelValue: null,
    options,
    optionLabel: (user) => user.name,
  };
}
