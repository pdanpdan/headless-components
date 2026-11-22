<HeadlessCombobox
  options={options}
  modelValue={value}
  onChange={(next) => (value = next)}
>
  {#snippet children(scope)}
    <div {@attach scope.setContainerRef}>
      <button
        type="button"
        {...toSvelteProps(scope.triggerProps)}
        {@attach scope.setTriggerRef}
      >
        {value ?? 'Select…'}
      </button>
      {#if scope.isOpen}
        <ul {...toSvelteProps(scope.listboxProps)}>
          {#each scope.filteredOptions as option, index (option)}
            <li {...toSvelteProps(scope.getOptionProps(option, index))}>
              {option}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/snippet}
</HeadlessCombobox>
