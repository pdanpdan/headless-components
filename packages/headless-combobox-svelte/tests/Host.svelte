<script lang="ts">
  import type { SvelteComboboxSnapshot } from '../src/store';

  import Combobox from '../src/HeadlessCombobox.svelte';

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
  {#snippet children(scope: SvelteComboboxSnapshot<User, User>)}
    <div
      {@attach (el) => {
        scope.setContainerRef(el);
        return () => scope.setContainerRef(null);
      }}
    >
      <button
        type="button"
        {...scope.triggerProps}
        {@attach (el) => {
          scope.setTriggerRef(el);
          return () => scope.setTriggerRef(null);
        }}
      >
        Trigger
      </button>
      <ul
        {...scope.listboxProps}
        {@attach (el) => {
          scope.setDropdownRef(el);
          return () => scope.setDropdownRef(null);
        }}
      >
        {#each scope.filteredOptions as user, index (user.id)}
          <li
            {...scope.getOptionProps(user, index)}
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
