readonly value = signal<User | null>(null);

readonly combobox = injectCombobox({
  props: () => ({
    options: users,
    modelValue: this.value(),
    optionLabel: (user) => user.name,
  }),
  onChange: (next) => this.value.set(next as User | null),
});
