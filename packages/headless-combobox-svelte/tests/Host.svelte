<script lang="ts">
  import type { HeadlessComboboxSnapshot } from '@pdanpdan/headless-combobox-core';

  import Combobox from '../src/HeadlessCombobox.svelte';
  import { toSvelteProps } from '../src/store';

  interface User {
    id: number;
    name: string;
  }

  let {
    options,
    onChange,
  }: {
    options: User[];
    onChange?: (value: User | User[] | null) => void;
  } = $props();
</script>

<Combobox {options} {onChange} optionLabel={(user: unknown) => (user as User).name}>
  {#snippet children(scope: HeadlessComboboxSnapshot<User, User>)}
    <div
      {@attach (el) => {
        scope.setContainerRef(el);
        return () => scope.setContainerRef(null);
      }}
    >
      <button
        type="button"
        {...toSvelteProps(scope.triggerProps)}
        {@attach (el) => {
          scope.setTriggerRef(el);
          return () => scope.setTriggerRef(null);
        }}
      >
        Trigger
      </button>
      <ul
        {...toSvelteProps(scope.listboxProps)}
        {@attach (el) => {
          scope.setDropdownRef(el);
          return () => scope.setDropdownRef(null);
        }}
      >
        {#each scope.filteredOptions as user, index (user.id)}
          <li
            {...toSvelteProps(scope.getOptionProps(user, index))}
            {@attach (el) => {
              scope.setOptionRef(user, el);
              return () => scope.setOptionRef(user, null);
            }}
          >
            {user.name}
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</Combobox>
