# @pdanpdan/headless-combobox

Accessible, **renderless** (headless) combobox for Vue 3. It ships **zero styles** — you own 100% of the markup and styling (e.g. with daisyUI / Tailwind). The component exposes state, actions, and ARIA prop bags through its default scoped slot — or drive the same state machine directly with the [`useHeadlessCombobox`](#composable) composable.

## Install

```bash
pnpm add @pdanpdan/headless-combobox
```

`vue@^3` is a peer dependency.

## Usage

The component renders nothing on its own — you build the markup and bind the slot scope to it. The markup follows the ARIA combobox pattern: a **trigger** that opens a **popup** listing the **options**, optionally with a search input:

**Trigger + popup** — a button opens a list below it; the example below uses this layout:

```text
HeadlessCombobox (default slot scope)
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
           v-bind="inputProps"
```

**Typeahead** — the text input itself is the combobox; typing reopens the popup and filters (see `examples/TextTypeahead.vue`):

```text
HeadlessCombobox (default slot scope)
└─ div :ref="setContainerRef"                       widget boundary (optional)
   ├─ input :ref="setTriggerRef"                    the combobox input
   │  │       v-bind="comboboxInputProps"
   └─ ul :ref="setDropdownRef"                      the popup
      │      v-bind="listboxProps" :style="popupStyle"
      │      popover="manual"                       optional: native Popover API
      └─ li v-for="(option, i) in filteredOptions"
         └─ button :ref="setOptionRef(option, el)"  one option
                 v-bind="getOptionProps(option, i)"
```

This is where each slot prop is designed to be used:

| Markup | Slot props to bind | What they do |
|---|---|---|
| wrapper element | `setContainerRef` | Widget boundary for click-outside and focus. Optional, recommended. |
| trigger button | `triggerProps`, `setTriggerRef` | `role="combobox"` — toggles the popup, keyboard navigation. |
| typeahead input | `comboboxInputProps`, `setTriggerRef`, `setInputRef` | The input *is* the combobox: typing reopens and filters. |
| search input in the popup | `inputProps`, `setInputRef` | `role="searchbox"` — filters while the popup stays open. |
| popup element | `popupStyle`, `setDropdownRef` | Positioning; add `popover="manual"` to use the native Popover API. |
| list element | `listboxProps`, `setListRef` | `role="listbox"` — the options container. |
| each option element | `getOptionProps(option, index)`, `setOptionRef(option, el)` | Option semantics + select/highlight handlers. |

Ref setters are wired with `:ref="..."` and are optional — bind only the elements your markup uses. `setOptionRef` enables `alignSelected` and scroll-into-view; `setContainerRef` extends the click-outside boundary (e.g. to external chips).

```vue
<script setup lang="ts">
import { HeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref } from 'vue';

interface User { id: number; name: string; }

const users = ref<User[]>([
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
]);
const selected = ref<User | null>(null);
</script>

<template>
  <HeadlessCombobox
    v-slot="{ isOpen, filteredOptions, toggle, select, triggerProps, setContainerRef, setTriggerRef, getOptionProps }"
    v-model="selected"
    :options="users"
    :option-label="(u) => u.name"
  >
    <div :ref="setContainerRef">
      <button :ref="setTriggerRef" v-bind="triggerProps" type="button" @click="toggle">
        {{ selected?.name ?? 'Select…' }}
      </button>
      <ul v-if="isOpen">
        <li v-for="(u, i) in filteredOptions" :key="u.id">
          <button type="button" v-bind="getOptionProps(u, i)" @click="select(u)">
            {{ u.name }}
          </button>
        </li>
      </ul>
    </div>
  </HeadlessCombobox>
</template>
```

See the [`examples/`](./examples) folder for full daisyUI-styled demos — `TextTypeahead.vue` (editable combobox), `NiceSelect.vue` (selected-option alignment), and `ComposableSingle.vue` / `ComposableProgrammatic.vue` (composable API).

Prefer to skip the slot indirection? The same state machine is available as the [`useHeadlessCombobox`](#composable) composable.

## Composable

Two APIs, one state machine: `HeadlessCombobox` renders its default slot with the scope above, and the `useHeadlessCombobox` composable exposes the exact same state, ARIA prop bags, actions, and ref setters directly — the component is a thin wrapper around it. Use the component for slot-driven templates; use the composable for programmatic control (actions are plain functions callable from anywhere), wrapper components, or non-slot layouts. Call it from `setup()` — it registers document-level listeners and uses `useId()` for default ids.

```vue
<script setup lang="ts">
import { useHeadlessCombobox } from '@pdanpdan/headless-combobox';
import { ref, useId } from 'vue';

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
];
const selected = ref<User | null>(null);
const labelId = useId();

const {
  isOpen,
  filteredOptions,
  comboboxInputProps,
  listboxProps,
  getOptionProps,
  select,
  setContainerRef,
  setTriggerRef,
  setInputRef,
  setDropdownRef,
  setListRef,
  setOptionRef,
} = useHeadlessCombobox<User>(
  {
    modelValue: selected,
    options: users,
    optionLabel: (u) => u.name,
  },
  (value) => {
    selected.value = value as User | null;
  },
);
</script>

<template>
  <fieldset :ref="setContainerRef">
    <legend :id="labelId">Pick a user</legend>
    <input
      :ref="(el) => { setTriggerRef(el); setInputRef(el); }"
      v-bind="comboboxInputProps"
      :aria-labelledby="labelId"
      type="text"
    />
    <ul
      v-if="isOpen"
      :ref="(el) => { setDropdownRef(el); setListRef(el); }"
      v-bind="listboxProps"
    >
      <li v-for="(user, index) in filteredOptions" :key="user.id">
        <button
          :ref="(el) => setOptionRef(user, el)"
          type="button"
          v-bind="getOptionProps(user, index)"
          @click="select(user)"
        >
          {{ user.name }}
        </button>
      </li>
    </ul>
  </fieldset>
</template>
```

- **`props` accept plain values, refs, or a getter** — every field is unwrapped and tracked internally, so you can pass your `modelValue` ref directly without any `reactive()` wrapper.
- The second argument receives every `update:modelValue` payload — write it back to your state. Note that a ref deep-converts object values (`selected.value` is a reactive proxy of the option); use `isSelected(option)` for identity-based checks, as with the component.
- Returns a `HeadlessComboboxScope<T, Q>` — `Ref`s for state, plain functions for actions and ref setters. Destructure like any composable; refs unwrap in templates.

## Props

| Prop            | Type                                      | Default            | Description                                                                 |
|-----------------|-------------------------------------------|--------------------|-----------------------------------------------------------------------------|
| `modelValue`    | `V \| V[] \| null`                        | internal state     | Selected value(s) (`v-model`). Optional: without `v-model` the component keeps the selection internally. |
| `options`       | `O[]`                                     | —                  | List of options.                                                            |
| `multiple`      | `boolean`                                 | `false`            | Enable multiple selection.                                                  |
| `minLength`     | `number`                                  | —                  | Multiple: minimum number of selected options (validation).                  |
| `maxLength`     | `number`                                  | —                  | Multiple: maximum selected. Blocks adding beyond it.                        |
| `required`      | `boolean`                                 | `false`            | Require a selection (single: a value; multiple: at least one).              |
| `disabled`      | `boolean`                                 | `false`            | Disable the control: not focusable, cannot open or change.                  |
| `readonly`      | `boolean`                                 | `false`            | Read-only: focusable and shows the value, but cannot open or change.        |
| `closeOnSelect` | `boolean \| null`                         | `!multiple`        | Close the dropdown after selecting.                                         |
| `closeOnClickOutside` | `boolean`                        | `true`             | Close when clicking outside the widget boundary.                            |
| `clickOutsideFilter` | `(target: EventTarget \| null) => boolean` | —         | Return `false` to keep the dropdown open for a specific outside target.     |
| `selectOnTab`  | `boolean`                                 | `false`            | On `Tab`, when focus leaves the widget: select the highlighted option and close. |
| `optionValue`  | `(option: O) => V`                        | the option itself  | Maps an option to the value stored in `modelValue` / emitted on select.     |
| `optionLabel`  | `(option: O) => string`                   | `String(option)`   | Maps an option to a string for default filtering / rendering.               |
| `optionFilter` | `(option: O, query: Q) => boolean`        | case-insensitive substring | Custom filter function. `Q` defaults to `string`.                   |
| `id`            | `string`                                  | auto (`useId()`)   | Base id for accessibility attributes.                                       |
| `alignSelected` | `boolean`                                 | `false`            | Align the dropdown so the selected option covers the trigger. |
| `errorMessages` | `Partial<Record<HeadlessComboboxErrorCode, string>>` | —               | Override default validation messages.                                       |

## Emits

| Event               | Payload             | Description                        |
|---------------------|---------------------|------------------------------------|
| `update:modelValue` | `V \| V[] \| null`  | Fired when the selection changes.  |

## Selection & validation

- Set `multiple` to make `modelValue` an array. `select(option)` toggles membership and keeps the dropdown open; at `max`, adding is blocked (removing still works). `canSelectMore` reflects this.
- Validation is reactive and headless — you render it. `errors` is an array of `HeadlessComboboxErrorCode` (`'required' | 'minlength' | 'maxlength'`), `valid` is a boolean, and `validationMessage` is a ready-to-show message for the first error (override via `errorMessages`).

## Slot props

State: `isOpen`, `multiple`, `disabled`, `readonly`, `searchQuery` (`Q | undefined`, defaults to `string`), `filteredOptions`, `highlightedIndex`, `alignmentOffset`, `cssAnchorName`, `popupStyle` (`HeadlessComboboxPopupStyle`), `selectedCount`, `selectedList`, `canSelectMore`, `isSelected(option)`, `valid`, `errors`, `validationMessage`.

ARIA prop bags (spread with `v-bind`) — each bag also carries its interaction handlers, so options, triggers, and inputs need no hand-written event wiring:
- `triggerProps` — `HeadlessComboboxTriggerProps` (trigger as `role="combobox"`, plus `onClick` → toggle and `onKeydown` → `handleKeydown`)
- `inputProps` — `HeadlessComboboxInputProps` (in-popup filter input as `role="searchbox"`, plus `onInput` → `setSearchQuery` and `onKeydown` → `handleKeydown`)
- `comboboxInputProps` — `HeadlessComboboxComboboxInputProps` (typeahead input as `role="combobox"`, plus `onClick`/`onFocus` → open and `onInput` → `setSearchQuery`)
- `listboxProps` — `HeadlessComboboxListboxProps`
- `getOptionProps(option, index)` → `HeadlessComboboxOptionProps` (option semantics, plus `onClick` → select, `onMousedown` → `preventDefault` to keep the filter focused, and `onMousemove`/`onFocus` → `setHighlightedIndex` — blocked options are skipped)

Each ARIA interface is exported for precise typing. The `disabled`/`readonly` flags and all `aria-*` attributes are included.

Actions: `toggle`, `open`, `close(returnFocus?)`, `select(option)`, `clear()`, `setSearchQuery(value: Q | undefined)`, `setHighlightedIndex(index)`, `focusInput()`, `handleKeydown(event)`.

Ref setters (assign with `:ref`): `setContainerRef`, `setTriggerRef`, `setDropdownRef`, `setInputRef`, `setListRef`, `setOptionRef(option, el)`.

> The example components render options, triggers, and search inputs with nothing more than `v-bind` on the bags — see `examples/` for the recommended usage.

## Popup positioning & the Popover API

Positioning the popup needs two styles: the **trigger** exposes an anchor via `cssAnchorName`, and the **popup** applies the ready-made `popupStyle` (position, anchor position, and width) plus `popover="manual"` so the browser renders it in the top layer:

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

`popupStyle` (`HeadlessComboboxPopupStyle`) is a ready-to-apply style object — no `position` is set: a popover gets `position: fixed` from the UA stylesheet, and a regular element keeps the position you give it:

```
{ positionAnchor: cssAnchorName, top: 'anchor(bottom)', left: 'anchor(left)', width: 'anchor-size(width)' }
```

Merge overrides with an array (`:style="[popupStyle, { top: '…' }]"`). A simple popup style hides the element unless it is open and slides/fades it in (the `@starting-style` block plays the entry; the `overlay`/`display` transitions make the top-layer appearance and the `display: none` switch animatable). The popover UA pins the element with `inset: 0`, so flippable popups reset it (`inset: auto`) and `position-try: flip-block` flips the anchored base position to the other side when there is no space. The transition is applied only when the user has not requested reduced motion — under `prefers-reduced-motion: reduce` the popup still opens, it just appears instantly:

```css
/* A simple popup: slide + fade via the Popover API. */
.cbx-popup {
  inset: auto;
  position-try: flip-block;
  opacity: 0;
  translate: 0 -0.375rem;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      opacity 0.15s ease,
      translate 0.15s ease,
      overlay 0.15s ease allow-discrete,
      display 0.15s ease allow-discrete;
  }

  &:not(:popover-open) {
    display: none;
  }

  &:popover-open {
    opacity: 1;
    translate: 0 0;

    @starting-style {
      opacity: 0;
      translate: 0 -0.375rem;
    }
  }
}
```

If the dropdown element is a popover (`popover="manual"`), the component drives it with the native **Popover API** (`showPopover()` / `hidePopover()`) — no `v-if` needed. Otherwise, toggle the element yourself with `v-if="isOpen"` (the `popupStyle` still positions it).

## Keyboard

| Key                     | Behavior                                  |
|-------------------------|-------------------------------------------|
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` (closed) | Open the dropdown.           |
| `Backspace` / `Delete` (closed, or open without a filter input) | Remove the last (or only) selected option. Keys aimed at a text input that still holds text keep their native behavior. |
| `ArrowDown` / `ArrowUp` (open) | Move the highlight.                |
| `PageDown` / `PageUp`   | Move the highlight a full page (visible options), clamped at the ends. |
| `Home` / `End`          | Jump to the first/last selectable option (native caret behavior in inputs). |
| `Enter` (open)          | Select the highlighted option.            |
| `Tab` / `Shift+Tab`     | Skip the options list to the next focusable element; closes when focus leaves the widget (`selectOnTab` selects the highlighted option first). |
| `Escape`                | Close and return focus to the trigger.    |

Clicking outside the container (or tabbing focus out of it) closes the dropdown.

Keys pressed on elements outside the combobox's own controls — e.g. chip remove buttons or popup clear buttons — are never intercepted; they keep their native activation.

## Distribution

This package ships both compiled output and raw source:

- `@pdanpdan/headless-combobox` → compiled ESM/CJS + types (`dist/`).
- `@pdanpdan/headless-combobox/source` → raw `src/index.ts`.
- `@pdanpdan/headless-combobox/HeadlessCombobox.vue` → the raw SFC.

## License

MIT
