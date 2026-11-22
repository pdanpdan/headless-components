import type { ComboboxRuntimeOverrides, HeadlessComboboxProps } from '../src';

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
  runtime?: ComboboxRuntimeOverrides,
) {
  return createCombobox<User, User>({
    props: {
      modelValue: null,
      options: users,
      optionLabel: (user) => user.name,
      ...overrides,
    },
    onChange,
    ...(runtime
      ? { runtime }
      : {}),
  });
}

describe('core details', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets individual state fields and ignores unchanged values', () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ isOpen: true, highlightedIndex: 2, alignmentOffset: 4 });
    expect(store.getSnapshot().isOpen).toBe(true);
    expect(store.getSnapshot().highlightedIndex).toBe(2);
    expect(store.getSnapshot().alignmentOffset).toBe(4);
    expect(listener).toHaveBeenCalledTimes(1);

    store.setState({ isOpen: true });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('replaces props and clears the pending model when props round-trip', () => {
    const store = makeStore();
    store.getSnapshot().select(users[ 0 ]!);
    expect(store.getSnapshot().selectedCount).toBe(1);

    store.setProps({
      modelValue: null,
      options: users,
      optionLabel: (user) => user.name,
    });
    expect(store.getSnapshot().selectedCount).toBe(0);
  });

  it('wires and unwires element refs', () => {
    const store = makeStore();
    const container = document.createElement('div');
    const dropdown = document.createElement('div');
    const option = document.createElement('div');

    store.getSnapshot().setContainerRef(container);
    store.getSnapshot().setDropdownRef(dropdown);
    store.getSnapshot().setOptionRef(users[ 0 ]!, option);

    store.getSnapshot().setContainerRef(null);
    store.getSnapshot().setDropdownRef(null);
    store.getSnapshot().setOptionRef(users[ 0 ]!, null);

    expect(container.isConnected).toBe(false);
  });

  it('unsubscribes listeners', () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.getSnapshot().setSearchQuery('wa');
    unsubscribe();
    store.getSnapshot().setSearchQuery('dev');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('mounts once and survives double destroy', () => {
    const store = makeStore();
    store.mount();
    store.mount();
    store.destroy();
    store.destroy();
  });

  it('mounts without a document', () => {
    vi.stubGlobal('document', undefined);
    const store = makeStore();
    store.mount();
    store.destroy();
    vi.unstubAllGlobals();
  });

  it('builds disabled and readonly ARIA bags', () => {
    const disabled = makeStore({ disabled: true }).getSnapshot();
    expect(disabled.triggerProps.disabled).toBe(true);
    expect(disabled.triggerProps[ 'aria-disabled' ]).toBe(true);
    expect(disabled.comboboxInputProps.disabled).toBe(true);
    expect(disabled.comboboxInputProps.readonly).toBeUndefined();

    const readonly = makeStore({ readonly: true }).getSnapshot();
    expect(readonly.triggerProps[ 'aria-readonly' ]).toBe(true);
    expect(readonly.comboboxInputProps.readonly).toBe(true);
    expect(readonly.comboboxInputProps.disabled).toBeUndefined();
  });

  it('exposes option semantics and handlers', () => {
    const store = makeStore();
    const snapshot = store.getSnapshot();
    const option = users[ 0 ]!;
    const props = snapshot.getOptionProps(option, 0);

    expect(props[ 'aria-selected' ]).toBe(false);
    expect(props[ 'aria-disabled' ]).toBeUndefined();

    const mousedown = new MouseEvent('mousedown', { cancelable: true });
    props.onMousedown(mousedown);
    expect(mousedown.defaultPrevented).toBe(true);

    props.onMousemove();
    expect(store.getSnapshot().highlightedIndex).toBe(0);
    expect(store.getSnapshot().getOptionProps(option, 0)[ 'data-highlighted' ]).toBe(true);

    store.setState({ highlightedIndex: -1 });
    props.onFocus();
    expect(store.getSnapshot().highlightedIndex).toBe(0);

    props.onClick();
    expect(store.getSnapshot().isSelected(option)).toBe(true);
  });

  it('skips highlighting disabled options', () => {
    const store = makeStore({ multiple: true, modelValue: [], maxLength: 0 });
    const props = store.getSnapshot().getOptionProps(users[ 0 ]!, 0);

    expect(props[ 'aria-disabled' ]).toBe(true);
    props.onMousemove();
    props.onFocus();
    expect(store.getSnapshot().highlightedIndex).toBe(-1);
  });

  it('falls back to String() when no optionLabel is given', () => {
    const store = createCombobox<string, string>({
      props: {
        modelValue: null,
        options: [ 'One', 'Two' ],
      },
      onChange: () => {},
    });
    store.getSnapshot().setSearchQuery('tw');
    expect(store.getSnapshot().filteredOptions).toEqual([ 'Two' ]);
  });

  it('handles input events and typeahead opening', () => {
    const store = makeStore();
    const snapshot = store.getSnapshot();

    snapshot.inputProps.onInput({
      target: { value: 'wa' },
    } as unknown as Event);
    expect(store.getSnapshot().searchQuery).toBe('wa');

    snapshot.comboboxInputProps.onInput({
      target: { value: 'dev' },
    } as unknown as Event);
    expect(store.getSnapshot().isOpen).toBe(true);
    expect(store.getSnapshot().searchQuery).toBe('dev');
  });

  it('reports maxLength violations and custom messages', () => {
    const store = makeStore({
      multiple: true,
      modelValue: [ users[ 0 ]!, users[ 1 ]! ],
      maxLength: 1,
    });

    expect(store.getSnapshot().errors).toEqual([ 'maxlength' ]);
    expect(store.getSnapshot().validationMessage).toBe('Select at most 1 option.');

    const custom = makeStore({
      required: true,
      errorMessages: { required: 'Pick one.' },
    });
    expect(custom.getSnapshot().validationMessage).toBe('Pick one.');

    const many = makeStore({
      multiple: true,
      modelValue: [],
      minLength: 2,
    });
    expect(many.getSnapshot().validationMessage).toBe('Select at least 2 options.');
  });

  it('clears while locked and while open', () => {
    const locked = makeStore({ disabled: true, modelValue: users[ 0 ]! });
    locked.getSnapshot().clear();
    expect(locked.getSnapshot().selectedCount).toBe(1);

    const open = makeStore({ multiple: true, modelValue: [] });
    open.getSnapshot().open();
    open.getSnapshot().clear();
    expect(open.getSnapshot().selectedCount).toBe(0);
  });

  it('keeps the selection when selecting a blocked option at maxLength', () => {
    const onChange = vi.fn();
    const store = makeStore({
      multiple: true,
      modelValue: [ users[ 0 ]! ],
      maxLength: 1,
    }, onChange);

    store.getSnapshot().select(users[ 1 ]!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('scrolls to the highlighted option', async () => {
    const store = makeStore();
    const list = document.createElement('div');
    const option = document.createElement('div');
    Object.defineProperty(list, 'getBoundingClientRect', {
      value: () => ({
        top: 0,
        bottom: 20,
        width: 100,
        height: 20,
      }),
    });
    Object.defineProperty(option, 'getBoundingClientRect', {
      value: () => ({
        top: 30,
        bottom: 50,
        width: 100,
        height: 20,
      }),
    });
    store.getSnapshot().setListRef(list);
    store.getSnapshot().setOptionRef(users[ 0 ]!, option);
    store.setState({ highlightedIndex: 0 });

    await store.getSnapshot().open();
    expect(list.scrollTop).toBeGreaterThanOrEqual(0);
  });
});
