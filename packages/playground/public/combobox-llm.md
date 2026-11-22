# HeadlessCombobox reference for LLMs

This file is a self-contained reference for writing code with the HeadlessCombobox packages. It has one section per framework with its own install command and complete example, then the shared guides and the full prop, scope, validation, keyboard, and positioning reference.

HeadlessCombobox is a renderless combobox. The packages render no markup and ship no styles. Each package exposes one state machine that owns selection, filtering, validation, keyboard navigation, popup lifecycle, anchoring, and focus. You write the DOM and spread the provided prop bags onto it. Do not reimplement roles, ARIA attributes, or key handling by hand.

The same behavior is shared by all adapters. Only the binding syntax changes.

## Packages

| Package | Framework | Entry point | Peer dependency |
|---|---|---|---|
| `@pdanpdan/headless-combobox-core` | none | `createCombobox` | none |
| `@pdanpdan/headless-combobox-vue` | Vue 3 | `HeadlessCombobox`, `useHeadlessCombobox` | `vue@^3` |
| `@pdanpdan/headless-combobox-react` | React | `HeadlessCombobox`, `useHeadlessCombobox` | `react@>=18` |
| `@pdanpdan/headless-combobox-svelte` | Svelte 5 | `HeadlessCombobox.svelte`, `createComboboxStore` | `svelte@>=5` |
| `@pdanpdan/headless-combobox-solid` | Solid 2 | `HeadlessCombobox`, `useHeadlessCombobox` | `solid-js@>=2`, `@solidjs/web@>=2` |
| `@pdanpdan/headless-combobox-angular` | Angular | `injectCombobox`, `createComboboxStore` | `@angular/core@>=19` |

Install only the package for the framework you use. Each section below starts with its own install command and a complete example. The packages are independent; none of them requires the others at runtime beyond the core dependency that npm installs automatically.

The Vue, React, Svelte, and Solid adapters return prop bags ready for their binding syntax; spread them directly. Angular cannot spread objects, so bind each attribute and handler individually. When you use a raw core snapshot instead of an adapter, `toReactProps`, `toSvelteProps`, and `toSolidProps` apply the same mapping.

## Markup anatomy

A combobox is a combobox control plus a popup listbox. The control can be a button trigger with an optional search input inside the popup, or a single text input (typeahead, the APG editable pattern).

Each element receives exactly one prop bag. The bags contain ARIA attributes and the matching event handlers, so no manual `onClick`, `onKeydown`, or `aria-*` wiring is needed.

| Element | Bind | Wiring |
|---|---|---|
| root container, the click-outside and focus boundary | nothing | `setContainerRef` |
| button trigger | `triggerProps` | auto-discovered |
| popup listbox | `listboxProps`, `popupStyle` on the popup | auto-discovered |
| each option | `getOptionProps(option, index?)` | auto-discovered for rendered lists |
| search input inside the popup | `inputProps` | auto-discovered |
| typeahead input (the input is the combobox) | `comboboxInputProps` | auto-discovered |
| result-count live region (visually hidden) | `statusProps` | nothing |

Rules:

- Never put `triggerProps` and `comboboxInputProps` on the same element.
- Never replace a prop bag with hand-written `role`, `aria-expanded`, `aria-selected`, or key handlers. The prop bags do not set an accessible name: add `aria-label`, `aria-labelledby`, or a real `<label>` yourself.
- `comboboxInputProps` includes a Space-safe keydown handler: arrows, Enter, and Escape navigate, while Space types a space. Do not add another keydown handler. Angular cannot spread a bag; bind `comboboxInputProps.onKeydown` individually, or `handleTypeaheadKeydown` when wiring the element by hand.
- The option index is optional. When you pass one, it must be the option's position in the flat `filteredOptions` array, not its rendered position. Omit it in grouped or virtualized lists and the core derives that position.
- `setContainerRef` is the only ref needed for standard markup: it auto-discovers the trigger, typeahead/search input, listbox, and dropdown, including a listbox linked by `aria-controls` outside the container. Explicit `setTriggerRef`, `setInputRef`, `setListRef`, and `setDropdownRef` override discovery. `setOptionRef` is only needed for virtualized windows where the highlighted option may not match a rendered `aria-posinset`.
- Stored object values are compared by proxy-unwrapped identity. When a framework proxies or clones them so identity no longer matches, pass `valueEqual` (for example `(a, b) => a.id === b.id`).
- The root component renders nothing on its own. It only renders the markup you pass to it.
- The packages ship no styles. A working page still needs a visible trigger, a popup with a background and border or shadow, and a distinct state for the highlighted and selected options.

## Vue 3

```bash
pnpm add @pdanpdan/headless-combobox-vue
```

```vue
<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref } from 'vue';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

const selected = ref<User | null>(null);
</script>

<template>
  <HeadlessCombobox
    v-slot="scope"
    v-model="selected"
    :options="users"
    :option-label="(user) => user.name"
  >
    <div :ref="scope.setContainerRef">
      <button
        :ref="scope.setTriggerRef"
        v-bind="scope.triggerProps"
        type="button"
      >
        {{ selected?.name ?? 'Select…' }}
      </button>

      <ul
        v-if="scope.isOpen"
        :ref="scope.setDropdownRef"
        v-bind="scope.listboxProps"
      >
        <li
          v-for="(user, index) in scope.filteredOptions"
          :key="user.id"
          :ref="(el) => scope.setOptionRef(user, el)"
          v-bind="scope.getOptionProps(user, index)"
        >
          {{ user.name }}
        </li>
      </ul>
    </div>
  </HeadlessCombobox>
</template>
```

Without `v-model` the component keeps the selection internally. The component emits `update:modelValue` on every change; `v-model` writes it back.

The same state machine is available as a composable when the markup is not inside the slot:

```ts
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref } from 'vue';

const selected = ref<User | null>(null);

const {
  isOpen, filteredOptions, triggerProps, listboxProps, getOptionProps,
  select, setContainerRef, setTriggerRef, setOptionRef,
} = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options: users,
    optionLabel: (user) => user.name,
  },
  (value) => {
    selected.value = value as User | null;
  },
);
```

Props accept plain values, refs, or a getter. The second argument receives every `update:modelValue` payload.

## React

```bash
pnpm add @pdanpdan/headless-combobox-react
```

```tsx
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

export function UserPicker() {
  const [value, setValue] = useState<User | null>(null);

  return (
    <HeadlessCombobox
      options={users}
      optionLabel={(user) => user.name}
      value={value}
      onChange={(next) => setValue(next as User | null)}
    >
      {(scope) => (
        <div ref={scope.setContainerRef}>
          <button
            ref={scope.setTriggerRef}
            type="button"
            {...scope.triggerProps}
          >
            {value?.name ?? 'Select…'}
          </button>

          {scope.isOpen && (
            <ul {...scope.listboxProps}>
              {scope.filteredOptions.map((user, index) => (
                <li
                  key={user.id}
                  ref={(el) => scope.setOptionRef(user, el)}
                  {...scope.getOptionProps(user, index)}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </HeadlessCombobox>
  );
}
```

`useHeadlessCombobox(options)` returns the same scope object without the render prop. Controlled usage means passing `value`; omit `value` and pass `defaultValue` for uncontrolled usage. The adapter returns React-ready prop bags, so spread them directly. For a raw core snapshot, `toReactProps` maps `autocomplete` to `autoComplete` and the event handlers to React names.

## Svelte 5

```bash
pnpm add @pdanpdan/headless-combobox-svelte
```

```svelte
<script lang="ts">
  import HeadlessCombobox from '@pdanpdan/headless-combobox-svelte/HeadlessCombobox.svelte';

  interface User {
    id: number;
    name: string;
  }

  const users: User[] = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
  ];

  let value = $state.raw<User | null>(null);
</script>

<HeadlessCombobox
  options={users}
  optionLabel={(user: User) => user.name}
  modelValue={value}
  onChange={(next) => (value = next as User | null)}
>
  {#snippet children(scope)}
    <div
      {@attach (el) => {
        scope.setContainerRef(el);
        return () => scope.setContainerRef(null);
      }}
    >
      <button
        type="button"
        {...scope.triggerProps}
        {@attach (el) => {
          scope.setTriggerRef(el);
          return () => scope.setTriggerRef(null);
        }}
      >
        {value?.name ?? 'Select…'}
      </button>

      {#if scope.isOpen}
        <ul {...scope.listboxProps}>
          {#each scope.filteredOptions as option, index ((option as User).id)}
            {@const user = option as User}
            <li
              {...scope.getOptionProps(user, index)}
              {@attach (el) => {
                scope.setOptionRef(user, el);
                return () => scope.setOptionRef(user, null);
              }}
            >
              {user.name}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/snippet}
</HeadlessCombobox>
```

Omit `onChange` to keep the selection inside the component. `createComboboxStore({ props, onChange })` returns a Svelte store: `$combobox` is the live snapshot with Svelte-ready prop bags. Call `store.mount()` and `store.destroy()` yourself when using the store directly. For a raw core snapshot, `toSvelteProps` maps the handlers to Svelte 5 event attributes.

Two Svelte rules that the type checker and the runtime enforce:

- The component does not infer the option type. Annotate callback parameters (`optionLabel={(user: User) => user.name}`) and cast slot options (`{@const user = option as User}`), because the snippet scope is `unknown`.
- `$state` wraps objects and arrays in deep proxies. The default comparison is proxy-unwrapped identity, so a proxied value may not equal the option object. Use `$state.raw` for object values, `optionValue` for primitives, or pass `valueEqual` (for example `(a, b) => a.id === b.id`) to compare by ID.

Svelte's `style` attribute does not accept the `popupStyle` object. Either turn it into a style string, or skip anchor positioning and position the popup with CSS (the examples use `position: absolute` under a `position: relative` container).

## Solid

```bash
pnpm add @pdanpdan/headless-combobox-solid
```

```tsx
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-solid';
import { For, createSignal } from 'solid-js';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

export function UserPicker() {
  const [value, setValue] = createSignal<User | null>(null);

  return (
    <HeadlessCombobox
      options={users}
      optionLabel={(user) => user.name}
      value={value()}
      onChange={(next) => setValue(next as User | null)}
    >
      {(scope) => (
        <div ref={scope().setContainerRef}>
          <button ref={scope().setTriggerRef} {...scope().triggerProps}>
            {value()?.name ?? 'Select…'}
          </button>

          {scope().isOpen && (
            <ul {...scope().listboxProps}>
              <For each={scope().filteredOptions}>
                {(user, index) => (
                  <li
                    ref={(el) => scope().setOptionRef(user, el)}
                    {...scope().getOptionProps(user, index())}
                  >
                    {user.name}
                  </li>
                )}
              </For>
            </ul>
          )}
        </div>
      )}
    </HeadlessCombobox>
  );
}
```

The render prop receives an accessor. Call `scope()` inside JSX every time, because Solid components run once and that is what keeps the bindings reactive. `useHeadlessCombobox(() => options)` returns the same accessor without the component. Controlled usage means passing `value`; use `defaultValue` for uncontrolled usage.

Solid re-creates a conditionally rendered popup subtree whenever the snapshot changes. That is harmless for options, but a search input inside the popup loses focus after the first keystroke. When the popup contains a focusable control, render it once with `popover="manual"` and let the core drive `showPopover()` / `hidePopover()` instead of wrapping it in `isOpen && …` or `<Show>`. Popups without inputs can stay conditional.

## Angular

```bash
pnpm add @pdanpdan/headless-combobox-angular
```

Angular templates cannot spread a prop object. Bind the attributes and handlers from `combobox.snapshot()` individually, and attach the element refs with `viewChild` plus an `effect`.

```ts
import { Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import { injectCombobox } from '@pdanpdan/headless-combobox-angular';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];

@Component({
  standalone: true,
  selector: 'app-user-picker',
  template: `
    @let s = combobox.snapshot();

    <div #container>
      <button
        #trigger
        type="button"
        role="combobox"
        [attr.aria-controls]="s.triggerProps['aria-controls']"
        [attr.aria-expanded]="s.triggerProps['aria-expanded']"
        [attr.aria-haspopup]="s.triggerProps['aria-haspopup']"
        [attr.aria-activedescendant]="s.triggerProps['aria-activedescendant']"
        [attr.aria-disabled]="s.triggerProps['aria-disabled'] || null"
        [attr.aria-readonly]="s.triggerProps['aria-readonly'] || null"
        [disabled]="s.triggerProps.disabled ?? false"
        (click)="s.triggerProps.onClick()"
        (keydown)="s.triggerProps.onKeydown($event)"
      >
        {{ value()?.name ?? 'Select…' }}
      </button>

      @if (s.isOpen) {
        <ul
          #list
          role="listbox"
          [attr.id]="s.listboxProps.id"
          [attr.aria-multiselectable]="s.listboxProps['aria-multiselectable'] || null"
        >
          @for (user of s.filteredOptions; track user.id; let i = $index) {
            @let o = s.getOptionProps(user, i);
            <li
              [attr.id]="o.id"
              role="option"
              [attr.aria-selected]="o['aria-selected']"
              [attr.aria-disabled]="o['aria-disabled'] || null"
              [attr.aria-posinset]="o['aria-posinset']"
              [attr.aria-setsize]="o['aria-setsize']"
              [attr.data-highlighted]="o['data-highlighted'] || null"
              (click)="o.onClick()"
              (mousedown)="o.onMousedown($event)"
              (mouseenter)="o.onMousemove()"
              (focus)="o.onFocus()"
              (keydown)="o.onKeydown($event)"
            >
              {{ user.name }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class UserPickerComponent {
  readonly value = signal<User | null>(null);

  readonly container = viewChild<ElementRef<HTMLElement>>('container');
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly list = viewChild<ElementRef<HTMLElement>>('list');

  readonly combobox = injectCombobox<User, User>({
    props: () => ({
      modelValue: this.value(),
      options: users,
      optionLabel: (user) => user.name,
    }),
    onChange: (next) => this.value.set(next as User | null),
  });

  constructor() {
    effect(() => {
      const snapshot = this.combobox.snapshot();
      snapshot.setContainerRef(this.container()?.nativeElement ?? null);
      snapshot.setTriggerRef(this.trigger()?.nativeElement ?? null);
      snapshot.setDropdownRef(this.list()?.nativeElement ?? null);
      snapshot.setListRef(this.list()?.nativeElement ?? null);
    });
  }
}
```

Call `injectCombobox` from an injection context, such as a field initializer or the constructor. It registers teardown with `DestroyRef`. `combobox.snapshot()` is a read-only signal. Push new props with `combobox.setProps(...)`, or pass a props getter as shown above. `createComboboxStore(options)` is the non-DI factory when you manage the lifetime yourself, and it accepts an extra `injector` for `afterNextRender` ticking outside an injection context.

## Core (no framework)

```bash
pnpm add @pdanpdan/headless-combobox-core
```

Use the core directly only when you write an adapter. Create the store, push props with `setProps`, call `mount()` once the DOM exists, and `destroy()` on teardown.

```ts
import { createCombobox } from '@pdanpdan/headless-combobox-core';

const combobox = createCombobox({
  props: {
    modelValue: null,
    options: ['Vue', 'React', 'Svelte'],
  },
  onChange: (value) => console.log('selection', value),
});

combobox.mount();
const scope = combobox.getSnapshot();
scope.open();
scope.select('Vue');
scope.close();
combobox.destroy();
```

`createCombobox` also accepts a `runtime` object with `nextTick`, `unwrap`, `createId`, and `getDocument`. Adapters use it to wait for a framework render, strip proxies before identity checks, and use the framework's id generator.

## Guides for common usage

Each guide starts from the Vue example above and changes one thing. Runnable versions of these scenarios live in `packages/headless-combobox-vue/examples/`.

To port a guide to another adapter, keep the same props, scope fields, and prop bags. Change only the binding syntax: spread the bags directly in Vue, React, Svelte, and Solid; bind individual attributes in Angular, which cannot spread. Solid also needs `scope()` calls inside JSX.

### Typeahead (editable combobox)

In the typeahead pattern the text input itself is the combobox. It receives `comboboxInputProps` plus `setTriggerRef` and `setInputRef`. The input stays mounted; the popup opens below it.

```vue
<HeadlessCombobox v-slot="scope" v-model="selected" :options="languages">
  <div :ref="scope.setContainerRef">
    <input
      :ref="(el) => { scope.setTriggerRef(el); scope.setInputRef(el); }"
      v-bind="scope.comboboxInputProps"
      :value="scope.searchQuery ?? selected ?? ''"
      type="text"
      placeholder="Search…"
    />

    <ul v-if="scope.isOpen" :ref="scope.setDropdownRef" v-bind="scope.listboxProps">
      <li
        v-for="(language, index) in scope.filteredOptions"
        :key="language"
        :ref="(el) => scope.setOptionRef(language, el)"
        v-bind="scope.getOptionProps(language, index)"
      >
        {{ language }}
      </li>
    </ul>
  </div>
</HeadlessCombobox>
```

The input also needs `setTriggerRef` and `setInputRef` (shown above for Vue). Keyboard navigation comes from `comboboxInputProps`; no extra handler is needed. Angular cannot spread a bag, so it binds the same behavior directly:

```html
<input
  role="combobox"
  aria-label="Search users"
  [attr.aria-controls]="s.comboboxInputProps['aria-controls']"
  [attr.aria-expanded]="s.comboboxInputProps['aria-expanded']"
  [attr.aria-haspopup]="s.comboboxInputProps['aria-haspopup']"
  [attr.aria-activedescendant]="s.comboboxInputProps['aria-activedescendant']"
  [value]="s.searchQuery ?? value()?.name ?? ''"
  (click)="s.comboboxInputProps.onClick()"
  (focus)="s.comboboxInputProps.onFocus()"
  (input)="s.comboboxInputProps.onInput($event)"
  (keydown)="s.comboboxInputProps.onKeydown($event)"
/>
```

`comboboxInputProps.onKeydown` is the Space-safe variant: Space inserts a space, while the regular keyboard matrix handles arrows, Enter, and Escape. Bind `handleTypeaheadKeydown` when you construct the input without the bag and need the same behavior.

The input value follows `searchQuery` while the popup is open and falls back to the selected label. `inputOnOpen` controls what happens to the text when the popup opens:

- `select` (default): keep the current value and select the text, so typing replaces it.
- `keep`: keep the current value without selecting it.
- `clear`: open with an empty input.

### Single select, plain strings

```vue
<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref } from 'vue';

const frameworks = ['Vue', 'React', 'Svelte', 'Solid', 'Angular'];
const selected = ref<string | null>(null);
</script>

<template>
  <HeadlessCombobox v-slot="scope" v-model="selected" :options="frameworks">
    <div :ref="scope.setContainerRef">
      <button :ref="scope.setTriggerRef" v-bind="scope.triggerProps" type="button">
        {{ selected ?? 'Select a framework…' }}
      </button>

      <ul v-if="scope.isOpen" :ref="scope.setDropdownRef" v-bind="scope.listboxProps">
        <li
          v-for="(item, index) in scope.filteredOptions"
          :key="item"
          :ref="(el) => scope.setOptionRef(item, el)"
          v-bind="scope.getOptionProps(item, index)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </HeadlessCombobox>
</template>
```

`getOptionProps` already selects on click, highlights on hover and focus, and marks the option selected. Without `v-model`, the selection stays inside the component.

### Object options with a label

Pass objects and map the label. The model holds the whole option.

```vue
<HeadlessCombobox
  v-slot="scope"
  v-model="selected"
  :options="users"
  :option-label="(user: User) => user.name"
>
  …
  <button :ref="scope.setTriggerRef" v-bind="scope.triggerProps" type="button">
    {{ selected?.name ?? 'Select a user…' }}
  </button>
  …
  <li v-for="(user, index) in scope.filteredOptions" :key="user.id" …>
    {{ user.name }}
  </li>
</HeadlessCombobox>
```

`optionLabel` drives the default filter. `optionFilter` replaces the filter with your own predicate. Use `isSelected(user)` for styling, not `selected === user`, because Vue wraps stored objects in reactive proxies.

### Store a value, show a label

`optionValue` separates what the model stores from the option object.

```ts
interface Framework {
  label: string;
  value: number;
}

const frameworks: Framework[] = [
  { label: 'Vue', value: 1 },
  { label: 'React', value: 2 },
];

const selected = ref<number | null>(1);
const selectedLabel = computed(
  () => frameworks.find((item) => item.value === selected.value)?.label ?? 'Select…',
);
```

```vue
<HeadlessCombobox
  v-slot="scope"
  v-model="selected"
  :options="frameworks"
  :option-label="(item: Framework) => item.label"
  :option-value="(item: Framework) => item.value"
>
  …
  <button :ref="scope.setTriggerRef" v-bind="scope.triggerProps" type="button">
    {{ selectedLabel }}
  </button>
  …
</HeadlessCombobox>
```

The model and every change event carry the value. `getOptionProps` still receives the full option, and `selectedList` contains values.

### Search input inside the popup

A button trigger keeps the popup, but the popup gets a filter input. This is the pattern for long option lists without an editable control.

```vue
<div v-if="scope.isOpen" :ref="scope.setDropdownRef">
  <div>
    <input
      :ref="scope.setInputRef"
      v-bind="scope.inputProps"
      :value="scope.searchQuery"
      type="text"
      placeholder="Search…"
    />
    <button type="button" @click="scope.setSearchQuery(undefined)">
      Reset search
    </button>
  </div>

  <ul :ref="scope.setListRef" v-bind="scope.listboxProps">
    <li
      v-for="(item, index) in scope.filteredOptions"
      :key="item"
      :ref="(el) => scope.setOptionRef(item, el)"
      v-bind="scope.getOptionProps(item, index)"
    >
      {{ item }}
    </li>
    <li v-if="scope.filteredOptions.length === 0" role="presentation">
      No matches.
    </li>
  </ul>
</div>
```

`inputProps` makes the input a `searchbox` and keeps the trigger focused. `searchQuery` is `undefined` while closed. Reset it with `setSearchQuery(undefined)`. Use `optionFilter(option, query)` for matching rules other than a case-insensitive substring.

### Multiple selection with chips

```vue
<HeadlessCombobox
  v-slot="scope"
  v-model="selected"
  :options="frameworks"
  multiple
  :max-length="3"
>
  <div :ref="scope.setContainerRef">
    <div v-if="selected.length">
      <span v-for="item in selected" :key="item">
        {{ item }}
        <button
          type="button"
          :aria-label="`Remove ${item}`"
          @click="scope.select(item)"
        >×</button>
      </span>
    </div>

    <button :ref="scope.setTriggerRef" v-bind="scope.triggerProps" type="button">
      {{ selected.length ? `${selected.length} selected` : 'Select…' }}
    </button>

    <ul v-if="scope.isOpen" :ref="scope.setDropdownRef" v-bind="scope.listboxProps">
      <li v-for="(item, index) in scope.filteredOptions" :key="item">
        <button
          type="button"
          :ref="(el) => scope.setOptionRef(item, el)"
          v-bind="scope.getOptionProps(item, index)"
          :disabled="!scope.canSelectMore && !scope.isSelected(item)"
        >
          {{ item }}
        </button>
      </li>
    </ul>
  </div>
</HeadlessCombobox>
```

Bind an array with `multiple`. `select(option)` toggles membership, so the chip remove button calls the same method. `closeOnSelect` defaults to `false` in multiple mode. `canSelectMore` turns false at `maxLength`, and `select` ignores additions beyond it while removal still works. `clear()` empties the array.

Chips rendered outside the trigger must stay inside the element that carries `setContainerRef`, otherwise clicking them counts as an outside click. Chips rendered inside the trigger stay non-interactive spans: a button cannot contain another button.

### Validation

```vue
<HeadlessCombobox
  v-slot="scope"
  v-model="selected"
  :options="users"
  multiple
  required
  :min-length="2"
  :max-length="4"
  :error-messages="{ minlength: 'Pick at least two reviewers.' }"
>
  <fieldset :ref="scope.setContainerRef">
    <button
      :ref="scope.setTriggerRef"
      v-bind="scope.triggerProps"
      type="button"
      :class="{ 'is-invalid': !scope.valid }"
    >
      {{ scope.selectedCount ? `${scope.selectedCount} selected` : 'Select reviewers…' }}
    </button>
    <p v-if="!scope.valid" role="alert">{{ scope.validationMessage }}</p>
  </fieldset>
  …
</HeadlessCombobox>
```

`required` means a value in single mode and at least one in multiple mode. `errors` holds the active codes (`required`, `minlength`, `maxlength`) for custom rendering; `validationMessage` is the first message. Validation is presentational: pair it with your form library if the form must block submit.

### Custom option content

```vue
<button
  v-bind="scope.getOptionProps(user, index)"
  :class="{
    'is-selected': scope.isSelected(user),
    'is-active': index === scope.highlightedIndex,
  }"
  :disabled="!scope.canSelectMore && !scope.isSelected(user)"
>
  <img :src="user.avatar" alt="" />
  <span>{{ user.name }}</span>
  <span class="muted">{{ user.role }}</span>
  <span v-if="scope.isSelected(user)" aria-hidden="true">✓</span>
</button>
```

Options accept any markup: avatars, secondary text, badges, check indicators. Keep `role`, `aria-selected`, and the handlers from `getOptionProps`. The bag also sets `data-highlighted` for CSS. Do not nest interactive controls inside an option; render spans and style them instead.

The same applies to the trigger label: chips, counts, and icons are spans inside the trigger button.

### Cover the trigger with the selected option

`alignSelected` shifts the popup so the selected option lands over the trigger, which is the common picker look.

```vue
<HeadlessCombobox v-slot="scope" v-model="selected" :options="users" align-selected>
  …
  <ul
    v-if="scope.isOpen"
    :ref="scope.setDropdownRef"
    v-bind="scope.listboxProps"
    :style="[scope.popupStyle, {
      left: 'calc(anchor(left) - 0.5rem)',
      width: 'calc(anchor-size(width) + 1rem)',
    }]"
  >
    <li v-for="(user, index) in scope.filteredOptions" :key="user.id">
      <button
        :ref="(el) => scope.setOptionRef(user, el)"
        v-bind="scope.getOptionProps(user, index)"
      >
        {{ user.name }}
      </button>
    </li>
  </ul>
</HeadlessCombobox>
```

`popupStyle` carries a `translate` that shifts the popup by `alignmentOffset`. It needs `setDropdownRef` and `setOptionRef` on every option to measure. Adjust the popup padding so the option content box lines up with the trigger content box; the extra `0.5rem` above is that padding plus border.

### Select on Tab

```vue
<HeadlessCombobox … select-on-tab>
```

With `selectOnTab`, pressing Tab while an option is highlighted selects it and closes the popup. Pressing Tab with nothing highlighted leaves the selection alone and moves focus. Use it for keyboard-first forms where Tab should commit the highlighted choice instead of skipping it.

### Uncontrolled selection

- Vue: omit `v-model`. The component keeps the selection internally.
- React: omit `value` and pass `defaultValue`.
- Svelte: omit `onChange`. The component keeps the selection internally.
- Solid: omit `value` and pass `defaultValue`.
- Angular: there is no internal mode. Keep the value signal and pass it through `props.modelValue`.

`onChange` still reports every selection in React, Solid, and Angular when the value is not controlled. Use it for notifications, for example to fetch dependent data.

### Grouped options

The option list stays flat in `filteredOptions`; grouping is markup. Wrap each group in `role="group"` with an accessible label, and call `getOptionProps(option)` without an index so the core finds the option's position in the flat list.

```vue
<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref, useId } from 'vue';

const categories: Record<string, string[]> = {
  Frontend: ['Vue', 'React', 'Svelte'],
  Backend: ['Rust', 'Go', 'Python'],
};
const options = Object.values(categories).flat();
const selected = ref<string | null>(null);
const labelId = useId();

function groups(visible: string[]) {
  return Object.entries(categories)
    .map(([ label, items ]) => ({
      label,
      items: items.filter((item) => visible.includes(item)),
    }))
    .filter((group) => group.items.length > 0);
}
</script>

<template>
  <HeadlessCombobox v-slot="scope" v-model="selected" :options="options">
    <div :ref="scope.setContainerRef">
      <button
        :ref="scope.setTriggerRef"
        v-bind="scope.triggerProps"
        :aria-labelledby="labelId"
        type="button"
      >
        {{ selected ?? 'Select…' }}
      </button>

      <ul
        v-if="scope.isOpen"
        :ref="(el) => { scope.setDropdownRef(el); scope.setListRef(el); }"
        v-bind="scope.listboxProps"
      >
        <li
          v-for="group in groups(scope.filteredOptions)"
          :key="group.label"
          role="group"
          :aria-labelledby="`${ labelId }-${ group.label }`"
        >
          <span :id="`${ labelId }-${ group.label }`">{{ group.label }}</span>
          <button
            v-for="option in group.items"
            :key="option"
            :ref="(el) => scope.setOptionRef(option, el)"
            v-bind="scope.getOptionProps(option)"
            type="button"
          >
            {{ option }}
          </button>
        </li>
      </ul>
    </div>
  </HeadlessCombobox>
</template>
```

Render groups in the same order as the flat `options` array; arrow keys, paging, and `aria-activedescendant` follow that order. Group headers are not options: give them `role="presentation"` or no role, never `role="option"`.

### Creatable values (free solo)

Set `creatable` and supply `createOption`, which turns the typed query into the value stored in the model. The create affordance is yours to render; call `createSelection()` from it.

```vue
<HeadlessCombobox
  v-slot="scope"
  v-model="selected"
  :options="languages"
  creatable
  :create-option="(query) => query"
>
  <div :ref="scope.setContainerRef">
    <input
      :ref="(el) => { scope.setTriggerRef(el); scope.setInputRef(el); }"
      v-bind="scope.comboboxInputProps"
      :value="scope.searchQuery ?? selected ?? ''"
      type="text"
    />

    <div v-if="scope.isOpen" :ref="scope.setDropdownRef">
      <ul :ref="scope.setListRef" v-bind="scope.listboxProps">
        <li
          v-for="option in scope.filteredOptions"
          :key="option"
          :ref="(el) => scope.setOptionRef(option, el)"
          v-bind="scope.getOptionProps(option)"
        >
          {{ option }}
        </li>
      </ul>
      <button v-if="scope.canCreate" type="button" @click="scope.createSelection()">
        Create "{{ scope.searchQuery }}"
      </button>
    </div>
  </div>
</HeadlessCombobox>
```

- Enter creates when no option is highlighted and `canCreate` is true.
- `canCreate` is false for an empty query, an exact existing label, a locked control, and a reached `maxLength`.
- `createOption` returns the stored value (`V`, not the option). The created value is not added to `options` automatically; add it in your change handler if it should appear in the list or resolve a label for a chip.
- The query clears after a successful create, so the next keystroke starts a new search.

### Async remote search

The core does not fetch or debounce. Keep `optionFilter: () => true` so the core does not filter the server results again, replace `options` with each response, and drop stale responses yourself.

```vue
<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref, watch } from 'vue';

const selected = ref<User | null>(null);
const options = ref<User[]>([]);
let latest = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

const scope = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options,
    optionLabel: (user) => user.name,
    optionFilter: () => true,
  },
  (value) => {
    selected.value = value as User | null;
  },
);

watch(scope.searchQuery, (query) => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const request = ++latest;
    const response = await fetch(`/api/users?q=${ encodeURIComponent(query ?? '')}`);
    const data = await response.json();
    if (request === latest) {
      options.value = data;
    }
  }, 250);
});
</script>
```

Loading and error states are yours: the core only exposes `filteredOptions`, `searchQuery`, and the result-count announcement.

### Virtualized lists

Render only the visible window of `filteredOptions`, call `getOptionProps(option)` without an index, and keep `setListRef` on the scroll container. Each option carries `aria-posinset` and `aria-setsize` for the flat list, so screen readers stay oriented even when the DOM holds a subset.

`highlightedIndex` can point at an option that is not rendered. When it does, scroll your virtualizer so that option is rendered; the core's scroll-into-view only scrolls elements that exist. `alignSelected` has the same constraint: it uses `setOptionRef` on the selected option.

### Result announcements

Render the live region once, outside any conditional, and bind the bag:

```vue
<p v-bind="scope.statusProps" class="sr-only">{{ scope.statusMessage }}</p>
```

While the popup is open the message is `"3 results available."`, `"1 result available."`, or `"No results found."`; it is empty while closed. The element must be present before the text changes, which is why it is not behind `v-if`.

### Programmatic control

Actions are plain functions, so they can be called from buttons, effects, watchers, or timers. The composable is the simplest way to reach them from outside the markup.

```vue
<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox-vue';
import { ref } from 'vue';

const selected = ref<User | null>(null);

const { open, close, select, clear } = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options: users,
    optionLabel: (user) => user.name,
    clickOutsideFilter: (target) =>
      !(target instanceof HTMLElement && target.closest('.controls')),
  },
  (next) => {
    selected.value = next as User | null;
  },
);
</script>

<template>
  <div class="controls">
    <button type="button" @click="open()">Open</button>
    <button type="button" @click="close()">Close</button>
    <button type="button" @click="select(users[1]!)">Select the second user</button>
    <button type="button" @click="clear()">Clear</button>
  </div>
</template>
```

`clickOutsideFilter` keeps the popup open when the click lands in the control panel. `setContainerRef` covers the standard wiring: it discovers the trigger, input, listbox, and dropdown. Explicit refs are only needed for virtualized options or a custom boundary. Closing or selecting from an external control leaves focus on that control; focus returns to the trigger only when focus is already inside the widget.

## Props

These props are shared by every adapter.

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `O[]` | required | The option list. |
| `multiple` | `boolean` | `false` | Multiple selection. `modelValue` becomes an array. |
| `minLength` | `number` | none | Multiple: minimum number of selected options. |
| `maxLength` | `number` | none | Multiple: maximum number of selected options. Adding beyond it is blocked. |
| `required` | `boolean` | `false` | Require a selection. |
| `disabled` | `boolean` | `false` | Not focusable, cannot open or change. |
| `readonly` | `boolean` | `false` | Focusable and shows the value, but cannot open or change. |
| `closeOnSelect` | `boolean \| null` | `!multiple` | Close the popup after selecting. |
| `closeOnClickOutside` | `boolean` | `true` | Close when clicking outside the widget boundary. |
| `clickOutsideFilter` | `(target: EventTarget \| null) => boolean` | none | Return `false` to keep the popup open for specific outside targets. |
| `selectOnTab` | `boolean` | `false` | On Tab, when focus leaves the widget, select the highlighted option and close. |
| `optionValue` | `(option: O) => V` | the option itself | Maps an option to the stored and emitted value. |
| `valueEqual` | `(a: V, b: V) => boolean` | proxy-unwrapped identity | Compare stored values by ID or another stable key when the framework proxies or clones objects. |
| `optionLabel` | `(option: O) => string` | `String(option)` | Maps an option to a string for default filtering. |
| `optionFilter` | `(option: O, query: Q) => boolean` | case-insensitive substring | Custom filter. `Q` defaults to `string`. |
| `id` | `string` | generated | Base id for accessibility attributes. |
| `alignSelected` | `boolean` | `false` | Align the popup so the selected option covers the trigger. |
| `inputOnOpen` | `'select' \| 'keep' \| 'clear'` | `'select'` | Typeahead input text when the popup opens. |
| `errorMessages` | `Partial<Record<HeadlessComboboxErrorCode, string>>` | none | Override the default validation messages. |
| `creatable` | `boolean` | `false` | Offer to commit the typed query as a new value when no option matches. |
| `createOption` | `(query: Q) => V \| null \| undefined` | none | Builds the stored value for the query. Required for `creatable`. |

### Value binding per adapter

| Adapter | Controlled input | Change callback | Uncontrolled |
|---|---|---|---|
| Vue | `v-model` or `modelValue` | `update:modelValue` event | omit `v-model` |
| React | `value` | `onChange` | omit `value`, pass `defaultValue` |
| Svelte | `modelValue` | `onChange` | omit `onChange` |
| Solid | `value` | `onChange` | omit `value`, pass `defaultValue` |
| Angular | `props.modelValue` | `onChange` option | always controlled |

React and Solid detect controlled mode from the presence of the `value` key. Passing `value={undefined}` still counts as controlled.

## Scope and snapshot

Every adapter exposes the same snapshot fields. Vue exposes them as slot props (refs for state, plain functions for everything else). React returns the object. Svelte exposes them through `$combobox`. Solid returns an accessor. Angular exposes them through `combobox.snapshot()`.

### State

| Field | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Whether the popup is open. |
| `multiple` | `boolean` | Whether multiple selection is enabled. |
| `disabled` | `boolean` | Whether the control is disabled. |
| `readonly` | `boolean` | Whether the control is read-only. |
| `searchQuery` | `Q \| undefined` | Current search query. |
| `filteredOptions` | `O[]` | Options after filtering. |
| `highlightedIndex` | `number` | Highlighted option index, `-1` when none. |
| `alignmentOffset` | `number` | Pixel offset used for alignment. |
| `cssAnchorName` | `string` | Unique CSS `anchor-name` for popup positioning. |
| `popupStyle` | `HeadlessComboboxPopupStyle` | Ready-to-apply popup positioning style. |
| `selectedCount` | `number` | Number of selected options. |
| `selectedList` | `V[]` | Selected values. Single mode returns a single-element array. |
| `canSelectMore` | `boolean` | `false` when `maxLength` is reached. |
| `isSelected` | `(option: O) => boolean` | Selection check using `valueEqual` when provided. |
| `canCreate` | `boolean` | `true` when the query can be committed as a new value. |
| `valid` | `boolean` | Whether the current selection passes validation. |
| `errors` | `HeadlessComboboxErrorCode[]` | Active error codes. |
| `validationMessage` | `string` | Message for the first error. |
| `statusMessage` | `string` | Filtered result count while open, empty while closed. |

Use `isSelected(option)` instead of comparing `modelValue` to the option. Vue refs deep-convert object values into reactive proxies, so `===` checks against your original objects can fail.

### ARIA prop bags

| Bag | Element | Contents |
|---|---|---|
| `triggerProps` | button trigger | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-activedescendant`, `aria-disabled`, `aria-readonly`, `disabled`, click toggles, keydown handles |
| `inputProps` | search input inside the popup | `role="searchbox"`, native autocomplete off, `aria-autocomplete`, `aria-controls`, `aria-activedescendant`, input and keydown handlers |
| `comboboxInputProps` | typeahead input | `role="combobox"`, native autocomplete off, `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-activedescendant`, disabled and readonly attributes, open, focus, input, and Space-safe keydown handlers |
| `listboxProps` | popup list | `role="listbox"`, `aria-multiselectable` |
| `statusProps` | status message element | `role="status"`, `aria-live="polite"`, `aria-atomic` |
| `getOptionProps(option, index?)` | each option | `role="option"`, `aria-selected`, `aria-disabled`, `aria-posinset`, `aria-setsize`, `data-highlighted`, select and highlight handlers |

Each bag already includes its interaction handlers. Spreading the bag is the only wiring an element needs.

### Actions

| Method | Signature | Description |
|---|---|---|
| `toggle` | `() => void` | Toggle the popup. |
| `open` | `() => Promise<void>` | Open the popup. |
| `close` | `(returnFocus?: boolean) => void` | Close the popup. Focus returns to the trigger only when focus is already inside the widget, so an external control stays focused. |
| `select` | `(option: O) => void` | Select in single mode, toggle in multiple mode. |
| `createSelection` | `() => void` | Commit the typed query. No-op unless `canCreate`. |
| `clear` | `() => void` | Clear the selection. |
| `setSearchQuery` | `(value: Q \| undefined) => void` | Set the query. |
| `setHighlightedIndex` | `(index: number) => void` | Set the highlighted option. Wire it to hover to match keyboard behavior. |
| `focusInput` | `() => void` | Focus the filter input while the popup stays open. |
| `handleKeydown` | `(event: KeyboardEvent) => void` | Keyboard navigation handler. Reserved for custom controls outside the bags. |
| `handleTypeaheadKeydown` | `(event: KeyboardEvent) => void` | Space-safe keyboard handler for typeahead inputs. |

### Ref setters

| Setter | Element |
|---|---|
| `setContainerRef(el)` | Root widget boundary. Extends click-outside detection. |
| `setTriggerRef(el)` | Trigger button, or the typeahead input. |
| `setDropdownRef(el)` | Popup element. Required to drive the Popover API. |
| `setInputRef(el)` | Search or typeahead input. |
| `setListRef(el)` | Options list. |
| `setOptionRef(option, el)` | Each option element. Required by `alignSelected` and scroll-into-view. |

Releasing a ref is optional in templates that own the element for the widget lifetime. Svelte `{@attach}` callbacks can return a cleanup that passes `null`.

## Validation

Validation is headless and reactive. The widget computes the result, you render it.

- Single mode: `required` means a value must be selected.
- Multiple mode: `required` means at least one value, `minLength` a minimum count, `maxLength` a maximum.
- `maxLength` also blocks adding more options through `select`; removal still works and `canSelectMore` reports the limit.
- `errors` contains `'required'`, `'minlength'`, or `'maxlength'`.
- `validationMessage` is a ready-to-show message for the first error. Override messages with `errorMessages`.

```vue
<p v-if="!scope.valid" role="alert">{{ scope.validationMessage }}</p>
```

## Keyboard

| Key | When | Behavior |
|---|---|---|
| `Enter`, `Space`, `ArrowDown`, `ArrowUp` | closed | Open the popup from the trigger. In a typeahead input, Enter and the arrows open it; Space and printable keys edit the query. |
| `Backspace`, `Delete` | closed, or open without a text query | Remove the last or only selected option. A text input that still holds text keeps native editing. |
| `ArrowDown`, `ArrowUp` | open | Move the highlight. Wraps and skips disabled options. |
| `PageDown`, `PageUp` | open | Move the highlight one visible page, clamped at the ends. |
| `Home`, `End` | open | Jump to the first or last selectable option. Native caret behavior inside text inputs. |
| `Enter` | open | On a trigger with a separate filter input, close the popup. Otherwise select the highlighted option, or create the typed query when `canCreate`. |
| `Space` | open | Does nothing on the trigger. Options and text inputs keep native behavior. |
| `Tab`, `Shift+Tab` | open | Move focus past the list. The popup closes when focus leaves the widget; `selectOnTab` selects the highlighted option first. |
| `Escape` | open | Close and return focus to the trigger. |

Clicking outside the container or moving focus out of it closes the popup. Keys pressed on elements outside the widget controls, such as chip remove buttons, are not intercepted.

## Popup positioning and the Popover API

Popups can be positioned with CSS anchor positioning. Two values do the work:

1. Put `cssAnchorName` on the trigger as the `anchor-name` style.
2. Put `popupStyle` on the popup, optionally merged with overrides.

```vue
<button
  :ref="setTriggerRef"
  v-bind="triggerProps"
  :style="{ anchorName: cssAnchorName }"
>
  …
</button>

<ul
  :ref="setDropdownRef"
  v-bind="listboxProps"
  popover="manual"
  :style="popupStyle"
>
  …
</ul>
```

When the popup element has a `popover` attribute, the widget drives it with the native Popover API (`showPopover()` and `hidePopover()`), so do not also render it conditionally. Without `popover`, render the popup conditionally on `isOpen`. Anchor positioning is optional: a conditionally rendered popup can be placed with ordinary CSS.

```css
.combobox {
  position: relative;
}

.popup {
  position: absolute;
  inset-inline: 0;
  top: calc(100% + 0.25rem);
  background: Canvas;
  border: 1px solid ButtonBorder;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.15);
}
```

`popupStyle` contains `positionAnchor`, `top`, `left`, and `width` anchor values. It sets no `position`: a popover gets `position: fixed` from the UA stylesheet, and a regular element keeps the position you give it. Merge overrides as an array: `:style="[popupStyle, { top: '…' }]"`.

The popover UA stylesheet pins the element with `inset: 0`. Reset it for anchored popups, and use `position-try: flip-block` to flip when there is no space below:

```css
.cbx-popup {
  inset: auto;
  position-try: flip-block;
  opacity: 0;
  margin-block-start: 0;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      opacity 0.15s ease,
      margin-block-start 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;
  }

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    opacity: 1;
    margin-block-start: 0.5rem;

    @starting-style {
      opacity: 0;
      margin-block-start: 0;
    }
  }
}
```

Style the selected option with `isSelected(option)` and the highlighted option by comparing `index` with `highlightedIndex`. Style the field with `valid` and `errors`.

## Common mistakes

- Adding `@click` or `@keydown` to an element that already spreads a bag that contains them (trigger, typeahead input, search input inside the popup, options).
- Spreading `triggerProps` and `comboboxInputProps` on the same element.
- Rendering the status live region conditionally. Screen readers need the empty element to exist before the text changes.
- Passing an index to `getOptionProps` that matches the rendered position in a grouped or virtualized list instead of the flat `filteredOptions` position. Omit the index in those lists.
- Expecting a created value to appear in `options` or resolve a chip label automatically. `createOption` only produces the stored value; update `options` yourself.
- Rendering the popup with `{#if}` while also using `popover="manual"`, or using `popover` while relying on `v-if` to hide it.
- Spreading a raw core snapshot without `toReactProps`, `toSvelteProps`, or `toSolidProps`. Adapter snapshots already contain framework-ready bags.
- Calling the Solid accessor once at the top of the component. Call `scope()` inside JSX.
- Conditionally rendering a Solid popup that contains a search input. Render it once with `popover="manual"`.
- Using `$state` for object values in Svelte. The proxy can break identity checks; use `$state.raw`, primitive values through `optionValue`, or `valueEqual`.
- Hand-writing `aria-*` attributes in Angular instead of reading them from `combobox.snapshot()` where the snapshot provides them.
- Comparing object selections with `===`. Use `isSelected(option)`, `optionValue`, or `valueEqual`.
- Putting a button or link inside an option or the trigger button. `role="option"` is a leaf for screen readers, and `<button>` cannot nest; keep chip remove buttons outside the trigger and inside the container boundary.
- Omitting the container ref and every explicit ref. `setContainerRef` auto-discovers standard markup; `setOptionRef` is only required for virtualized windows.
- Treating `open()` as synchronous when you need the DOM to be mounted or focus to be set.

## License

MIT. Source and issues: https://github.com/pdanpdan/headless-components
