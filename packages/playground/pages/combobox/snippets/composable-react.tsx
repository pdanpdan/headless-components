import { useState } from 'react';
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox-react';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

export function Example() {
  const [ value, setValue ] = useState<User | null>(null);
  const scope = useHeadlessCombobox({
    options: users,
    value,
    optionLabel: (user) => user.name,
    onChange: (next) => setValue(next as User | null),
  });

  return (
    <div ref={scope.setContainerRef}>
      <input
        {...scope.comboboxInputProps}
        aria-label="Search users"
      />
      {scope.isOpen && (
        <ul {...scope.listboxProps}>
          {scope.filteredOptions.map((user, index) => (
            <li key={user.id}>
              <button
                type="button"
                {...scope.getOptionProps(user, index)}
              >
                {user.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
