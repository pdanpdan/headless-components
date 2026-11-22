import type { HeadlessComboboxProps } from '../src';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

function makeProps(overrides: Partial<HeadlessComboboxProps<User, User>> = {}): HeadlessComboboxProps<User, User> {
  return {
    modelValue: null,
    options: users,
    optionLabel: (user) => user.name,
    ...overrides,
  };
}

function fixture(overrides: Partial<HeadlessComboboxProps<User, User>> = {}) {
  const onChange = vi.fn();
  const store = createCombobox<User, User>({
    props: makeProps(overrides),
    onChange,
  });
  const container = document.createElement('div');
  const trigger = document.createElement('button');
  const input = document.createElement('input');
  const dropdown = document.createElement('div');
  const list = document.createElement('div');
  const outside = document.createElement('button');
  const optionEls = users.map(() => document.createElement('button'));

  container.append(trigger, input, dropdown);
  dropdown.append(list);
  optionEls.forEach((el) => list.append(el));
  document.body.append(container, outside);

  const snapshot = store.getSnapshot();
  snapshot.setContainerRef(container);
  snapshot.setTriggerRef(trigger);
  snapshot.setInputRef(input);
  snapshot.setDropdownRef(dropdown);
  snapshot.setListRef(list);
  optionEls.forEach((el, index) => snapshot.setOptionRef(users[ index ]!, el));

  trigger.addEventListener('keydown', (event) => store.getSnapshot().handleKeydown(event));
  input.addEventListener('keydown', (event) => store.getSnapshot().handleKeydown(event));

  return {
    store,
    onChange,
    container,
    trigger,
    input,
    dropdown,
    list,
    outside,
    optionEls,
  };
}

function press(target: HTMLElement, key: string, init: { shiftKey?: boolean; } = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

describe('core navigation', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([ {} as DOMRect ] as unknown as DOMRectList);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('ignores out-of-range and unchanged highlight updates', () => {
    const { store } = fixture();
    store.getSnapshot().setHighlightedIndex(-1);
    store.getSnapshot().setHighlightedIndex(99);
    store.getSnapshot().setHighlightedIndex(0);
    store.getSnapshot().setHighlightedIndex(0);
    expect(store.getSnapshot().highlightedIndex).toBe(0);
  });

  it('opens from the closed state with Enter, Space, and arrows', async () => {
    for (const key of [ 'Enter', ' ', 'ArrowDown', 'ArrowUp' ]) {
      const { store, trigger } = fixture();
      const event = press(trigger, key);
      expect(event.defaultPrevented).toBe(true);
      expect(store.getSnapshot().isOpen).toBe(true);
      await store.getSnapshot().open();
      store.getSnapshot().close();
    }
  });

  it('does not open for other keys or when locked', () => {
    const other = fixture();
    expect(press(other.trigger, 'a').defaultPrevented).toBe(false);
    expect(other.store.getSnapshot().isOpen).toBe(false);

    const locked = fixture({ disabled: true });
    expect(press(locked.trigger, 'ArrowDown').defaultPrevented).toBe(false);
    expect(locked.store.getSnapshot().isOpen).toBe(false);
  });

  it('removes the last selection on Backspace when closed', () => {
    const { store, onChange, trigger } = fixture({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
    });
    store.getSnapshot().setInputRef(null);

    press(trigger, 'Backspace');
    expect(onChange).toHaveBeenLastCalledWith([ users[ 0 ] ]);
  });

  it('checks text values on contenteditable and textarea triggers', () => {
    for (const tag of [ 'div', 'textarea' ] as const) {
      const element = document.createElement(tag) as HTMLElement;
      if (tag === 'div') {
        element.contentEditable = 'true';
        Object.defineProperty(element, 'isContentEditable', { configurable: true, value: true });
      } else {
        (element as HTMLTextAreaElement).value = '';
      }
      const { store, onChange, container } = fixture({
        multiple: true,
        modelValue: [ users[ 0 ]!, users[ 1 ]! ],
      });
      element.addEventListener('keydown', (event) => store.getSnapshot().handleKeydown(event));
      store.getSnapshot().setTriggerRef(element);
      store.getSnapshot().setInputRef(null);
      container.append(element);

      press(element, 'Backspace');
      expect(onChange).toHaveBeenLastCalledWith([ users[ 0 ] ]);

      if (tag === 'div') {
        element.textContent = 'text';
      } else {
        (element as HTMLTextAreaElement).value = 'text';
      }
      onChange.mockClear();
      press(element, 'Backspace');
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  it('moves the highlight with arrows and wraps', async () => {
    const { store, trigger } = fixture();
    await store.getSnapshot().open();

    press(trigger, 'ArrowDown');
    expect(store.getSnapshot().highlightedIndex).toBe(1);
    press(trigger, 'ArrowUp');
    expect(store.getSnapshot().highlightedIndex).toBe(0);
    press(trigger, 'ArrowUp');
    expect(store.getSnapshot().highlightedIndex).toBe(2);
    press(trigger, 'ArrowDown');
    expect(store.getSnapshot().highlightedIndex).toBe(0);
  });

  it('selects the highlighted option with Enter', async () => {
    const { store, trigger, onChange } = fixture();
    await store.getSnapshot().open();
    press(trigger, 'ArrowDown');
    press(trigger, 'Enter');

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('ignores Enter when nothing is highlighted', async () => {
    const { store, onChange } = fixture({ options: [] });
    await store.getSnapshot().open();
    expect(store.getSnapshot().highlightedIndex).toBe(-1);
    store.getSnapshot().handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('jumps with Home and End on non-input targets', async () => {
    const { store, trigger } = fixture();
    await store.getSnapshot().open();

    press(trigger, 'End');
    expect(store.getSnapshot().highlightedIndex).toBe(2);
    press(trigger, 'Home');
    expect(store.getSnapshot().highlightedIndex).toBe(0);
  });

  it('keeps Home and End native inside inputs', async () => {
    const { store, input } = fixture();
    await store.getSnapshot().open();
    const event = press(input, 'End');

    expect(event.defaultPrevented).toBe(false);
    expect(store.getSnapshot().highlightedIndex).toBe(0);
  });

  it('pages by the number of visible options', async () => {
    const { store, trigger, list, optionEls } = fixture();
    await store.getSnapshot().open();
    Object.defineProperty(list, 'clientHeight', { configurable: true, value: 100 });
    Object.defineProperty(optionEls[ 0 ], 'offsetHeight', { configurable: true, value: 20 });

    press(trigger, 'PageDown');
    expect(store.getSnapshot().highlightedIndex).toBe(2);
    press(trigger, 'PageUp');
    expect(store.getSnapshot().highlightedIndex).toBe(0);
  });

  it('uses a default page size without measured elements', async () => {
    const { store, trigger } = fixture();
    await store.getSnapshot().open();

    press(trigger, 'PageDown');
    expect(store.getSnapshot().highlightedIndex).toBe(2);
  });

  it('clears the highlight when every option is disabled', async () => {
    const { store, trigger } = fixture({ multiple: true, modelValue: [], maxLength: 0 });
    await store.getSnapshot().open();

    expect(store.getSnapshot().highlightedIndex).toBe(-1);
    press(trigger, 'ArrowDown');
    expect(store.getSnapshot().highlightedIndex).toBe(-1);
    press(trigger, 'End');
    expect(store.getSnapshot().highlightedIndex).toBe(-1);
  });

  it('skips disabled options while stepping and sounding out the edges', async () => {
    const { store, trigger } = fixture({
      multiple: true,
      modelValue: [ users[ 1 ]! ],
      maxLength: 1,
    });
    await store.getSnapshot().open();
    expect(store.getSnapshot().highlightedIndex).toBe(1);

    press(trigger, 'ArrowDown');
    expect(store.getSnapshot().highlightedIndex).toBe(1);
    press(trigger, 'ArrowUp');
    expect(store.getSnapshot().highlightedIndex).toBe(1);
  });

  it('does not select or remove on Space from the trigger', async () => {
    const { store, trigger, onChange } = fixture();
    await store.getSnapshot().open();
    press(trigger, 'ArrowDown');
    const event = press(trigger, ' ');

    expect(event.defaultPrevented).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('lets Space through inside an input', async () => {
    const { store, input } = fixture();
    await store.getSnapshot().open();
    expect(press(input, ' ').defaultPrevented).toBe(false);
  });

  it('only removes on Backspace when the filter is empty', async () => {
    const { store, input, onChange } = fixture({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
    });
    await store.getSnapshot().open();

    input.value = 'text';
    press(input, 'Backspace');
    expect(onChange).not.toHaveBeenCalled();

    input.value = '';
    press(input, 'Backspace');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles the typeahead trigger as the input', async () => {
    const { store, container, onChange } = fixture({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
    });
    const input = document.createElement('input');
    container.append(input);
    input.addEventListener('keydown', (event) => store.getSnapshot().handleKeydown(event));
    store.getSnapshot().setTriggerRef(input);
    store.getSnapshot().setInputRef(input);
    await store.getSnapshot().open();

    input.value = 'text';
    press(input, 'Backspace');
    expect(onChange).not.toHaveBeenCalled();

    input.value = '';
    press(input, 'Backspace');
    expect(onChange).toHaveBeenLastCalledWith([ users[ 0 ] ]);
  });

  it('focuses the next control on Tab and closes', async () => {
    const { store, trigger, outside, input } = fixture();
    input.disabled = true;
    await store.getSnapshot().open();
    trigger.focus();

    press(trigger, 'Tab');
    expect(document.activeElement).not.toBe(trigger);
    expect(store.getSnapshot().isOpen).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('selects on Tab when requested', async () => {
    const { store, trigger, onChange } = fixture({ selectOnTab: true });
    trigger.focus();
    await store.getSnapshot().open();
    press(trigger, 'ArrowDown');

    press(trigger, 'Tab');
    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('handles Reverse Tab', async () => {
    const { store, trigger, outside, input } = fixture();
    input.disabled = true;
    document.body.prepend(outside);
    trigger.focus();
    await store.getSnapshot().open();

    press(trigger, 'Tab', { shiftKey: true });
    expect(document.activeElement).not.toBe(trigger);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('stays open when focus lands inside the widget', async () => {
    const { store, trigger, input } = fixture();
    await store.getSnapshot().open();
    trigger.focus();

    press(trigger, 'Tab');
    expect(document.activeElement).toBe(input);
    expect(document.activeElement).not.toBe(trigger);
    expect(store.getSnapshot().isOpen).toBe(true);
  });

  it('does nothing on Tab when there are no focusables', async () => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([] as unknown as DOMRectList);
    const { store, trigger } = fixture();
    trigger.focus();
    await store.getSnapshot().open();

    press(trigger, 'Tab');
    expect(store.getSnapshot().isOpen).toBe(true);
  });

  it('closes on Escape from the document listener', async () => {
    const { store } = fixture();
    store.mount();
    await store.getSnapshot().open();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('ignores events already handled elsewhere and non-Tab bubbles', async () => {
    const { store, container, trigger } = fixture();
    await store.getSnapshot().open();
    const prevented = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    prevented.preventDefault();
    store.getSnapshot().handleKeydown(prevented);
    expect(store.getSnapshot().highlightedIndex).toBe(0);

    const nested = document.createElement('button');
    trigger.append(nested);
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    nested.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);

    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    nested.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(container.isConnected).toBe(true);
  });

  it('handles ArrowDown when the filtered list is empty', async () => {
    const { store, trigger } = fixture({ options: [] });
    await store.getSnapshot().open();
    press(trigger, 'ArrowDown');
    expect(store.getSnapshot().highlightedIndex).toBe(-1);
  });

  it('closes on Escape and ignores unmapped keys while open', async () => {
    const { store, trigger } = fixture();
    await store.getSnapshot().open();
    press(trigger, 'a');
    expect(store.getSnapshot().isOpen).toBe(true);

    const escape = press(trigger, 'Escape');
    expect(escape.defaultPrevented).toBe(true);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('handles paging without wrap at the edges', async () => {
    const { store, trigger } = fixture();
    await store.getSnapshot().open();

    press(trigger, 'PageUp');
    expect(store.getSnapshot().highlightedIndex).toBe(0);

    press(trigger, 'End');
    press(trigger, 'PageDown');
    expect(store.getSnapshot().highlightedIndex).toBe(2);
  });

  it('closes a still-open selectOnTab popup before focusing onward', async () => {
    const { store, trigger, outside, input } = fixture({
      selectOnTab: true,
      multiple: true,
      modelValue: [],
      closeOnSelect: false,
    });
    input.disabled = true;
    await store.getSnapshot().open();
    trigger.focus();

    press(trigger, 'Tab');
    expect(store.getSnapshot().isOpen).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('returns no focusables without a document', async () => {
    const store = createCombobox<User, User>({
      props: makeProps(),
      runtime: {
        getDocument: () => null,
      },
    });
    await store.getSnapshot().open();
    store.getSnapshot().handleKeydown(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('filters focusables by tabIndex and layout', async () => {
    const { store, trigger, input } = fixture();
    const negative = document.createElement('button');
    negative.tabIndex = -1;
    const unlaid = document.createElement('button');
    Object.defineProperty(unlaid, 'getClientRects', {
      configurable: true,
      value: () => [],
    });
    document.body.append(negative, unlaid);
    input.disabled = true;
    await store.getSnapshot().open();
    trigger.focus();

    press(trigger, 'Tab');
    expect(document.activeElement).not.toBe(negative);
    expect(document.activeElement).not.toBe(unlaid);
  });

  it('handles disabled options at the boundaries', async () => {
    const { store, trigger } = fixture({
      options: [ users[ 0 ]!, users[ 1 ]!, users[ 2 ]! ],
      multiple: true,
      modelValue: [ users[ 1 ]! ],
      maxLength: 1,
    });
    await store.getSnapshot().open();
    press(trigger, 'End');
    expect(store.getSnapshot().highlightedIndex).toBe(1);
    press(trigger, 'Home');
    expect(store.getSnapshot().highlightedIndex).toBe(1);
  });
});
