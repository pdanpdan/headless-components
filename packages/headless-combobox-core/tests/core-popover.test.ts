import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCombobox } from '../src';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

function makeStore(overrides: Record<string, unknown> = {}) {
  const onChange = vi.fn();
  const store = createCombobox<User, User>({
    props: {
      modelValue: null,
      options: users,
      optionLabel: (user: User) => user.name,
      ...overrides,
    } as never,
    onChange,
  });
  return { store, onChange };
}

function fixture(overrides: Record<string, unknown> = {}) {
  const { store, onChange } = makeStore(overrides);
  const container = document.createElement('div');
  const trigger = document.createElement('button');
  const input = document.createElement('input');
  const dropdown = document.createElement('div');
  container.append(trigger, input, dropdown);
  document.body.append(container);

  const snapshot = store.getSnapshot();
  snapshot.setContainerRef(container);
  snapshot.setTriggerRef(trigger);
  snapshot.setInputRef(input);
  snapshot.setDropdownRef(dropdown);

  return {
    store,
    onChange,
    container,
    trigger,
    input,
    dropdown,
  };
}

describe('core popover', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('toggles, focuses the input, and closes without returning focus', async () => {
    const { store, trigger, input } = fixture();

    store.getSnapshot().toggle();
    await Promise.resolve();
    expect(store.getSnapshot().isOpen).toBe(true);

    store.getSnapshot().focusInput();
    expect(document.activeElement).toBe(input);

    store.getSnapshot().close(false);
    expect(store.getSnapshot().isOpen).toBe(false);
    expect(document.activeElement).toBe(input);

    trigger.focus();
    store.getSnapshot().toggle();
    await Promise.resolve();
    store.getSnapshot().close();
    expect(document.activeElement).toBe(trigger);
  });

  it('leaves focus on an external control when closed or selected programmatically', async () => {
    const { store, onChange } = fixture();
    const external = document.createElement('button');
    document.body.append(external);

    await store.getSnapshot().open();
    external.focus();
    store.getSnapshot().close();
    expect(document.activeElement).toBe(external);
    expect(store.getSnapshot().isOpen).toBe(false);

    await store.getSnapshot().open();
    external.focus();
    store.getSnapshot().select(users[ 1 ]!);
    expect(document.activeElement).toBe(external);
    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('does not reopen when close returns focus to a typeahead trigger', async () => {
    vi.useFakeTimers();
    try {
      const { store } = makeStore();
      const container = document.createElement('div');
      const input = document.createElement('input');
      const dropdown = document.createElement('div');
      container.append(input, dropdown);
      document.body.append(container);

      const scope = () => store.getSnapshot();
      scope().setContainerRef(container);
      scope().setTriggerRef(input);
      scope().setInputRef(input);
      scope().setDropdownRef(dropdown);
      store.mount();

      scope().comboboxInputProps.onFocus();
      await Promise.resolve();
      expect(scope().isOpen).toBe(true);

      // Selecting closes the popup and returns focus to the input. The focus
      // handler must not treat that as a user focus and reopen the popup.
      scope().select(users[ 0 ]!);
      await Promise.resolve();
      expect(scope().isOpen).toBe(false);
      scope().comboboxInputProps.onFocus();
      expect(scope().isOpen).toBe(false);

      // Closing again before the timer fires replaces the pending suppression.
      await scope().open();
      scope().close();

      // A later focus is a real user action again.
      vi.advanceTimersByTime(1);
      scope().comboboxInputProps.onFocus();
      await Promise.resolve();
      expect(scope().isOpen).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('discovers trigger, input, listbox, and dropdown from the container', async () => {
    const { store } = makeStore();
    const snapshot = store.getSnapshot();
    const root = document.createElement('div');
    const input = document.createElement('input');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-controls', snapshot.listboxProps.id);
    const list = document.createElement('div');
    list.id = snapshot.listboxProps.id;
    list.setAttribute('role', 'listbox');
    root.append(input);
    document.body.append(root, list);

    snapshot.setContainerRef(root);
    await snapshot.open();
    expect(document.activeElement).toBe(input);

    input.setAttribute('aria-expanded', 'true');
    await Promise.resolve();
    await Promise.resolve();

    snapshot.close();
    expect(document.activeElement).toBe(input);

    root.append(document.createElement('span'));
    await Promise.resolve();
    snapshot.setContainerRef(null);
    await Promise.resolve();
    store.destroy();
  });

  it('discovers a search input in a popup outside the container', async () => {
    const { store } = makeStore();
    const snapshot = store.getSnapshot();
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-controls', snapshot.listboxProps.id);
    const popup = document.createElement('div');
    const search = document.createElement('input');
    search.setAttribute('role', 'searchbox');
    const list = document.createElement('div');
    list.id = snapshot.listboxProps.id;
    list.setAttribute('role', 'listbox');
    popup.append(search, list);
    root.append(trigger);
    document.body.append(root, popup);

    snapshot.setContainerRef(root);
    await snapshot.open();

    expect(document.activeElement).toBe(search);
  });

  it('finds rendered options without setOptionRef', async () => {
    const { store } = makeStore({ modelValue: users[ 0 ], alignSelected: true });
    const snapshot = store.getSnapshot();
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-controls', snapshot.listboxProps.id);
    const list = document.createElement('div');
    list.id = snapshot.listboxProps.id;
    list.setAttribute('role', 'listbox');
    const option = document.createElement('button');
    option.setAttribute('role', 'option');
    option.setAttribute('aria-posinset', '1');
    root.append(trigger, list);
    list.append(option);
    document.body.append(root);

    snapshot.setContainerRef(root);
    await snapshot.open();
    expect(store.getSnapshot().alignmentOffset).toBe(0);
    expect(store.getSnapshot().isOpen).toBe(true);
  });

  it('keeps alignment at zero when the selected option is filtered out', async () => {
    const { store } = makeStore({
      modelValue: users[ 0 ],
      alignSelected: true,
      optionFilter: (option: User) => option.id !== users[ 0 ]!.id,
    });
    const snapshot = store.getSnapshot();
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-controls', snapshot.listboxProps.id);
    const list = document.createElement('div');
    list.id = snapshot.listboxProps.id;
    list.setAttribute('role', 'listbox');
    root.append(trigger, list);
    document.body.append(root);

    snapshot.setContainerRef(root);
    await snapshot.open();
    expect(store.getSnapshot().alignmentOffset).toBe(0);
  });

  it('wires the container without MutationObserver', () => {
    vi.stubGlobal('MutationObserver', undefined);
    try {
      const { store } = makeStore();
      const root = document.createElement('div');
      root.append(document.createElement('button'));
      store.getSnapshot().setContainerRef(root);
      expect(root).toBeTruthy();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('toggles an open popup closed', async () => {
    const { store } = fixture();
    store.getSnapshot().toggle();
    await Promise.resolve();
    store.getSnapshot().toggle();
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('refocuses with no document', async () => {
    const store = createCombobox<User, User>({
      props: {
        modelValue: [],
        options: users,
        optionLabel: (user: User) => user.name,
        multiple: true,
      },
      onChange: () => {},
      runtime: {
        getDocument: () => null,
      },
    });
    const input = document.createElement('input');
    document.body.append(input);
    store.getSnapshot().setInputRef(input);
    await store.getSnapshot().open();
    store.getSnapshot().select(users[ 0 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(input);

    store.getSnapshot().close();
    expect(store.getSnapshot().isOpen).toBe(false);
  });

  it('ignores open while open or locked', async () => {
    const { store } = fixture();
    await store.getSnapshot().open();
    await store.getSnapshot().open();
    expect(store.getSnapshot().isOpen).toBe(true);

    const locked = makeStore({ disabled: true }).store;
    await locked.getSnapshot().open();
    expect(locked.getSnapshot().isOpen).toBe(false);
    locked.getSnapshot().toggle();
    expect(locked.getSnapshot().isOpen).toBe(false);
  });

  it('honors inputOnOpen modes', async () => {
    const selectStore = fixture();
    const selectSpy = vi.spyOn(selectStore.input, 'select');
    await selectStore.store.getSnapshot().open();
    expect(selectSpy).toHaveBeenCalled();

    const keepStore = fixture({ inputOnOpen: 'keep' });
    const keepSpy = vi.spyOn(keepStore.input, 'select');
    await keepStore.store.getSnapshot().open();
    expect(keepSpy).not.toHaveBeenCalled();

    const clearStore = fixture({ inputOnOpen: 'clear' });
    await clearStore.store.getSnapshot().open();
    expect(clearStore.store.getSnapshot().searchQuery).toBe('');
  });

  it('drives the native popover API when present', async () => {
    const { store, dropdown } = fixture();
    dropdown.setAttribute('popover', 'manual');
    let shown = false;
    Object.defineProperty(dropdown, 'showPopover', {
      value: () => {
        shown = true;
      },
    });
    Object.defineProperty(dropdown, 'hidePopover', {
      value: () => {
        shown = false;
      },
    });
    Object.defineProperty(dropdown, 'matches', {
      value: (selector: string) => selector === ':popover-open' && shown,
    });

    await store.getSnapshot().open();
    expect(shown).toBe(true);
    store.getSnapshot().close();
    expect(shown).toBe(false);
  });

  it('refocuses the filter only when safe', async () => {
    const { store, container, input } = fixture({ multiple: true, modelValue: [] });
    const textarea = document.createElement('textarea');
    const editable = document.createElement('div');
    const outside = document.createElement('button');
    const buttonInput = document.createElement('input');
    buttonInput.type = 'button';
    container.append(textarea, editable, buttonInput);
    document.body.append(outside);

    await store.getSnapshot().open();
    input.focus();
    store.getSnapshot().select(users[ 0 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(input);

    textarea.focus();
    store.getSnapshot().select(users[ 1 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(textarea);

    Object.defineProperty(editable, 'isContentEditable', { value: true });
    editable.tabIndex = 0;
    editable.focus();
    store.getSnapshot().select(users[ 0 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(editable);

    buttonInput.focus();
    store.getSnapshot().select(users[ 1 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(input);

    outside.focus();
    store.getSnapshot().select(users[ 0 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(outside);

    store.getSnapshot().setInputRef(null);
    outside.focus();
    store.getSnapshot().select(users[ 1 ]!);
    await Promise.resolve();
    expect(document.activeElement).toBe(outside);
  });

  it('closes on outside mousedown, but not inside or when filtered', async () => {
    const { store, container } = fixture();
    store.mount();
    await store.getSnapshot().open();

    container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(true);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(false);
    store.destroy();

    const noClose = makeStore({ closeOnClickOutside: false }).store;
    noClose.mount();
    await noClose.getSnapshot().open();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(noClose.getSnapshot().isOpen).toBe(true);
    noClose.destroy();

    const filtered = makeStore({
      clickOutsideFilter: () => false,
    }).store;
    filtered.mount();
    await filtered.getSnapshot().open();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(filtered.getSnapshot().isOpen).toBe(true);
    filtered.destroy();
  });

  it('closes on Escape from the document', async () => {
    const { store } = fixture();
    store.mount();
    await store.getSnapshot().open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(store.getSnapshot().isOpen).toBe(false);
  });
});
