<HeadlessCombobox
  options={options}
  value={value()}
  onChange={setValue}
>
  {(scope) => (
    <div ref={scope().setContainerRef}>
      <button ref={scope().setTriggerRef} {...toSolidProps(scope().triggerProps)}>
        {value() ?? 'Select…'}
      </button>
      {scope().isOpen && (
        <ul {...toSolidProps(scope().listboxProps)}>
          <For each={scope().filteredOptions}>
            {(option, index) => (
              <li {...toSolidProps(scope().getOptionProps(option, index()))}>
                {option}
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  )}
</HeadlessCombobox>
