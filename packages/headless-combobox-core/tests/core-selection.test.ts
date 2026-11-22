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
  return createCombobox<User, User>({
    props: {
      modelValue: null,
      options: users,
      optionLabel: (user) => user.name,
      ...overrides,
    },
    onChange,
  });
}

describe('core selection and validation detail', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ignores select while locked', () => {
    const onChange = vi.fn();
    const store = makeStore({ disabled: true }, onChange);
    store.getSnapshot().select(users[ 0 ]!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes the last selection on Backspace with nothing selected', () => {
    const onChange = vi.fn();
    const store = makeStore({ multiple: true, modelValue: [] }, onChange);
    const trigger = document.createElement('button');
    document.body.append(trigger);
    store.getSnapshot().setTriggerRef(trigger);
    trigger.addEventListener('keydown', (event) => store.getSnapshot().handleKeydown(event));

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('drops a single value on Backspace', () => {
    const onChange = vi.fn();
    const store = makeStore({ modelValue: users[ 0 ]! }, onChange);
    const trigger = document.createElement('button');
    document.body.append(trigger);
    store.getSnapshot().setTriggerRef(trigger);
    trigger.addEventListener('keydown', (event) => store.getSnapshot().handleKeydown(event));

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('keeps focus after selecting in a multiple popup', async () => {
    const onChange = vi.fn();
    const store = makeStore({ multiple: true, modelValue: [] }, onChange);
    const trigger = document.createElement('button');
    document.body.append(trigger);
    store.getSnapshot().setTriggerRef(trigger);

    await store.getSnapshot().open();
    store.getSnapshot().select(users[ 0 ]!);
    await Promise.resolve();

    expect(store.getSnapshot().isOpen).toBe(true);
    expect(onChange).toHaveBeenCalledWith([ users[ 0 ] ]);
  });

  it('treats a non-array model as empty in multiple mode', () => {
    const store = makeStore({ multiple: true, modelValue: null });
    expect(store.getSnapshot().selectedList).toEqual([]);
    expect(store.getSnapshot().canSelectMore).toBe(true);
  });

  it('clears a single value with and without an open popup', async () => {
    const onChange = vi.fn();
    const store = makeStore({ modelValue: users[ 0 ]! }, onChange);
    store.getSnapshot().clear();
    expect(onChange).toHaveBeenLastCalledWith(null);

    store.setProps({
      modelValue: users[ 0 ]!,
      options: users,
      optionLabel: (user) => user.name,
    });
    const input = document.createElement('input');
    document.body.append(input);
    store.getSnapshot().setInputRef(input);
    await store.getSnapshot().open();
    store.getSnapshot().clear();
    expect(store.getSnapshot().isOpen).toBe(true);
    expect(store.getSnapshot().selectedCount).toBe(0);
  });

  it('finds the selected option by value for alignment', async () => {
    const store = makeStore({
      modelValue: users[ 1 ]!,
      alignSelected: true,
    });
    const dropdown = document.createElement('div');
    const list = document.createElement('div');
    const option = document.createElement('div');
    document.body.append(dropdown);
    dropdown.append(list);
    list.append(option);

    Object.defineProperty(dropdown, 'getBoundingClientRect', {
      value: () => ({ top: 100, width: 100 }),
    });
    Object.defineProperty(dropdown, 'offsetWidth', { value: 100 });
    Object.defineProperty(option, 'getBoundingClientRect', {
      value: () => ({ top: 140, width: 100 }),
    });
    Object.defineProperty(list, 'getBoundingClientRect', {
      value: () => ({ top: 0, bottom: 200, width: 100 }),
    });
    Object.defineProperty(list, 'offsetWidth', { value: 100 });

    store.getSnapshot().setDropdownRef(dropdown);
    store.getSnapshot().setListRef(list);
    store.getSnapshot().setOptionRef(users[ 1 ]!, option);

    await store.getSnapshot().open();
    expect(store.getSnapshot().alignmentOffset).toBe(40);
  });

  it('formats singular and plural validation messages', () => {
    const minOne = makeStore({ multiple: true, modelValue: [], minLength: 1 });
    expect(minOne.getSnapshot().validationMessage).toBe('Select at least 1 option.');

    const maxTwo = makeStore({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]!, users[ 2 ]! ],
      maxLength: 2,
    });
    expect(maxTwo.getSnapshot().validationMessage).toBe('Select at most 2 options.');
  });

  it('short-circuits setSearchQuery when the value is unchanged', () => {
    const store = makeStore();
    store.getSnapshot().setSearchQuery('wa');
    const listener = vi.fn();
    store.subscribe(listener);
    store.getSnapshot().setSearchQuery('wa');
    expect(listener).not.toHaveBeenCalled();
  });
});
