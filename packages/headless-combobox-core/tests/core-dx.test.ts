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

function makeStore(
  overrides: Partial<HeadlessComboboxProps<User, User>> = {},
  onChange = vi.fn(),
) {
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

/** A typeahead input wired exactly like the prop bag: no manual keydown handler. */
function typeaheadFixture(
  overrides: Partial<HeadlessComboboxProps<User, User>> = {},
  onChange = vi.fn(),
) {
  const store = makeStore(overrides, onChange);
  const input = document.createElement('input');
  document.body.append(input);
  const snapshot = store.getSnapshot();
  snapshot.setTriggerRef(input);
  snapshot.setInputRef(input);

  input.addEventListener('keydown', (event) => {
    store.getSnapshot().comboboxInputProps.onKeydown(event);
  });

  return { store, onChange, input };
}

function press(target: HTMLElement, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('combobox developer experience', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('types spaces in a typeahead input without opening the popup', () => {
    const { store, input } = typeaheadFixture();

    const space = press(input, ' ');

    expect(space.defaultPrevented).toBe(false);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('navigates from a typeahead input through the built-in keydown handler', async () => {
    const { store, input } = typeaheadFixture();

    press(input, 'ArrowDown');
    expect(store.getSnapshot().isOpen).toBe(true);
    expect(store.getSnapshot().highlightedIndex).toBe(0);

    press(input, 'ArrowDown');
    expect(store.getSnapshot().highlightedIndex).toBe(1);

    press(input, 'Enter');
    expect(store.getSnapshot().isSelected(users[ 1 ]!)).toBe(true);
  });

  it('removes the last chip on Backspace in an empty typeahead input', () => {
    const onChange = vi.fn();
    const { store, input } = typeaheadFixture({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
    }, onChange);

    press(input, 'Backspace');

    expect(onChange).toHaveBeenLastCalledWith([ users[ 0 ] ]);
    expect(store.getSnapshot().selectedCount).toBe(1);
  });

  it('keeps native Backspace while the typeahead input holds text', () => {
    const onChange = vi.fn();
    const { store, input } = typeaheadFixture({
      multiple: true,
      modelValue: [ users[ 0 ]! ],
    }, onChange);

    input.value = 'wa';
    const event = press(input, 'Backspace');

    expect(event.defaultPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(store.getSnapshot().selectedCount).toBe(1);
  });

  it('resolves the flat option index when getOptionProps has no index', async () => {
    const store = makeStore();
    await store.getSnapshot().open();
    store.getSnapshot().setHighlightedIndex(1);

    const withoutIndex = store.getSnapshot().getOptionProps(users[ 1 ]!);
    const withIndex = store.getSnapshot().getOptionProps(users[ 1 ]!, 1);

    expect(withoutIndex.id).toBe(withIndex.id);
    expect(withoutIndex[ 'data-highlighted' ]).toBe(true);
    expect(withoutIndex[ 'aria-selected' ]).toBe(false);
    expect(withoutIndex[ 'aria-posinset' ]).toBe(2);
    expect(withoutIndex[ 'aria-setsize' ]).toBe(3);
  });

  it('announces result counts through a polite live region', async () => {
    const store = makeStore();

    expect(store.getSnapshot().statusMessage).toBe('');
    expect(store.getSnapshot().statusProps).toEqual({
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true,
    });

    await store.getSnapshot().open();
    expect(store.getSnapshot().statusMessage).toBe('3 results available.');

    store.getSnapshot().setSearchQuery('wade');
    expect(store.getSnapshot().statusMessage).toBe('1 result available.');

    store.getSnapshot().setSearchQuery('nothing');
    expect(store.getSnapshot().statusMessage).toBe('No results found.');

    store.getSnapshot().close();
    expect(store.getSnapshot().statusMessage).toBe('');
  });

  it('creates a value from the query when no option matches', async () => {
    const onChange = vi.fn();
    const { store, input } = typeaheadFixture({
      creatable: true,
      createOption: (query) => ({ id: 99, name: query }),
    }, onChange);

    await store.getSnapshot().open();
    store.getSnapshot().setSearchQuery('New Person');
    expect(store.getSnapshot().canCreate).toBe(true);

    press(input, 'Enter');

    expect(onChange).toHaveBeenCalledWith({ id: 99, name: 'New Person' });
    expect(store.getSnapshot().selectedCount).toBe(1);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('does not create duplicates of existing option labels', async () => {
    const { store } = typeaheadFixture({
      creatable: true,
      createOption: (query) => ({ id: 99, name: query }),
    });

    await store.getSnapshot().open();
    store.getSnapshot().setSearchQuery('Wade Cooper');

    expect(store.getSnapshot().canCreate).toBe(false);
  });

  it('appends created values in multiple mode and respects maxLength', async () => {
    const onChange = vi.fn();
    const { store } = typeaheadFixture({
      multiple: true,
      modelValue: [],
      maxLength: 1,
      creatable: true,
      createOption: (query) => ({ id: 99, name: query }),
      closeOnSelect: false,
    }, onChange);

    await store.getSnapshot().open();
    store.getSnapshot().setSearchQuery('First');
    store.getSnapshot().createSelection();
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 99, name: 'First' },
    ]);
    expect(store.getSnapshot().canCreate).toBe(false);
    expect(store.getSnapshot().isOpen).toBe(true);
  });

  it('ignores creation while locked or disabled', () => {
    const locked = typeaheadFixture({
      readonly: true,
      creatable: true,
      createOption: (query) => ({ id: 99, name: query }),
    });
    locked.store.getSnapshot().setSearchQuery('New Person');
    expect(locked.store.getSnapshot().canCreate).toBe(false);

    const disabled = typeaheadFixture({
      disabled: true,
      creatable: true,
      createOption: (query) => ({ id: 99, name: query }),
    });
    disabled.store.getSnapshot().setSearchQuery('New Person');
    expect(disabled.store.getSnapshot().canCreate).toBe(false);
  });
});
