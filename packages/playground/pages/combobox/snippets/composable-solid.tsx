import { For, createSignal } from 'solid-js';
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox-solid';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

export function Example() {
  const [ value, setValue ] = createSignal<User | null>(null);
  const scope = useHeadlessCombobox(() => ({
    options: users,
    value: value(),
    optionLabel: (user) => user.name,
    onChange: (next) => setValue(next as User | null),
  }));

  return (
    <div ref={scope().setContainerRef}>
      <input
        {...scope().comboboxInputProps}
        aria-label="Search users"
      />
      {scope().isOpen && (
        <ul {...scope().listboxProps}>
          <For each={scope().filteredOptions}>
            {(user, index) => (
              <li>
                <button
                  type="button"
                  {...scope().getOptionProps(user, index())}
                >
                  {user.name}
                </button>
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  );
}
