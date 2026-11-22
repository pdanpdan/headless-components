<HeadlessCombobox
  options={options}
  modelValue={value}
  onChange={(next) => (value = next)}
>
  {#snippet children(scope)}
    <div {@attach scope.setContainerRef}>
      <button
        type="button"
        {...scope.triggerProps}
      >
        {value ?? 'Select…'}
      </button>
      {#if scope.isOpen}
        <ul {...scope.listboxProps}>
          {#each scope.filteredOptions as option, index (option)}
            <li {...scope.getOptionProps(option, index)}>
              {option}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/snippet}
</HeadlessCombobox>
