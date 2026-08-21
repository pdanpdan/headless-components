import type { HeadlessComboboxProps, HeadlessComboboxScope, HeadlessComboboxSlotProps } from '../src';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h, nextTick, reactive, ref } from 'vue';

import { HeadlessCombobox, useHeadlessCombobox } from '../src';

interface User {
  id: number;
  name: string;
}

type SlotProps = HeadlessComboboxSlotProps<User, User>;

type MountConfig = Partial<Pick<HeadlessComboboxProps<User, User>, 'modelValue' | 'multiple' | 'minLength' | 'maxLength' | 'required' | 'disabled' | 'readonly' | 'errorMessages' | 'optionFilter' | 'alignSelected' | 'closeOnSelect' | 'closeOnClickOutside' | 'clickOutsideFilter' | 'selectOnTab' | 'inputOnOpen'>>;

function createUsers(): User[] {
  return [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
    { id: 3, name: 'Devon Webb' },
  ];
}

function buildProps(options: User[], config: MountConfig = {}) {
  return {
    // `??` would swallow an explicit null into the default; null is a valid
    // contract value (treated as an empty selection in multiple mode).
    modelValue: config.modelValue !== undefined ? config.modelValue : (config.multiple ? [] : null),
    options,
    multiple: config.multiple ?? false,
    required: config.required ?? false,
    disabled: config.disabled ?? false,
    readonly: config.readonly ?? false,
    optionLabel: (option: unknown) => (option as User).name,
    ...(config.minLength !== undefined ? { minLength: config.minLength } : {}),
    ...(config.maxLength !== undefined ? { maxLength: config.maxLength } : {}),
    ...(config.errorMessages !== undefined ? { errorMessages: config.errorMessages } : {}),
    ...(config.optionFilter !== undefined ? { optionFilter: config.optionFilter as (option: unknown, query: unknown) => boolean } : {}),
    ...(config.alignSelected !== undefined ? { alignSelected: config.alignSelected } : {}),
    ...(config.closeOnSelect !== undefined ? { closeOnSelect: config.closeOnSelect } : {}),
    ...(config.closeOnClickOutside !== undefined ? { closeOnClickOutside: config.closeOnClickOutside } : {}),
    ...(config.clickOutsideFilter !== undefined ? { clickOutsideFilter: config.clickOutsideFilter } : {}),
    ...(config.selectOnTab !== undefined ? { selectOnTab: config.selectOnTab } : {}),
    ...(config.inputOnOpen !== undefined ? { inputOnOpen: config.inputOnOpen } : {}),
  };
}

function mountComboBox(options: User[], config: MountConfig = {}) {
  let latest: SlotProps;

  const wrapper = mount(HeadlessCombobox, {
    props: buildProps(options, config),
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

interface WiredElements {
  container: HTMLElement;
  trigger: HTMLButtonElement;
  input: HTMLInputElement;
  searchbox: HTMLInputElement;
  dropdown: HTMLElement;
  list: HTMLElement;
  options: HTMLElement[];
  outside: HTMLButtonElement;
}

// Renders a realistic consumer layout — trigger button, filter input, standalone
// searchbox input, dropdown listbox with options — with every ref wired through
// the slot scope. `wireList: false` renders the options directly in the dropdown
// without a scroll container.
function mountWired(optionsArg: User[], config: MountConfig & { wireList?: boolean; wireInput?: boolean; } = {}) {
  let scope: SlotProps;
  const els = { options: [] as HTMLElement[] } as unknown as WiredElements;
  // The test runner wraps props reactively; iterating the same proxies keeps
  // option identity consistent between the slot and the component internals.
  const options = reactive(optionsArg);
  const wiredInput = config.wireInput !== false;

  const wrapper = mount(HeadlessCombobox, {
    attachTo: document.body,
    props: buildProps(options, config),
    slots: {
      default: (s: unknown) => {
        const sc = s as SlotProps;
        scope = sc;
        const listContent = options.map((o, i) =>
          h('div', {
            ref: (el: unknown) => {
              sc.setOptionRef(o, el);
              els.options[ i ] = el as HTMLElement;
            },
            class: 'opt',
            ...sc.getOptionProps(o, i),
          }),
        );
        return h('div', {
          ref: (el: unknown) => {
            sc.setContainerRef(el);
            els.container = el as HTMLElement;
          },
        }, [
          h('button', {
            ref: (el: unknown) => {
              sc.setTriggerRef(el);
              els.trigger = el as HTMLButtonElement;
            },
            type: 'button',
            ...sc.triggerProps,
          }, 'Trigger'),
          wiredInput
            ? h('input', {
              ref: (el: unknown) => {
                sc.setInputRef(el);
                els.input = el as HTMLInputElement;
              },
              class: 'filter',
              // The typeahead pattern wires keyboard handling manually.
              onKeydown: (e: KeyboardEvent) => sc.handleKeydown(e),
              ...sc.comboboxInputProps,
            })
            : null,
          wiredInput
            ? h('input', {
              ref: (el: unknown) => {
                els.searchbox = el as HTMLInputElement;
              },
              class: 'searchbox',
              ...sc.inputProps,
            })
            : null,
          h('div', {
            ref: (el: unknown) => {
              sc.setDropdownRef(el);
              els.dropdown = el as HTMLElement;
            },
            class: 'dropdown',
          }, [
            config.wireList === false
              ? listContent
              : h('div', {
                ref: (el: unknown) => {
                  sc.setListRef(el);
                  els.list = el as HTMLElement;
                },
                class: 'list',
              }, listContent),
          ]),
        ]);
      },
    },
  });

  // The outside control must live outside the container ref so the widget
  // boundary does not include it.
  const outside = document.createElement('button');
  outside.type = 'button';
  outside.className = 'outside';
  outside.textContent = 'Outside';
  document.body.appendChild(outside);
  els.outside = outside;

  return {
    wrapper,
    els,
    // Getter (not destructured) so every read returns the latest slot scope.
    get scope(): SlotProps {
      return scope;
    },
  };
}

// Typeahead pattern: a single text input acts as both the trigger and the
// filter input (`setTriggerRef` + `setInputRef` on the same element).
function mountTypeahead(optionsArg: User[], config: MountConfig = {}) {
  let scope: SlotProps;
  const options = reactive(optionsArg);
  const els = { options: [] as HTMLElement[] } as unknown as WiredElements;

  const wrapper = mount(HeadlessCombobox, {
    attachTo: document.body,
    props: buildProps(options, config),
    slots: {
      default: (s: unknown) => {
        const sc = s as SlotProps;
        scope = sc;
        return h('div', {
          ref: (el: unknown) => {
            sc.setContainerRef(el);
            els.container = el as HTMLElement;
          },
        }, [
          h('input', {
            ref: (el: unknown) => {
              sc.setTriggerRef(el);
              sc.setInputRef(el);
              els.input = el as HTMLInputElement;
            },
            type: 'text',
            // The typeahead pattern wires keyboard handling manually.
            onKeydown: (e: KeyboardEvent) => sc.handleKeydown(e),
            ...sc.comboboxInputProps,
          }),
          h('div', {
            ref: (el: unknown) => {
              sc.setDropdownRef(el);
              els.dropdown = el as HTMLElement;
            },
            class: 'dropdown',
          }, options.map((o, i) => h('div', {
            ref: (el: unknown) => {
              sc.setOptionRef(o, el);
              els.options[ i ] = el as HTMLElement;
            },
            class: 'opt',
            ...sc.getOptionProps(o, i),
          }))),
        ]);
      },
    },
  });

  return {
    wrapper,
    els,
    get scope(): SlotProps {
      return scope;
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

  it('closing while already closed is a no-op', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.close();
    await nextTick();

    expect(cb.scope.isOpen).toBe(false);
    expect(cb.scope.highlightedIndex).toBe(-1);
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
    expect(cb.scope.selectedList).toEqual([ users[ 0 ] ]);
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

  it('closes after selecting when closeOnSelect is true', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, closeOnSelect: true, modelValue: [] });

    cb.scope.open();
    await nextTick();
    cb.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(cb.scope.isOpen).toBe(false);
  });

  it('handles Vue reactive options and selections', async () => {
    const users = reactive(createUsers());
    const selected = reactive(users[ 0 ] as User);
    const cb = mountComboBox(users, { multiple: true, modelValue: [ selected ] });

    expect(cb.scope.selectedCount).toBe(1);
    expect(cb.scope.isSelected(users[ 0 ] as User)).toBe(true);

    // Toggling the selected reactive option removes it.
    cb.scope.select(users[ 0 ] as User);
    await nextTick();
    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [] ] ]);

    // No v-model feedback in the harness, but the internal model state
    // carries the toggle, so the next select appends to the empty list.
    cb.scope.select(users[ 1 ] as User);
    await nextTick();
    expect(cb.wrapper.emitted('update:modelValue')?.[ 1 ]).toEqual([ [ users[ 1 ] ] ]);
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

  it('uses singular wording for a min or max of one', () => {
    const users = createUsers();
    const min = mountComboBox(users, { multiple: true, minLength: 1, modelValue: [] });
    expect(min.scope.validationMessage).toBe('Select at least 1 option.');

    const max = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 0 ] as User, users[ 1 ] as User ] });
    expect(max.scope.validationMessage).toBe('Select at most 1 option.');
  });

  it('uses plural wording for a min or max above one', () => {
    const users = createUsers();
    const min = mountComboBox(users, { multiple: true, minLength: 2, modelValue: [ users[ 0 ] as User ] });
    expect(min.scope.validationMessage).toBe('Select at least 2 options.');

    const max = mountComboBox(users, { multiple: true, maxLength: 2, modelValue: [ users[ 0 ] as User, users[ 1 ] as User, users[ 2 ] as User ] });
    expect(max.scope.validationMessage).toBe('Select at most 2 options.');
  });

  it('uses custom validation messages', () => {
    const users = createUsers();
    const cb = mountComboBox(users, {
      required: true,
      modelValue: null,
      errorMessages: { required: 'Pick someone.' },
    });

    expect(cb.scope.validationMessage).toBe('Pick someone.');
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

  it('ignores toggle, clear, and keyboard input when disabled', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { disabled: true, modelValue: users[ 0 ] as User });

    cb.scope.toggle();
    await nextTick();
    expect(cb.scope.isOpen).toBe(false);

    cb.scope.clear();
    await nextTick();
    expect(cb.wrapper.emitted('update:modelValue')).toBeUndefined();

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextTick();
    expect(cb.scope.isOpen).toBe(false);
  });
});

describe('headless combobox (popupStyle)', () => {
  it('exposes a default popup style', () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    expect(cb.scope.popupStyle).toMatchObject({
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

describe('headless combobox (keyboard + disabled options)', () => {
  it('stays on the selected option when all others are blocked by maxLength', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 0 ] as User ] });

    cb.scope.open();
    await nextTick();
    // Only the selected option is actionable; the others are blocked by maxLength.
    expect(cb.scope.highlightedIndex).toBe(0);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);
  });

  it('jumps over blocked options to the next actionable one', async () => {
    const users = createUsers();
    // users[0] and users[2] are selected; users[1] is blocked by maxLength.
    const cb = mountComboBox(users, { multiple: true, maxLength: 2, modelValue: [ users[ 0 ] as User, users[ 2 ] as User ] });

    cb.scope.open();
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(2);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);
  });

  it('clears the highlight when no option is actionable', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 0, modelValue: [] });

    cb.scope.open();
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(-1);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(-1);
  });

  it('keeps the highlight cleared with no options and ignores Enter', async () => {
    const cb = mountComboBox([]);

    cb.scope.open();
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(-1);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(-1);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    await nextTick();
    expect(cb.wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('ignores out-of-range highlight indexes', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);

    cb.scope.setHighlightedIndex(99);
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);

    cb.scope.setHighlightedIndex(-1);
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);
  });
});

describe('headless combobox (prop bag handlers)', () => {
  it('selects an option via getOptionProps().onClick', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    const optionProps = cb.scope.getOptionProps(users[ 0 ] as User, 0);
    expect(typeof optionProps.onClick).toBe('function');
    optionProps.onClick();
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')?.[ 0 ]?.[ 0 ]).toBe(users[ 0 ]);
  });

  it('opens the popup via triggerProps().onClick', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.triggerProps.onClick();
    await nextTick();

    expect(cb.scope.isOpen).toBe(true);
  });

  it('reopens and filters via comboboxInputProps().onInput after Escape closed it', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    // ESC closes the popup (query reset).
    cb.scope.open();
    await nextTick();
    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(cb.scope.isOpen).toBe(false);

    // Typing again must reopen the popup and filter.
    const target = { value: 'Wade' } as HTMLInputElement;
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: target });
    cb.scope.comboboxInputProps.onInput(event);
    await nextTick();

    expect(cb.scope.isOpen).toBe(true);
    expect(cb.scope.searchQuery).toBe('Wade');
    expect(cb.scope.filteredOptions).toEqual([ users[ 0 ] ]);
  });

  it('prevents the mousedown default on options', () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    const event = new MouseEvent('mousedown', { cancelable: true });
    cb.scope.getOptionProps(users[ 0 ] as User, 0).onMousedown(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('never highlights maxLength-blocked options via focus or mousemove', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 0 ] as User ] });
    cb.scope.open();
    await nextTick();

    const blocked = cb.scope.getOptionProps(users[ 1 ] as User, 1);
    blocked.onFocus();
    await nextTick();
    expect(cb.scope.highlightedIndex).not.toBe(1);

    blocked.onMousemove();
    await nextTick();
    expect(cb.scope.highlightedIndex).not.toBe(1);
  });
});

describe('headless combobox (escape)', () => {
  it('closes the popup on Escape from any focus position', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    expect(cb.scope.isOpen).toBe(true);

    // Focus could be on the clear button, an option, or any widget control.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();

    expect(cb.scope.isOpen).toBe(false);
  });

  it('ignores Escape while closed', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();

    expect(cb.scope.isOpen).toBe(false);
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
        optionLabel: (option: unknown) => (option as User).name,
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
        optionLabel: (option: unknown) => (option as User).name,
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

describe('headless combobox (trigger interactions)', () => {
  it('toggles the popup when the trigger is clicked', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);
    expect(wired.els.trigger.getAttribute('aria-expanded')).toBe('true');

    await wired.els.trigger.click();
    await nextTick();
    expect(wired.scope.isOpen).toBe(false);
    expect(wired.els.trigger.getAttribute('aria-expanded')).toBe('false');

    wired.wrapper.unmount();
  });

  it('opens with ArrowDown on the trigger and selects with Enter', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    wired.els.trigger.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    await nextTick();
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);
    expect(wired.els.trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);

    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(1);
    expect(wired.els.trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);

    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ users[ 1 ] ] ]);
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });

  it('ignores keys that do not open the popup while closed', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    // A plain letter on the trigger does not open the popup.
    const key = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    wired.els.trigger.dispatchEvent(key);
    await nextTick();

    expect(key.defaultPrevented).toBe(false);
    expect(wired.scope.isOpen).toBe(false);
    expect(wired.scope.searchQuery).toBeUndefined();

    // ArrowDown on the same trigger does open it — proving the handler is wired.
    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    wired.wrapper.unmount();
  });

  it('ignores clicks and keyboard when disabled', async () => {
    const users = createUsers();
    const wired = mountWired(users, { disabled: true });

    wired.els.trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(false);

    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });
});

describe('headless combobox (typeahead input)', () => {
  it('filters as the user types and restores all options when the filter clears', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    wired.els.input.value = 'wade';
    wired.els.input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(wired.scope.isOpen).toBe(true);
    expect(wired.scope.searchQuery).toBe('wade');
    expect(wired.scope.filteredOptions).toEqual([ users[ 0 ] ]);

    wired.els.input.value = '';
    wired.els.input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(wired.scope.filteredOptions).toEqual(users);

    wired.wrapper.unmount();
  });

  it('filters through the standalone searchbox input', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(wired.els.searchbox.getAttribute('role')).toBe('searchbox');

    wired.els.searchbox.value = 'devon';
    wired.els.searchbox.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(wired.scope.filteredOptions).toEqual([ users[ 2 ] ]);

    wired.wrapper.unmount();
  });

  it('filters with a custom optionFilter', async () => {
    const users = createUsers();
    const optionFilter = vi.fn((option: User, query: string) => option.id === Number(query));
    const cb = mountComboBox(users, { optionFilter });

    cb.scope.setSearchQuery('3');
    await nextTick();

    expect(optionFilter).toHaveBeenCalledWith(users[ 2 ], '3');
    expect(cb.scope.filteredOptions).toEqual([ users[ 2 ] ]);
  });

  it('works with plain string options and no optionLabel', async () => {
    const holder: { scope?: HeadlessComboboxSlotProps<string, string>; } = {};
    const wrapper = mount(HeadlessCombobox, {
      props: {
        modelValue: null,
        options: [ 'Alpha', 'beta', 'GAMMA' ],
        multiple: false,
        required: false,
        disabled: false,
        readonly: false,
      },
      slots: {
        default: (s: unknown) => {
          holder.scope = s as HeadlessComboboxSlotProps<string, string>;
          return h('div');
        },
      },
    });

    const scope = holder.scope as HeadlessComboboxSlotProps<string, string>;
    expect(scope.filteredOptions).toEqual([ 'Alpha', 'beta', 'GAMMA' ]);

    scope.setSearchQuery('ga');
    await nextTick();
    expect(holder.scope?.filteredOptions).toEqual([ 'GAMMA' ]);

    wrapper.unmount();
  });
});

describe('headless combobox (click outside)', () => {
  it('closes the popup when clicking outside the widget', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });

  it('keeps the popup open when clicking inside the widget', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    wired.els.input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    wired.wrapper.unmount();
  });

  it('keeps the popup open on outside clicks when closeOnClickOutside is false', async () => {
    const users = createUsers();
    const wired = mountWired(users, { closeOnClickOutside: false });

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    // Escape and explicit close still work.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });

  it('keeps the popup open for targets rejected by clickOutsideFilter', async () => {
    const users = createUsers();
    const wired = mountWired(users, {
      clickOutsideFilter: (target) => !(target instanceof HTMLElement && target.classList.contains('outside')),
    });

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    // The filter rejects the external control button: the popup stays open.
    wired.els.outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(true);

    // Other outside targets are still rejected by the boundary and close.
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });
});

describe('headless combobox (option hover and focus)', () => {
  it('highlights the option under the mouse', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();

    wired.els.options[ 2 ]!.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    await nextTick();

    expect(wired.scope.highlightedIndex).toBe(2);
    expect(wired.els.options[ 2 ]!.getAttribute('data-highlighted')).toBe('true');

    wired.wrapper.unmount();
  });

  it('highlights the option that receives focus', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();

    wired.els.options[ 2 ]!.dispatchEvent(new FocusEvent('focus'));
    await nextTick();

    expect(wired.scope.highlightedIndex).toBe(2);

    wired.wrapper.unmount();
  });
});

describe('headless combobox (focus retention)', () => {
  it('keeps the filter focused when selecting with the popup open', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [] });

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(wired.els.input);

    wired.scope.select(users[ 0 ] as User);
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 0 ] ] ] ]);
    expect(document.activeElement).toBe(wired.els.input);

    wired.wrapper.unmount();
  });

  it('does not steal focus from a textarea while selecting', async () => {
    const users = createUsers();
    const holder: { scope?: SlotProps; } = {};

    const wrapper = mount(HeadlessCombobox, {
      attachTo: document.body,
      props: buildProps(users, { multiple: true, modelValue: [] }),
      slots: {
        default: (s: unknown) => {
          const sc = s as SlotProps;
          holder.scope = sc;
          return h('div', { ref: sc.setContainerRef }, [
            h('input', { ref: sc.setInputRef, class: 'filter' }),
            h('textarea', { class: 'notes' }),
          ]);
        },
      },
    });

    const scope = holder.scope as SlotProps;
    scope.open();
    await nextTick();
    await nextTick();

    const notes = wrapper.find('.notes').element as HTMLTextAreaElement;
    notes.focus();
    expect(document.activeElement).toBe(notes);

    scope.select(users[ 0 ] as User);
    await nextTick();
    expect(document.activeElement).toBe(notes);

    wrapper.unmount();
  });

  it('does not steal focus from a contenteditable element while selecting', async () => {
    const users = createUsers();
    const holder: { scope?: SlotProps; } = {};

    const wrapper = mount(HeadlessCombobox, {
      attachTo: document.body,
      props: buildProps(users, { multiple: true, modelValue: [] }),
      slots: {
        default: (s: unknown) => {
          const sc = s as SlotProps;
          holder.scope = sc;
          return h('div', { ref: sc.setContainerRef }, [
            h('input', { ref: sc.setInputRef, class: 'filter' }),
            h('div', { class: 'editable', contenteditable: 'true' }),
          ]);
        },
      },
    });

    const scope = holder.scope as SlotProps;
    scope.open();
    await nextTick();
    await nextTick();

    const editable = wrapper.find('.editable').element as HTMLElement;
    // jsdom does not implement isContentEditable; browsers report it for contenteditable.
    Object.defineProperty(editable, 'isContentEditable', { configurable: true, value: true });
    editable.focus();

    scope.select(users[ 0 ] as User);
    await nextTick();
    expect(document.activeElement).toBe(editable);

    wrapper.unmount();
  });

  it('does not steal focus from a control outside the widget', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [] });

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();

    wired.els.outside.focus();
    expect(document.activeElement).toBe(wired.els.outside);

    wired.scope.select(users[ 0 ] as User);
    await nextTick();
    expect(document.activeElement).toBe(wired.els.outside);

    wired.wrapper.unmount();
    wired.els.outside.remove();
  });

  it('clear keeps the popup open and keeps the filter focused', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [ users[ 0 ] as User ] });

    await wired.els.trigger.click();
    await nextTick();
    await nextTick();

    wired.scope.clear();
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [] ] ]);
    expect(wired.scope.isOpen).toBe(true);
    expect(document.activeElement).toBe(wired.els.input);

    wired.wrapper.unmount();
  });

  it('focusInput moves focus to the filter input', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    expect(document.activeElement).not.toBe(wired.els.input);
    wired.scope.focusInput();
    await nextTick();
    expect(document.activeElement).toBe(wired.els.input);

    wired.wrapper.unmount();
  });
});

describe('headless combobox (popover mode)', () => {
  it('drives the native popover API when the dropdown is a popover', async () => {
    const users = createUsers();
    const wired = mountWired(users, { wireList: false });

    const dropdown = wired.els.dropdown;
    dropdown.setAttribute('popover', '');
    // jsdom does not implement the Popover API; browsers expose it on elements.
    const show = vi.fn();
    const hide = vi.fn();
    Object.assign(dropdown, { showPopover: show, hidePopover: hide });

    wired.scope.open();
    await nextTick();
    expect(show).toHaveBeenCalledTimes(1);

    wired.scope.close();
    await nextTick();
    expect(hide).not.toHaveBeenCalled();

    // Simulate the browser reporting the popover as open (:popover-open).
    vi.spyOn(dropdown, 'matches').mockReturnValue(true);

    wired.scope.open();
    await nextTick();
    expect(show).toHaveBeenCalledTimes(1);

    wired.scope.close();
    await nextTick();
    expect(hide).toHaveBeenCalledTimes(1);

    wired.wrapper.unmount();
  });

  it('falls back to v-if rendering when the popover API is unavailable', async () => {
    const users = createUsers();
    const wired = mountWired(users, { wireList: false });

    wired.els.dropdown.setAttribute('popover', '');

    wired.scope.open();
    await nextTick();

    expect(wired.scope.isOpen).toBe(true);

    wired.wrapper.unmount();
  });
});

describe('headless combobox (alignSelected)', () => {
  it('anchors the popup over the selected option', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { alignSelected: true, modelValue: users[ 1 ] as User });

    cb.scope.open();
    await nextTick();

    expect(cb.scope.popupStyle.top).toBe('anchor(top)');
    expect(cb.scope.popupStyle.translate).toBe('0 -0px');
  });

  it('scrolls a selected option clipped above into view and aligns the popup over it', async () => {
    const users = createUsers();
    const wired = mountWired(users, { alignSelected: true, modelValue: users[ 1 ] as User });

    // The dropdown is scaled to 50% (offsetWidth > rect width), so measured
    // offsets are divided by the scale to recover unscaled coordinates.
    Object.defineProperty(wired.els.list, 'offsetWidth', { configurable: true, value: 200 });
    Object.defineProperty(wired.els.dropdown, 'offsetWidth', { configurable: true, value: 200 });
    vi.spyOn(wired.els.list, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 300, width: 0 } as DOMRect);
    vi.spyOn(wired.els.dropdown, 'getBoundingClientRect').mockReturnValue({ top: 50, bottom: 350, width: 0 } as DOMRect);
    // The selected option sits above the visible list area (top 60 < container top 100).
    vi.spyOn(wired.els.options[ 1 ]!, 'getBoundingClientRect').mockReturnValue({ top: 60, bottom: 120 } as DOMRect);

    wired.scope.open();
    await nextTick();
    await nextTick();

    // 0-width rects make the scale 0, which falls back to 1.
    expect(wired.els.list.scrollTop).toBe(-40);
    expect(wired.scope.alignmentOffset).toBe(10);
    expect(wired.scope.popupStyle.translate).toBe('0 -10px');

    wired.wrapper.unmount();
  });

  it('scrolls a selected option clipped below into view', async () => {
    const users = createUsers();
    const wired = mountWired(users, { alignSelected: true, modelValue: users[ 1 ] as User });

    vi.spyOn(wired.els.list, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 300, width: 0 } as DOMRect);
    vi.spyOn(wired.els.dropdown, 'getBoundingClientRect').mockReturnValue({ top: 50, bottom: 350, width: 0 } as DOMRect);
    // The selected option sits below the visible list area (bottom 450 > container bottom 300).
    vi.spyOn(wired.els.options[ 1 ]!, 'getBoundingClientRect').mockReturnValue({ top: 350, bottom: 450 } as DOMRect);

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.els.list.scrollTop).toBe(150);
    expect(wired.scope.alignmentOffset).toBe(300);

    wired.wrapper.unmount();
  });

  it('resets the alignment offset when the selected option has no element', async () => {
    const users = createUsers();
    const wired = mountWired(users, { alignSelected: true, modelValue: users[ 1 ] as User, wireList: false });

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.scope.alignmentOffset).toBe(0);

    wired.wrapper.unmount();
  });

  it('scrolls the highlighted option into view on open, even without a scroll container', async () => {
    const users = createUsers();
    const wired = mountWired(users, { wireList: false });

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.scope.isOpen).toBe(true);

    wired.wrapper.unmount();
  });
});

function mountComposable(config: MountConfig = {}) {
  const users = createUsers();
  const selected = ref<User | null>(null);
  const holder: { scope?: HeadlessComboboxScope<User, User>; } = {};
  const wrapper = mount({
    setup() {
      holder.scope = useHeadlessCombobox<User>(
        reactive({
          modelValue: selected,
          options: users,
          ...(config.multiple !== undefined ? { multiple: config.multiple } : {}),
          ...(config.maxLength !== undefined ? { maxLength: config.maxLength } : {}),
          optionLabel: (option: unknown) => (option as User).name,
        }),
        (value) => {
          selected.value = value as User | null;
        },
      );
      return () => h('div');
    },
  });
  return {
    wrapper,
    users,
    selected,
    get scope(): HeadlessComboboxScope<User, User> {
      return holder.scope as HeadlessComboboxScope<User, User>;
    },
  };
}

describe('useHeadlessCombobox (composable)', () => {
  it('syncs the modelValue ref through the emit callback', async () => {
    const cb = mountComposable();

    cb.scope.select(cb.users[ 0 ] as User);
    await nextTick();

    // A ref deep-converts object values (reactive), so compare structurally;
    // `isSelected` is the identity-safe API.
    expect(cb.selected.value).toEqual(cb.users[ 0 ]);
    expect(cb.scope.isSelected(cb.users[ 0 ] as User)).toBe(true);
    expect(cb.scope.selectedCount.value).toBe(1);

    cb.scope.clear();
    await nextTick();
    expect(cb.selected.value).toBeNull();

    cb.wrapper.unmount();
  });

  it('supports programmatic control outside a template', async () => {
    const cb = mountComposable();

    await cb.scope.open();
    expect(cb.scope.isOpen.value).toBe(true);

    cb.scope.close();
    expect(cb.scope.isOpen.value).toBe(false);

    cb.scope.toggle();
    await nextTick();
    expect(cb.scope.isOpen.value).toBe(true);
    await cb.scope.close();

    cb.wrapper.unmount();
  });

  it('filters through the exposed query refs', async () => {
    const cb = mountComposable();

    cb.scope.setSearchQuery('wade');
    await nextTick();

    expect(cb.scope.searchQuery.value).toBe('wade');
    expect(cb.scope.filteredOptions.value).toEqual([ cb.users[ 0 ] ]);

    cb.wrapper.unmount();
  });

  it('accepts plain props with refs — no reactive wrapper needed', async () => {
    const users = createUsers();
    const selected = ref<User | null>(null);
    const holder: { scope?: HeadlessComboboxScope<User, User>; } = {};
    const wrapper = mount({
      setup() {
        holder.scope = useHeadlessCombobox<User>({
          modelValue: selected,
          options: users,
          optionLabel: (option: unknown) => (option as User).name,
        }, (value) => {
          selected.value = value as User | null;
        });
        return () => h('div');
      },
    });

    const scope = holder.scope as HeadlessComboboxScope<User, User>;
    // refs are unwrapped and tracked without any reactive() wrapper
    scope.select(users[ 0 ] as User);
    await nextTick();
    expect(selected.value).toEqual(users[ 0 ]);
    expect(scope.isSelected(users[ 0 ] as User)).toBe(true);

    scope.setSearchQuery('wade');
    await nextTick();
    expect(scope.filteredOptions.value).toEqual([ users[ 0 ] ]);

    wrapper.unmount();
  });
});

describe('headless combobox (optionValue)', () => {
  interface LabeledValue {
    label: string;
    value: number;
  }

  const labeledOptions = (): LabeledValue[] => [
    { label: 'Vue', value: 1 },
    { label: 'React', value: 2 },
    { label: 'Svelte', value: 3 },
  ];

  type LabeledSlot = HeadlessComboboxSlotProps<LabeledValue, number>;

  function mountLabeled(modelValue: number | number[] | null, config: { multiple?: boolean; alignSelected?: boolean; } = {}) {
    let latest: LabeledSlot;
    const els = {
      dropdown: null as HTMLElement | null,
      list: null as HTMLElement | null,
      options: [] as HTMLElement[],
    };
    const options = labeledOptions();

    const wrapper = mount(HeadlessCombobox, {
      attachTo: document.body,
      props: {
        modelValue,
        options,
        optionLabel: (o: unknown) => (o as LabeledValue).label,
        optionValue: (o: unknown) => (o as LabeledValue).value,
        ...(config.multiple !== undefined ? { multiple: config.multiple } : {}),
        ...(config.alignSelected !== undefined ? { alignSelected: config.alignSelected } : {}),
      },
      slots: {
        default: (s: unknown) => {
          const sc = s as LabeledSlot;
          latest = sc;
          return h('div', {
            ref: (el: unknown) => {
              sc.setDropdownRef(el);
              els.dropdown = el as HTMLElement;
            },
          }, [
            h('div', {
              ref: (el: unknown) => {
                sc.setListRef(el);
                els.list = el as HTMLElement;
              },
            }, options.map((o, i) =>
              h('div', {
                ref: (el: unknown) => {
                  sc.setOptionRef(o, el);
                  els.options[ i ] = el as HTMLElement;
                },
                class: 'opt',
                ...sc.getOptionProps(o, i),
              }, o.label),
            )),
          ]);
        },
      },
    });

    return {
      wrapper,
      els,
      get scope(): LabeledSlot {
        return latest;
      },
    };
  }

  it('emits the option value instead of the option on select', async () => {
    const options = labeledOptions();
    const cb = mountLabeled(null);

    cb.scope.select(options[ 1 ]!);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ 2 ] ]);
  });

  it('shows the option selected when the model holds its value', () => {
    const options = labeledOptions();
    const cb = mountLabeled(1);

    expect(cb.scope.selectedCount).toBe(1);
    expect(cb.scope.isSelected(options[ 0 ]!)).toBe(true);
    expect(cb.scope.isSelected(options[ 1 ]!)).toBe(false);
  });

  it('removes the value when a selected option is selected again', async () => {
    const options = labeledOptions();
    const cb = mountLabeled([ 1, 2 ], { multiple: true });

    cb.scope.select(options[ 1 ]!);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [ 1 ] ] ]);

    cb.wrapper.unmount();
  });

  it('appends the option value in multiple mode', async () => {
    const options = labeledOptions();
    const cb = mountLabeled([ 1, 2 ], { multiple: true });

    cb.scope.select(options[ 2 ]!);
    await nextTick();

    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ [ 1, 2, 3 ] ] ]);

    cb.wrapper.unmount();
  });

  it('opens with the option matching the model value highlighted', async () => {
    const cb = mountLabeled(3);

    cb.scope.open();
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(2);
  });

  it('aligns the popup over the option matching the selected value', async () => {
    const wired = mountLabeled(2, { alignSelected: true });

    Object.defineProperty(wired.els.list!, 'offsetWidth', { configurable: true, value: 200 });
    Object.defineProperty(wired.els.dropdown!, 'offsetWidth', { configurable: true, value: 200 });
    vi.spyOn(wired.els.list!, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 300, width: 0 } as DOMRect);
    vi.spyOn(wired.els.dropdown!, 'getBoundingClientRect').mockReturnValue({ top: 50, bottom: 350, width: 0 } as DOMRect);
    // The option with value 2 sits at 160-200 within the page.
    vi.spyOn(wired.els.options[ 1 ]!, 'getBoundingClientRect').mockReturnValue({ top: 160, bottom: 200 } as DOMRect);

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.scope.alignmentOffset).toBe(110);
    expect(wired.scope.popupStyle.translate).toBe('0 -110px');

    wired.wrapper.unmount();
  });

  it('resets the alignment when no option matches the selected value', async () => {
    const wired = mountLabeled(99, { alignSelected: true });

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.scope.alignmentOffset).toBe(0);
    expect(wired.scope.popupStyle.translate).toBe('0 -0px');

    wired.wrapper.unmount();
  });
});

describe('headless combobox (scroll guards)', () => {
  it('skips scrolling when the list container is not mounted', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { modelValue: users[ 0 ] as User });
    const optionEl = document.createElement('div');
    cb.scope.setOptionRef(users[ 0 ] as User, optionEl);

    cb.scope.open();
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(0);
  });

  it('skips scrolling when there is no highlighted option', async () => {
    const cb = mountComboBox([]);

    cb.scope.open();
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(-1);
  });
});

describe('headless combobox (internal state)', () => {
  it('keeps the selection internally when no v-model listener is attached', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.select(users[ 1 ] as User);
    await nextTick();

    expect(cb.scope.isSelected(users[ 1 ] as User)).toBe(true);
    expect(cb.scope.selectedCount).toBe(1);
    // The value is still emitted (a no-op without a listener).
    expect(cb.wrapper.emitted('update:modelValue')).toEqual([ [ users[ 1 ] ] ]);
  });

  it('toggles the internal selection in multiple mode', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true });

    cb.scope.select(users[ 0 ] as User);
    await nextTick();
    cb.scope.select(users[ 1 ] as User);
    await nextTick();
    expect(cb.scope.selectedCount).toBe(2);
    expect(cb.scope.isSelected(users[ 1 ] as User)).toBe(true);

    cb.scope.select(users[ 0 ] as User);
    await nextTick();
    expect(cb.scope.selectedCount).toBe(1);
    expect(cb.scope.isSelected(users[ 0 ] as User)).toBe(false);
  });
});
function mockVisibleRects() {
  return vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([ { width: 1 } ] as unknown as DOMRectList);
}

describe('headless combobox (keyboard paging, home/end, tab)', () => {
  it('jumps a full page on PageDown/PageUp', async () => {
    const users = [ ...createUsers(), { id: 4, name: 'Quinn Kirk' }, { id: 5, name: 'Sage Moss' } ];
    const wired = mountWired(users);
    // 60px list / 20px options = 3 visible steps.
    Object.defineProperty(wired.els.list, 'clientHeight', { configurable: true, value: 60 });
    wired.els.options.forEach((el) => {
      Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 20 });
    });

    wired.scope.open();
    await nextTick();

    wired.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageDown' }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(3);

    wired.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageUp' }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(0);

    wired.wrapper.unmount();
  });

  it('falls back to a 10-option page and clamps at the ends without wrapping', async () => {
    const users = createUsers();
    const cb = mountComboBox(users);

    cb.scope.open();
    await nextTick();
    cb.scope.setHighlightedIndex(0);
    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageDown' }));
    await nextTick();
    // 0 + 10 clamps to the last option (3 options).
    expect(cb.scope.highlightedIndex).toBe(2);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageDown' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(2);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageUp' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);

    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageUp' }));
    await nextTick();
    expect(cb.scope.highlightedIndex).toBe(0);
  });

  it('keeps Home/End native in inputs and jumps to the ends from the trigger', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    wired.scope.open();
    await nextTick();

    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(0);

    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(0);

    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(2);

    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await nextTick();
    expect(wired.scope.highlightedIndex).toBe(0);

    wired.wrapper.unmount();
  });

  it('skips the options list on Tab and closes when focus leaves the widget', async () => {
    const users = createUsers();
    const wired = mountWired(users);
    const rectSpy = mockVisibleRects();

    wired.scope.open();
    await nextTick();
    // Start from the searchbox: the next focusable is the options list, so Tab
    // skips past it to the outside button.
    wired.els.searchbox.focus();
    wired.els.searchbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await nextTick();

    expect(document.activeElement).toBe(wired.els.outside);
    expect(wired.scope.isOpen).toBe(false);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });

  it('stays open when Tab lands inside the widget', async () => {
    const users = createUsers();
    const wired = mountWired(users);
    const rectSpy = mockVisibleRects();

    wired.scope.open();
    await nextTick();
    wired.els.trigger.focus();
    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    await nextTick();

    expect(document.activeElement).toBe(wired.els.input);
    expect(wired.scope.isOpen).toBe(true);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });

  it('goes backward on Shift+Tab from an option', async () => {
    const users = createUsers();
    const wired = mountWired(users);
    const rectSpy = mockVisibleRects();

    wired.scope.open();
    await nextTick();
    // Shift+Tab from the searchbox moves back to the filter input (both inside).
    wired.els.searchbox.focus();
    wired.els.searchbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    await nextTick();

    expect(document.activeElement).toBe(wired.els.input);
    expect(wired.scope.isOpen).toBe(true);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });

  it('selects the highlighted option on Tab with selectOnTab', async () => {
    const users = createUsers();
    const wired = mountWired(users, { selectOnTab: true });
    const rectSpy = mockVisibleRects();

    wired.scope.open();
    await nextTick();
    wired.els.searchbox.focus();
    wired.els.searchbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ users[ 0 ] ] ]);
    expect(wired.scope.isSelected(users[ 0 ] as User)).toBe(true);
    // The focus continues to the next focusable element, like a normal Tab.
    // (In this harness the filter input sits outside the popup, so its
    // combobox onFocus reopens the popup — the popup element is hidden in a
    // real consumer, so this does not happen there.)
    expect(document.activeElement).toBe(wired.els.input);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });

  it('closes the popup after selectOnTab in multiple mode', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, selectOnTab: true });
    const rectSpy = mockVisibleRects();

    wired.scope.open();
    await nextTick();
    wired.els.searchbox.focus();
    wired.els.searchbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 0 ] ] ] ]);
    expect(wired.scope.isOpen).toBe(false);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });

  it('clears the highlight on End when there are no options', async () => {
    const cb = mountComboBox([]);

    cb.scope.open();
    await nextTick();
    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(-1);
  });
  it('stops without wrapping when the page target is blocked', async () => {
    const users = createUsers();
    // Only the selected option is actionable; 1 and 2 are blocked by maxLength.
    const cb = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 0 ] as User ] });

    cb.scope.open();
    await nextTick();
    cb.scope.setHighlightedIndex(0);
    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageDown' }));
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(0);
  });

  it('does nothing when there is no focusable element', async () => {
    const users = createUsers();
    const wired = mountWired(users);
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([] as unknown as DOMRectList);

    wired.scope.open();
    await nextTick();
    wired.els.trigger.focus();
    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await nextTick();

    // Nothing to move to; the trigger keeps focus and the popup stays open.
    expect(document.activeElement).toBe(wired.els.trigger);
    expect(wired.scope.isOpen).toBe(true);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });
  it('stops without wrapping on PageUp when the target is blocked', async () => {
    const users = createUsers();
    const cb = mountComboBox(users, { multiple: true, maxLength: 1, modelValue: [ users[ 2 ] as User ] });

    cb.scope.open();
    await nextTick();
    cb.scope.setHighlightedIndex(2);
    cb.scope.handleKeydown(new KeyboardEvent('keydown', { key: 'PageUp' }));
    await nextTick();

    expect(cb.scope.highlightedIndex).toBe(2);
  });
});

describe('headless combobox (container keydown)', () => {
  it('skips the options list on Tab from a non-wired element inside the widget', async () => {
    const users = createUsers();
    const wired = mountWired(users);
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([ { width: 1 } ] as unknown as DOMRectList);
    // A custom control (like a clear button) with no keyboard wiring.
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    wired.els.container.appendChild(clear);

    wired.scope.open();
    await nextTick();
    clear.focus();
    clear.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await nextTick();

    expect(document.activeElement).toBe(wired.els.outside);
    expect(wired.scope.isOpen).toBe(false);

    rectSpy.mockRestore();
    wired.wrapper.unmount();
  });

  it('does not double-handle keys that bubble to the container', async () => {
    const users = createUsers();
    const wired = mountWired(users);

    wired.scope.open();
    await nextTick();
    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await nextTick();

    // One ArrowDown moves the highlight exactly one step (no double step).
    expect(wired.scope.highlightedIndex).toBe(1);

    wired.wrapper.unmount();
  });

  it('does not intercept Enter/Space/arrows on a non-wired button inside the container (chip remove button)', async () => {
    const users = createUsers();
    const wired = mountWired(users, { modelValue: users[ 0 ] as User });
    // Simulates a chip remove button: no keyboard wiring, native activation
    // must reach its click handler instead of the combobox opening.
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    const onClick = vi.fn();
    remove.addEventListener('click', onClick);
    wired.els.container.appendChild(remove);

    remove.focus();
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    remove.dispatchEvent(enter);
    await nextTick();
    expect(enter.defaultPrevented).toBe(false);
    expect(wired.scope.isOpen).toBe(false);

    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    remove.dispatchEvent(space);
    await nextTick();
    expect(space.defaultPrevented).toBe(false);
    expect(wired.scope.isOpen).toBe(false);

    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    remove.dispatchEvent(down);
    await nextTick();
    expect(down.defaultPrevented).toBe(false);
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });

  it('does not intercept Enter on a non-wired button inside the dropdown while open', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [] as User[] });
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    const onClick = vi.fn();
    clear.addEventListener('click', onClick);
    wired.els.dropdown.appendChild(clear);

    wired.scope.open();
    await nextTick();
    wired.scope.setHighlightedIndex(1);
    clear.focus();
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    clear.dispatchEvent(enter);
    await nextTick();

    // Native activation proceeds; the combobox does not select the highlighted
    // option instead of activating the button.
    expect(enter.defaultPrevented).toBe(false);
    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();

    wired.wrapper.unmount();
  });
});

describe('headless combobox (backspace/delete)', () => {
  it('removes the last selected option on Backspace while closed (multiple)', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [ users[ 0 ], users[ 1 ] ] as User[] });

    wired.els.trigger.focus();
    const backspace = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
    wired.els.trigger.dispatchEvent(backspace);
    await nextTick();

    expect(backspace.defaultPrevented).toBe(true);
    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 0 ] ] ] ]);
    expect(wired.scope.isOpen).toBe(false);

    wired.wrapper.unmount();
  });

  it('clears the sole value on Backspace while closed (single)', async () => {
    const users = createUsers();
    const wired = mountWired(users, { modelValue: users[ 0 ] as User });

    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ null ] ]);

    wired.wrapper.unmount();
  });

  it('removes the last selected option on Delete while open without a filter input', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [ users[ 0 ], users[ 1 ] ] as User[], wireInput: false });

    wired.scope.open();
    await nextTick();
    wired.els.trigger.focus();
    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 0 ] ] ] ]);
    expect(wired.scope.isOpen).toBe(true);

    wired.wrapper.unmount();
  });

  it('leaves Backspace to the input when it holds text, and removes only when empty', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [ users[ 0 ] ] as User[] });

    wired.els.input.value = 'Wade';
    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();

    wired.els.input.value = '';
    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();
    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [] ] ]);

    wired.wrapper.unmount();
  });

  it('does not remove while open with a filter input', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [ users[ 0 ] ] as User[] });

    wired.scope.open();
    await nextTick();
    wired.els.trigger.focus();
    wired.els.trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();

    wired.wrapper.unmount();
  });

  it('removes the selection on Backspace while open on an empty typeahead input', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User });

    wired.scope.open();
    await nextTick();
    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ null ] ]);

    wired.wrapper.unmount();
  });

  it('keeps the selection when Backspace hits the typeahead input holding the label text', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User });

    wired.scope.open();
    await nextTick();
    // The input shows the selection label (empty query); the first Backspace
    // deletes the visible text, it must not deselect the option.
    wired.els.input.value = 'Wade Cooper';
    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();

    wired.wrapper.unmount();
  });

  it('leaves Backspace to the typeahead input when it holds a query', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User });

    wired.scope.open();
    await nextTick();
    wired.scope.setSearchQuery('Wa');
    wired.els.input.value = 'Wa';
    wired.els.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
    await nextTick();

    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();

    wired.wrapper.unmount();
  });
});

describe('headless combobox (typeahead input on open)', () => {
  it('keeps the query empty by default so the consumer binding can show the current value', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User });

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.scope.isOpen).toBe(true);
    expect(wired.scope.searchQuery).toBeUndefined();

    wired.wrapper.unmount();
  });

  it('selects the input text when the popup opens (default inputOnOpen="select")', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User });
    wired.els.input.value = 'Wade';
    wired.els.input.setSelectionRange(1, 2);

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.els.input.selectionStart).toBe(0);
    expect(wired.els.input.selectionEnd).toBe(4);

    wired.wrapper.unmount();
  });

  it('keeps the text without selecting it with inputOnOpen="keep"', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User, inputOnOpen: 'keep' });
    wired.els.input.value = 'Wade';
    wired.els.input.setSelectionRange(1, 2);

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.els.input.selectionStart).toBe(1);
    expect(wired.els.input.selectionEnd).toBe(2);

    wired.wrapper.unmount();
  });

  it('opens with an empty query with inputOnOpen="clear"', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User, inputOnOpen: 'clear' });
    wired.els.input.value = 'Wade';
    wired.els.input.setSelectionRange(1, 2);

    wired.scope.open();
    await nextTick();
    await nextTick();

    expect(wired.scope.searchQuery).toBe('');
    expect(wired.els.input.selectionStart).toBe(1);
    expect(wired.els.input.selectionEnd).toBe(2);

    wired.wrapper.unmount();
  });

  it('does not select the input text when the popup reopens by typing', async () => {
    const users = createUsers();
    const wired = mountTypeahead(users, { modelValue: users[ 0 ] as User });
    wired.els.input.value = 'Wa';
    wired.els.input.setSelectionRange(1, 2);

    wired.els.input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    await nextTick();

    expect(wired.scope.isOpen).toBe(true);
    expect(wired.scope.searchQuery).toBe('Wa');
    expect(wired.els.input.selectionStart).toBe(1);
    expect(wired.els.input.selectionEnd).toBe(2);

    wired.wrapper.unmount();
  });
});

describe('headless combobox (space key)', () => {
  it('does nothing on the trigger without a filter input — no toggle, no select', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, wireInput: false });

    wired.scope.open();
    await nextTick();
    wired.els.trigger.focus();
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    wired.els.trigger.dispatchEvent(space);
    await nextTick();

    // Space must not reach the native button click, which would toggle the
    // popup closed; it selects nothing either.
    expect(space.defaultPrevented).toBe(true);
    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wired.scope.isOpen).toBe(true);

    wired.wrapper.unmount();
  });

  it('lets Space type in text entries and activate options natively', async () => {
    const users = createUsers();
    const wired = mountWired(users, { multiple: true, modelValue: [] as User[] });

    wired.scope.open();
    await nextTick();
    wired.els.searchbox.focus();
    wired.els.searchbox.value = 'Wade';
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    wired.els.searchbox.dispatchEvent(space);
    await nextTick();
    expect(space.defaultPrevented).toBe(false);
    expect(wired.wrapper.emitted('update:modelValue')).toBeUndefined();

    // On an option, Space falls through to the native click → select.
    wired.els.options[ 1 ]!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    wired.els.options[ 1 ]!.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    wired.els.options[ 1 ]!.click();
    await nextTick();
    expect(wired.wrapper.emitted('update:modelValue')).toEqual([ [ [ users[ 1 ] ] ] ]);

    wired.wrapper.unmount();
  });
});
