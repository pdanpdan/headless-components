import type { HeadlessComboboxSnapshot } from '../src';
import type { Accessor } from 'solid-js';

import { delegateEvents, render } from '@solidjs/web';
import { createSignal, flush, For } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeadlessCombobox, toSolidProps } from '../src';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
];

function ComboboxMarkup(props: {
  scope: Accessor<HeadlessComboboxSnapshot<User, User>>;
}) {
  return (
    <div ref={props.scope().setContainerRef}>
      <button
        ref={props.scope().setTriggerRef}
        type="button"
        {...toSolidProps(props.scope().triggerProps)}
      >
        Trigger
      </button>
      <ul ref={props.scope().setDropdownRef} {...toSolidProps(props.scope().listboxProps)}>
        <For each={props.scope().filteredOptions}>
          {(user, index) => (
            <li
              ref={(el) => {
                props.scope().setOptionRef(user, el);
              }}
              {...toSolidProps(props.scope().getOptionProps(user, index()))}
            >
              {user.name}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

describe('solid adapter', () => {
  let container: HTMLDivElement;
  let dispose: () => void;

  beforeEach(() => {
    delegateEvents([
      'click',
      'keydown',
      'mousedown',
      'mousemove',
      'focus',
      'input',
    ]);
    container = document.createElement('div');
    document.body.appendChild(container);
    dispose = () => {};
  });

  afterEach(() => {
    dispose();
    container.remove();
  });

  it('opens and selects a value', () => {
    const onChange = vi.fn();

    dispose = render(() => (
      <HeadlessCombobox options={users} optionLabel={(user) => user.name} onChange={onChange}>
        {(scope) => <ComboboxMarkup scope={scope} />}
      </HeadlessCombobox>
    ), container);

    const trigger = container.querySelector('button')!;
    trigger.click();
    flush();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const options = container.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(3);

    (options[ 1 ] as HTMLElement).click();
    flush();

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('navigates with the keyboard and selects the highlighted option', () => {
    const onChange = vi.fn();

    dispose = render(() => (
      <HeadlessCombobox options={users} optionLabel={(user) => user.name} onChange={onChange}>
        {(scope) => <ComboboxMarkup scope={scope} />}
      </HeadlessCombobox>
    ), container);

    const trigger = container.querySelector('button')!;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    flush();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    flush();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    flush();

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
  });

  it('round-trips a controlled value', () => {
    function Controlled() {
      const [ value, setValue ] = createSignal<User | null>(null);
      return (
        <div>
          <HeadlessCombobox
            options={users}
            optionLabel={(user) => user.name}
            value={value()}
            onChange={(next) => setValue(next as User | null)}
          >
            {(scope) => <ComboboxMarkup scope={scope} />}
          </HeadlessCombobox>
          <output>{value()?.name ?? 'none'}</output>
        </div>
      );
    }

    dispose = render(() => <Controlled />, container);

    container.querySelector('button')!.click();
    flush();
    (container.querySelectorAll('[role="option"]')[ 2 ] as HTMLElement).click();
    flush();

    expect(container.querySelector('output')!.textContent).toBe('Devon Webb');
  });
});
