import type { AdapterId } from './adapter-examples';

export interface StructureTrees {
  popup: string;
  typeahead: string;
}

export const STRUCTURE_TREES: Record<AdapterId, StructureTrees> = {
  vue: {
    popup: `HeadlessCombobox (default slot scope)
└─ div :ref="setContainerRef"                       widget boundary (optional)
   ├─ button :ref="setTriggerRef"                   the trigger
   │  │        v-bind="triggerProps"
   │  └─ selected label
   ├─ ul :ref="setDropdownRef"                      the popup
   │  │      v-bind="listboxProps" :style="popupStyle"
   │  │      popover="manual"                       optional: native Popover API
   │  └─ li v-for="(option, i) in filteredOptions"
   │     └─ button :ref="setOptionRef(option, el)"  one option
   │             v-bind="getOptionProps(option, i)"
   └─ input :ref="setInputRef"                      search input (optional)
           v-bind="inputProps"`,
    typeahead: `HeadlessCombobox (default slot scope)
└─ div :ref="setContainerRef"                       widget boundary (optional)
   ├─ input :ref="(el) => { setTriggerRef(el); setInputRef(el) }"
   │  │       v-bind="comboboxInputProps"           the combobox input
   └─ ul :ref="setDropdownRef"                      the popup
      │      v-bind="listboxProps" :style="popupStyle"
      │      popover="manual"                       optional: native Popover API
      └─ li v-for="(option, i) in filteredOptions"
         └─ button :ref="setOptionRef(option, el)"  one option
                 v-bind="getOptionProps(option, i)"`,
  },
  react: {
    popup: `HeadlessCombobox (scope)
└─ div ref={scope.setContainerRef}                   widget boundary (optional)
   ├─ button ref={scope.setTriggerRef}                the trigger
   │  │        {...scope.triggerProps}
   │  └─ selected label
   ├─ div ref={scope.setDropdownRef}                  the popup
   │  │      style={scope.popupStyle} popover="manual"
   │  └─ ul {...scope.listboxProps}
   │     └─ scope.filteredOptions.map((option, i) => (
   │        <li {...scope.getOptionProps(option, i)}
   │            ref={(el) => scope.setOptionRef(option, el)} />))
   └─ input ref={scope.setInputRef}                    search input (optional)
           {...scope.inputProps}`,
    typeahead: `HeadlessCombobox (scope)
└─ div ref={scope.setContainerRef}                   widget boundary (optional)
   ├─ input ref={(el) => {
   │         scope.setTriggerRef(el);
   │         scope.setInputRef(el);
   │       }}
   │       {...scope.comboboxInputProps}  the combobox input
   └─ div ref={scope.setDropdownRef}                  the popup
      │      style={scope.popupStyle} popover="manual"
      └─ ul {...scope.listboxProps}
         └─ scope.filteredOptions.map((option, i) => (
            <li {...scope.getOptionProps(option, i)}
                ref={(el) => scope.setOptionRef(option, el)} />))`,
  },
  svelte: {
    popup: `HeadlessCombobox (scope)
└─ div {@attach scope.setContainerRef}               widget boundary (optional)
   ├─ button {@attach scope.setTriggerRef}            the trigger
   │  │      {...scope.triggerProps}
   │  └─ selected label
   ├─ div {@attach scope.setDropdownRef}              the popup
   │  │    popover="manual"                           optional: native Popover API
   │  └─ ul {...scope.listboxProps}
   │     └─ {#each scope.filteredOptions as option, i}
   │        <li {...scope.getOptionProps(option, i)}
   │            {@attach (el) => scope.setOptionRef(option, el)} />
   └─ input {@attach scope.setInputRef}               search input (optional)
           {...scope.inputProps}`,
    typeahead: `HeadlessCombobox (scope)
└─ div {@attach scope.setContainerRef}               widget boundary (optional)
   ├─ input {@attach (el) => {
   │         scope.setTriggerRef(el);
   │         scope.setInputRef(el);
   │       }}
   │       {...scope.comboboxInputProps}  the combobox input
   └─ div {@attach scope.setDropdownRef}              the popup
      │    popover="manual"
      └─ ul {...scope.listboxProps}
         └─ {#each scope.filteredOptions as option, i}
            <li {...scope.getOptionProps(option, i)}
                {@attach (el) => scope.setOptionRef(option, el)} />`,
  },
  solid: {
    popup: `HeadlessCombobox (scope)
└─ div ref={scope().setContainerRef}                 widget boundary (optional)
   ├─ button ref={scope().setTriggerRef}              the trigger
   │  │        {...scope().triggerProps}
   │  └─ selected label
   ├─ div ref={scope().setDropdownRef}                the popup
   │  │      style={scope().popupStyle} popover="manual"
   │  └─ ul {...scope().listboxProps}
   │     └─ <For each={scope().filteredOptions}>
   │        {(option, i) => <li {...scope().getOptionProps(option, i())}
   │          ref={(el) => scope().setOptionRef(option, el)} />}
   └─ input ref={scope().setInputRef}                 search input (optional)
           {...scope().inputProps}`,
    typeahead: `HeadlessCombobox (scope)
└─ div ref={scope().setContainerRef}                 widget boundary (optional)
   ├─ input ref={(el) => {
   │         scope().setTriggerRef(el);
   │         scope().setInputRef(el);
   │       }}
   │       {...scope().comboboxInputProps}  the combobox input
   └─ div ref={scope().setDropdownRef}                the popup
      │      style={scope().popupStyle} popover="manual"
      └─ ul {...scope().listboxProps}
         └─ <For each={scope().filteredOptions}>
            {(option, i) => <li {...scope().getOptionProps(option, i())}
              ref={(el) => scope().setOptionRef(option, el)} />}`,
  },
  angular: {
    popup: `HeadlessCombobox (store)
└─ div #container                                   widget boundary (optional)
   ├─ button #trigger                               the trigger
   │  │      role, aria-controls, aria-expanded, aria-haspopup,
   │  │      aria-activedescendant from s.triggerProps
   │  │      (click)="s.triggerProps.onClick()"
   │  │      (keydown)="s.triggerProps.onKeydown($event)"
   │  └─ selected label
   ├─ div popup                                     the popup
   │  │      @if (s.isOpen) { ... }
   │  └─ ul
   │     │      id, role, aria-multiselectable from s.listboxProps
   │     └─ @for (option of s.filteredOptions; track option; let i = $index) {
   │        li
   │           id, role, aria-selected, aria-disabled,
   │           aria-posinset, aria-setsize, data-highlighted
   │           from s.getOptionProps(option, i)
   │           (click)="s.getOptionProps(option, i).onClick()"
   │           (mousedown)="s.getOptionProps(option, i).onMousedown($event)"
   │           (mousemove)="s.getOptionProps(option, i).onMousemove()"
   │           (focus)="s.getOptionProps(option, i).onFocus()"
   │           (keydown)="s.getOptionProps(option, i).onKeydown($event)"
   └─ input #input                                  search input (optional)
           id, role, aria-autocomplete, aria-controls,
           aria-activedescendant from s.inputProps
           (input)="s.inputProps.onInput($event)"
           (keydown)="s.inputProps.onKeydown($event)"`,
    typeahead: `HeadlessCombobox (store)
└─ div #container                                   widget boundary (optional)
   ├─ input #input                                  the combobox input
   │  │      role, aria-autocomplete, aria-controls, aria-expanded,
   │  │      aria-haspopup, aria-activedescendant from s.comboboxInputProps
   │  │      (click)="s.comboboxInputProps.onClick()"
   │  │      (focus)="s.comboboxInputProps.onFocus()"
   │  │      (input)="s.comboboxInputProps.onInput($event)"
   │  │      (keydown)="s.comboboxInputProps.onKeydown($event)"
   └─ div popup                                     the popup
      │      @if (s.isOpen) { ... }
      └─ ul
         │      id, role, aria-multiselectable from s.listboxProps
         └─ @for (option of s.filteredOptions; track option; let i = $index) {
            li
               id, role, aria-selected, aria-disabled,
               aria-posinset, aria-setsize, data-highlighted
               from s.getOptionProps(option, i)
               (click)="s.getOptionProps(option, i).onClick()"
               (mousedown)="s.getOptionProps(option, i).onMousedown($event)"
               (mousemove)="s.getOptionProps(option, i).onMousemove()"
               (focus)="s.getOptionProps(option, i).onFocus()"
               (keydown)="s.getOptionProps(option, i).onKeydown($event)"`,

  },
};
