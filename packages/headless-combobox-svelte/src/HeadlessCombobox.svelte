<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy, onMount } from 'svelte';

  import type { SvelteComboboxSnapshot } from './store';
  import { createComboboxStore, toCoreProps } from './store';

  let props: {
    children: Snippet<[SvelteComboboxSnapshot<unknown, unknown, string>]>;
    onChange?: (value: unknown) => void;
    [key: string]: unknown;
  } = $props();

  const store = createComboboxStore<unknown, unknown, string>({
    props: () => toCoreProps(props),
    onChange: (value) => props.onChange?.(value),
  });

  let snapshot = $state.raw(store.getSnapshot());

  $effect(() => store.subscribe((value) => {
    snapshot = value;
  }));

  $effect(() => {
    store.setProps(toCoreProps(props));
  });

  onMount(() => store.mount());
  onDestroy(() => store.destroy());
</script>

{@render props.children(snapshot)}
