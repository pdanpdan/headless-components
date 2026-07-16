import type { HeadlessComboboxProps, HeadlessComboboxSlotProps } from '../src';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';

import { HeadlessCombobox } from '../src';

interface User {
  id: number;
  name: string;
}

type SlotProps = HeadlessComboboxSlotProps<User>;

type MountConfig = Partial<Pick<HeadlessComboboxProps<User>, 'modelValue' | 'multiple' | 'minLength' | 'maxLength' | 'required' | 'disabled' | 'readonly'>>;

function createUsers(): User[] {
  return [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
    { id: 3, name: 'Devon Webb' },
  ];
}

function mountComboBox(options: User[], config: MountConfig = {}) {
  let latest: SlotProps;

  const props = {
    modelValue: config.modelValue ?? (config.multiple ? [] : null),
    options,
    multiple: config.multiple ?? false,
    required: config.required ?? false,
    disabled: config.disabled ?? false,
    readonly: config.readonly ?? false,
    displayValue: (option: unknown) => (option as User).name,
    ...(config.minLength !== undefined ? { minLength: config.minLength } : {}),
    ...(config.maxLength !== undefined ? { maxLength: config.maxLength } : {}),
  };

  const wrapper = mount(HeadlessCombobox, {
    props,
    slots: {
      default: (scope: unknown) => {
        latest = scope as SlotProps;
        return h('div');
      },
    },
  });

  return {
    wrapper,
    // Getter (not destructured) so every read returns the latest slot scope.
    get scope(): SlotProps {
      return latest;
    },
  };
}

describe('headless combobox (single)', () => {
  it('starts closed and exposes all options', () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    expect(cb.scope.isOpen).toBe(false);
    expect(cb.scope.filteredOptions).toEqual(users);
  });

  it('opens via the exposed action', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();

    expect(cb.scope.isOpen).toBe(true);
  });

  it('toggles open and closed', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.toggle();
    await nextTick();
    expect(cb.scope.isOpen).toBe(true);

    cb.scope.close(false);
    await nextTick();
    expect(cb.scope.isOpen).toBe(false);
  });

  it('filters options by search query', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.setSearchQuery('wade');
    await nextTick();

    expect(cb.scope.filteredOptions).toEqual([ users[ 0 ] ]);
  });

  it('emits update:modelValue when selecting', async () => {
    const users = createUsers();
    const target = users[ 1 ];
    const cb = mountComboBox(users);

    cb.scope.select(target as User);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ target ] ]);
  });

  it('closes the dropdown after selecting', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    cb.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(cb.scope.isOpen).toBe(false);
  });

  it('clears the selection to null', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { modelValue: users[ 0 ] as User });

    cb.scope.clear();
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ null ] ]);
  });

  it('setHighlightedIndex moves the highlight', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    cb.scope.setHighlightedIndex(2);
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(2);
  });
});

describe('headless combobox (multiple)', () => {
  it('adds an option to the selection', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: [] });

    cb.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 0 ] ] ] ]);
  });

  it('keeps the dropdown open after selecting', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: [] });

    cb.scope.open();
    await nextTick();
    cb.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(cb.scope.isOpen).toBe(true);
  });

  it('removes an already-selected option', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: [ users[ 0 ] as User ] });

    cb.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [] ] ]);
  });

  it('blocks adding beyond maxLength', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 0 ] as User ] });

    expect(cb.scope.canSelectMore).toBe(false);

    cb.scope.select(users[ 1 ] as User);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('reports selection membership and count', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: [ users[ 0 ] as User ] });

    expect(cb.scope.selectedCount).toBe(1);
    expect(cb.scope.isSelected(users[ 0 ] as User)).toBe(true);
    expect(cb.scope.isSelected(users[ 1 ] as User)).toBe(false);
  });

  it('clears the selection to an empty array', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: [ users[ 0 ] as User ] });

    cb.scope.clear();
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [] ] ]);
  });
});

describe('headless combobox (validation)', () => {
  it('flags a required empty selection', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { required: true, modelValue: null });

    expect(cb.scope.valid).toBe(false);
    expect(cb.scope.errors).toEqual([ 'required' ]);
    expect(cb.scope.validationMessage).toBe('Selection is required.');
  });

  it('is valid once a required selection exists', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { required: true, modelValue: users[ 0 ] as User });

    expect(cb.scope.valid).toBe(true);
    expect(cb.scope.errors).toEqual([]);
  });

  it('flags fewer than minLength selected', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, minLength: 2, modelValue: [ users[ 0 ] as User ] });

    expect(cb.scope.valid).toBe(false);
    expect(cb.scope.errors).toEqual([ 'minlength' ]);
  });

  it('flags more than maxLength selected', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 0 ] as User, users[ 1 ] as User ] });

    expect(cb.scope.valid).toBe(false);
    expect(cb.scope.errors).toEqual([ 'maxlength' ]);
  });
});

describe('headless combobox (disabled / readonly)', () => {
  it('does not open or select when disabled', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { disabled: true });

    cb.scope.open();
    await nextTick();
    expect(cb.scope.isOpen).toBe(false);

    cb.scope.select(users[ 0 ] as User);
    await nextTick();
    expect(cb.wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('exposes disabled in the trigger props', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { disabled: true });

    expect(cb.scope.triggerProps.disabled).toBe(true);
    expect(cb.scope.triggerProps[ 'aria-disabled' ]).toBe(true);
  });

  it('does not open or select when readonly', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { readonly: true });

    cb.scope.open();
    await nextTick();
    expect(cb.scope.isOpen).toBe(false);

    cb.scope.select(users[ 0 ] as User);
    await nextTick();
    expect(cb.wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});

describe('headless combobox (popupStyle)', () => {
  it('exposes a default popup style', () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    expect(cb.scope.popupStyle).toMatchObject({
      position: 'absolute',
      top: 'anchor(bottom)',
      left: 'anchor(left)',
      width: 'anchor-size(width)',
    });
    expect(cb.scope.popupStyle.positionAnchor).toMatch(/^--anchor-/);
  });
});

describe('headless combobox (keyboard wrap-around)', () => {
  it('wraps from the last option to the first on ArrowDown', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    cb.scope.setHighlightedIndex(users.length - 1);
    await nextTick();

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(0);
  });

  it('wraps from the first option to the last on ArrowUp', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    cb.scope.setHighlightedIndex(0);
    await nextTick();

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(users.length - 1);
  });
});

describe('headless combobox (focus guard)', () => {
  it('does not steal focus from another text field when selecting', async () => {
    const users = createUsers();
    const holder: { scope?: SlotProps; } = {};

    const wrapper = mount(HeadlessCombobox, {
      attachTo: document.body,
      props: {
        modelValue: [],
        options: users,
        multiple: true,
        displayValue: (option: unknown) => (option as User).name,
      },
      slots: {
        default: (s: unknown) => {
          holder.scope = s as SlotProps;
          return h('div', { ref: holder.scope.setContainerRef }, [
            h('input', { ref: holder.scope.setInputRef, class: 'filter' }),
            h('input', { class: 'adder' }),
          ]);
        },
      },
    });

    const scope = holder.scope as SlotProps;
    scope.open();
    await nextTick();
    await nextTick();

    const adder = wrapper.find('.adder').element as HTMLInputElement;
    adder.focus();
    expect(document.activeElement).toBe(adder);

    scope.select(users[ 0 ] as User);
    await nextTick();

    // The "add option" input keeps focus; the filter is not refocused.
    expect(document.activeElement).toBe(adder);

    wrapper.unmount();
  });

  it('refocuses the filter after clicking a maxLength-blocked option', async () => {
    const users = createUsers();
    const holder: { scope?: SlotProps; } = {};

    const wrapper = mount(HeadlessCombobox, {
      attachTo: document.body,
      props: {
        modelValue: [ users[ 0 ] as User ],
        options: users,
        multiple: true,
        maxLength: 1,
        displayValue: (option: unknown) => (option as User).name,
      },
      slots: {
        default: (s: unknown) => {
          holder.scope = s as SlotProps;
          return h('div', { ref: holder.scope.setContainerRef }, [
            h('input', { ref: holder.scope.setInputRef, class: 'filter' }),
            h('button', { class: 'blocked', type: 'button' }, 'blocked'),
          ]);
        },
      },
    });

    const scope = holder.scope as SlotProps;
    scope.open();
    await nextTick();
    await nextTick();

    const blocked = wrapper.find('.blocked').element as HTMLButtonElement;
    blocked.focus();
    expect(document.activeElement).toBe(blocked);

    // At max: selecting a new option is blocked (no change) but focus should return to the filter.
    scope.select(users[ 1 ] as User);
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(document.activeElement).toBe(wrapper.find('.filter').element);

    wrapper.unmount();
  });
});

describe('headlessCombobox (comboboxInputProps)', () => {
  it('exposes editable-combobox input attributes', () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    expect(cb.scope.comboboxInputProps.role).toBe('combobox');
    expect(cb.scope.comboboxInputProps[ 'aria-autocomplete' ]).toBe('list');
    expect(cb.scope.comboboxInputProps[ 'aria-haspopup' ]).toBe('listbox');
    expect(cb.scope.comboboxInputProps[ 'aria-controls' ]).toBeDefined();
  });
});

describe('headless combobox (null handling in multiple)', () => {
  it('treats null modelValue as an empty selection', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: null });

    expect(cb.scope.selectedCount).toBe(0);
    expect(cb.scope.isSelected(users[ 0 ] as User)).toBe(false);
    expect(cb.scope.isSelected(users[ 1 ] as User)).toBe(false);
  });

  it('allows selecting when starting from null', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: null });

    cb.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 0 ] ] ] ]);
  });

  it('clear from null emits an empty array', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, modelValue: null });

    cb.scope.clear();
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [] ] ]);
  });

  it('required validation fires when modelValue is null', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, required: true, modelValue: null });

    expect(cb.scope.valid).toBe(false);
    expect(cb.scope.errors).toEqual([ 'required' ]);
  });

  it('canSelectMore is true when modelValue is null', () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 2, modelValue: null });

    expect(cb.scope.canSelectMore).toBe(true);
  });
});
