<HeadlessCombobox
  options={options}
  value={value}
  onChange={setValue}
>
  {(scope) => (
    <div ref={scope.setContainerRef}>
      <button {...scope.triggerProps}>
        {value ?? 'Select…'}
      </button>
      {scope.isOpen && (
        <ul {...scope.listboxProps}>
          {scope.filteredOptions.map((option, index) => (
            <li
              key={option}
              {...scope.getOptionProps(option, index)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )}
</HeadlessCombobox>
