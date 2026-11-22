import { flushSync, mount, tick, unmount } from 'svelte';
import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createComboboxStore } from '../src';
import Host from './Host.svelte';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
];

describe('svelte adapter', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('exposes the snapshot through the Svelte store contract', () => {
    const onChange = vi.fn();
    const store = createComboboxStore<User, User>({
      props: {
        modelValue: null,
        options: users,
        optionLabel: (user) => user.name,
      },
      onChange,
    });

    expect(get(store).isOpen).toBe(false);

    store.getSnapshot().select(users[ 0 ]!);

    expect(onChange).toHaveBeenCalledWith(users[ 0 ]);
    expect(get(store).isSelected(users[ 0 ]!)).toBe(true);

    store.destroy();
  });

  it('mounts the component and selects an option', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const onChange = vi.fn();

    const component = mount(Host, {
      target,
      props: { options: users, onChange },
    });

    const trigger = target.querySelector('button')!;
    trigger.click();
    flushSync();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const options = target.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(3);

    (options[ 1 ] as HTMLElement).click();
    flushSync();
    await tick();

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    unmount(component);
  });

  it('navigates the list with the keyboard', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const onChange = vi.fn();

    const component = mount(Host, {
      target,
      props: { options: users, onChange },
    });

    const trigger = target.querySelector('button')!;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    flushSync();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    flushSync();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    flushSync();

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);

    unmount(component);
  });
});
