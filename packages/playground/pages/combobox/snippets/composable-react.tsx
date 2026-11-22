import { useState } from 'react';
import { toReactProps, useHeadlessCombobox } from '@pdanpdan/headless-combobox-react';

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
        ref={(el) => {
          scope.setTriggerRef(el);
          scope.setInputRef(el);
        }}
        {...toReactProps(scope.comboboxInputProps)}
        aria-label="Search users"
      />
      {scope.isOpen && (
        <ul {...toReactProps(scope.listboxProps)}>
          {scope.filteredOptions.map((user, index) => (
            <li key={user.id}>
              <button
                type="button"
                ref={(el) => scope.setOptionRef(user, el)}
                {...toReactProps(scope.getOptionProps(user, index))}
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
