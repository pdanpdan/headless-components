<HeadlessCombobox
  options={options}
  value={value()}
  onChange={setValue}
>
  {(scope) => (
    <div ref={scope().setContainerRef}>
      <button ref={scope().setTriggerRef} {...scope().triggerProps}>
        {value() ?? 'Select…'}
      </button>
      {scope().isOpen && (
        <ul {...scope().listboxProps}>
          <For each={scope().filteredOptions}>
            {(option, index) => (
              <li {...scope().getOptionProps(option, index())}>
                {option}
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  )}
</HeadlessCombobox>
