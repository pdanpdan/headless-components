<HeadlessCombobox
  v-slot="scope"
  v-model="value"
  :options="options"
>
  <div :ref="scope.setContainerRef">
    <button :ref="scope.setTriggerRef" v-bind="scope.triggerProps">
      {{ value ?? 'Select…' }}
    </button>
    <ul v-if="scope.isOpen" v-bind="scope.listboxProps">
      <li
        v-for="(option, index) in scope.filteredOptions"
        :key="option"
        v-bind="scope.getOptionProps(option, index)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</HeadlessCombobox>
