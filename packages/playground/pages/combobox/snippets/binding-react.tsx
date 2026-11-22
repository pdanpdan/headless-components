<HeadlessCombobox
  options={options}
  value={value}
  onChange={setValue}
>
  {(scope) => (
    <div ref={scope.setContainerRef}>
      <button ref={scope.setTriggerRef} {...toReactProps(scope.triggerProps)}>
        {value ?? 'Select…'}
      </button>
      {scope.isOpen && (
        <ul {...toReactProps(scope.listboxProps)}>
          {scope.filteredOptions.map((option, index) => (
            <li
              key={option}
              {...toReactProps(scope.getOptionProps(option, index))}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )}
</HeadlessCombobox>
