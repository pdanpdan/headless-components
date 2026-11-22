# @pdanpdan/headless-combobox-svelte

Accessible, renderless combobox for Svelte 5. Backed by [`@pdanpdan/headless-combobox-core`](../headless-combobox-core).

## Install

```bash
pnpm add @pdanpdan/headless-combobox-svelte
```

`svelte@>=5` is a peer dependency.

## Usage

```svelte
<script lang="ts">
  import HeadlessCombobox from '@pdanpdan/headless-combobox-svelte/HeadlessCombobox.svelte';

  const users = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
  ];
  let value = $state<typeof users[number] | null>(null);
</script>

<HeadlessCombobox
  options={users}
  optionLabel={(user) => user.name}
  modelValue={value}
  onChange={(next) => (value = next as typeof users[number] | null)}
>
  {#snippet children(scope)}
    <div
      {@attach (el) => {
        scope.setContainerRef(el);
        return () => scope.setContainerRef(null);
      }}
    >
      <button
        type="button"
        {...scope.triggerProps}
      >
        {value?.name ?? 'Select…'}
      </button>

      <ul
        {...scope.listboxProps}
      >
        {#each scope.filteredOptions as user, index (user.id)}
          <li
            {...scope.getOptionProps(user, index)}
          >
            {user.name}
          </li>
        {/each}
      </ul>
    </div>
  {/snippet}
</HeadlessCombobox>
```

### Store API

`createComboboxStore({ props, onChange })` returns a Svelte store, so `$combobox` gives the live snapshot with Svelte-ready prop bags. Call `store.mount()` / `store.destroy()` yourself when using the store directly. For a raw core snapshot, `toSvelteProps` maps the handlers to Svelte 5 event attributes.
