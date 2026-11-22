<script lang="ts">
  import type { HeadlessComboboxSnapshot } from '@pdanpdan/headless-combobox-core';
  import type { Snippet } from 'svelte';
  import { onDestroy, onMount } from 'svelte';

  import { createComboboxStore, toCoreProps } from './store';

  let props: {
    children: Snippet<[HeadlessComboboxSnapshot<unknown, unknown, string>]>;
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
