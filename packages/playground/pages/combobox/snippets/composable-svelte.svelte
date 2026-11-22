<script lang="ts">
  import { onMount } from 'svelte';
  import { createComboboxStore, toSvelteProps } from '@pdanpdan/headless-combobox-svelte';

  interface User {
    id: number;
    name: string;
  }

  const users: User[] = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
  ];

  let value = $state<User | null>(null);
  const combobox = createComboboxStore({
    props: () => ({
      modelValue: value,
      options: users,
      optionLabel: (user: User) => user.name,
    }),
    onChange: (next) => (value = next as User | null),
  });

  onMount(() => {
    combobox.mount();
    return () => combobox.destroy();
  });
</script>

<div {@attach $combobox.setContainerRef}>
  <input
    {...toSvelteProps($combobox.comboboxInputProps)}
    {@attach (el) => {
      $combobox.setTriggerRef(el);
      $combobox.setInputRef(el);
    }}
    aria-label="Search users"
  />
  {#if $combobox.isOpen}
    <ul {...toSvelteProps($combobox.listboxProps)}>
      {#each $combobox.filteredOptions as user, index (user.id)}
        <li>
          <button
            type="button"
            {...toSvelteProps($combobox.getOptionProps(user, index))}
            {@attach (el) => $combobox.setOptionRef(user, el)}
          >
            {user.name}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
