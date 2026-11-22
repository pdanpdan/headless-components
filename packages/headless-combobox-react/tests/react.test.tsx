import type { HeadlessComboboxSnapshot } from '../src';
import type { Root } from 'react-dom/client';

import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeadlessCombobox, toReactProps } from '../src';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
];

// React only silences the act() environment warning when this is set.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean; }).IS_REACT_ACT_ENVIRONMENT = true;

function ComboboxMarkup({
  scope,
}: {
  scope: HeadlessComboboxSnapshot<User, User>;
}) {
  return (
    <div ref={scope.setContainerRef}>
      <button ref={scope.setTriggerRef} type="button" {...toReactProps(scope.triggerProps)}>
        Trigger
      </button>
      <ul ref={scope.setDropdownRef} {...toReactProps(scope.listboxProps)}>
        {scope.filteredOptions.map((user, index) => (
          <li
            key={user.id}
            ref={(el) => {
              scope.setOptionRef(user, el);
            }}
            {...toReactProps(scope.getOptionProps(user, index))}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('react adapter', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('opens, navigates, and selects a value', async () => {
    const onChange = vi.fn();

    await act(async () => {
      root.render(
        <HeadlessCombobox options={users} optionLabel={(user) => user.name} onChange={onChange}>
          {(scope) => <ComboboxMarkup scope={scope} />}
        </HeadlessCombobox>,
      );
    });

    const trigger = container.querySelector('button')!;
    await act(async () => {
      trigger.click();
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(3);

    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith(users[ 1 ]);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('round-trips a controlled value through onChange', async () => {
    function Controlled() {
      const [ value, setValue ] = useState<User | null>(null);
      return (
        <HeadlessCombobox
          options={users}
          optionLabel={(user) => user.name}
          value={value}
          onChange={(next) => setValue(next as User | null)}
        >
          {(scope) => (
            <div>
              <ComboboxMarkup scope={scope} />
              <output>{value?.name ?? 'none'}</output>
            </div>
          )}
        </HeadlessCombobox>
      );
    }

    await act(async () => {
      root.render(<Controlled />);
    });

    await act(async () => {
      container.querySelector('button')!.click();
    });

    const options = container.querySelectorAll('[role="option"]');
    await act(async () => {
      (options[ 1 ] as HTMLElement).click();
    });

    expect(container.querySelector('output')!.textContent).toBe('Arlene Mccoy');
  });

  it('filters through the aria prop bags', async () => {
    await act(async () => {
      root.render(
        <HeadlessCombobox options={users} optionLabel={(user) => user.name}>
          {(scope) => (
            <div ref={scope.setContainerRef}>
              <input
                ref={(el) => {
                  scope.setTriggerRef(el);
                  scope.setInputRef(el);
                }}
                {...toReactProps(scope.comboboxInputProps)}
              />
              <ul {...toReactProps(scope.listboxProps)}>
                {scope.filteredOptions.map((user, index) => (
                  <li key={user.id} {...toReactProps(scope.getOptionProps(user, index))}>
                    {user.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </HeadlessCombobox>,
      );
    });

    const input = container.querySelector('input')!;
    await act(async () => {
      input.focus();
    });
    await act(async () => {
      input.value = 'dev';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const options = container.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[ 0 ]!.textContent).toBe('Devon Webb');
  });
});
