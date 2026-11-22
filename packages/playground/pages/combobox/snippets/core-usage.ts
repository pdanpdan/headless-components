import { createCombobox } from '@pdanpdan/headless-combobox-core';

const combobox = createCombobox({
  props: {
    modelValue: null,
    options: [ 'Vue', 'React', 'Svelte', 'Solid', 'Angular' ],
  },
  onChange: (value) => {
    console.log('selection', value);
  },
});

combobox.mount();
const state = combobox.getSnapshot();

state.open();
state.select('Vue');
state.close();

combobox.destroy();
