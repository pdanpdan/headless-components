# @pdanpdan/headless-combobox

Accessible, **renderless** (headless) combobox for Vue 3. It ships **zero styles** — you own
100% of the markup and styling (e.g. with daisyUI / Tailwind). The component exposes state,
actions, and ARIA prop bags through its default scoped slot.

## Install

```bash
pnpm add @pdanpdan/headless-combobox
```

`vue@^3` is a peer dependency.

## Usage

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
    :display-value="(u) => u.name"
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

See the [`examples/`](./examples) folder for full daisyUI-styled demos
(`BasicComboBox.vue` with filtering, `NiceSelect.vue` nice-select alignment).

## Props

| Prop            | Type                                      | Default            | Description                                                                 |
|-----------------|-------------------------------------------|--------------------|-----------------------------------------------------------------------------|
| `modelValue`    | `T \| T[] \| null`                        | —                  | Selected option(s) (`v-model`). Array in multiple mode.                     |
| `options`       | `T[]`                                     | —                  | List of options.                                                            |
| `multiple`      | `boolean`                                 | `false`            | Enable multiple selection.                                                  |
| `minLength`     | `number`                                  | —                  | Multiple: minimum number of selected options (validation).                  |
| `maxLength`     | `number`                                  | —                  | Multiple: maximum selected. Blocks adding beyond it.                        |
| `required`      | `boolean`                                 | `false`            | Require a selection (single: a value; multiple: at least one).              |
| `disabled`      | `boolean`                                 | `false`            | Disable the control: not focusable, cannot open or change.                  |
| `readonly`      | `boolean`                                 | `false`            | Read-only: focusable and shows the value, but cannot open or change.        |
| `closeOnSelect` | `boolean \| null`                         | `!multiple`        | Close the dropdown after selecting.                                         |
| `displayValue`  | `(option: T) => string`                   | `String(option)`   | Maps an option to a string for default filtering / rendering.               |
| `filterFn`      | `(option: T, query: Q) => boolean`        | case-insensitive substring | Custom filter function. `Q` defaults to `string`.                   |
| `id`            | `string`                                  | auto (`useId()`)   | Base id for accessibility attributes.                                       |
| `alignSelected` | `boolean`                                 | `false`            | Align the dropdown so the selected option covers the trigger. |
| `errorMessages` | `Partial<Record<HeadlessComboboxErrorCode, string>>` | —               | Override default validation messages.                                       |

## Emits

| Event               | Payload             | Description                        |
|---------------------|---------------------|------------------------------------|
| `update:modelValue` | `T \| T[] \| null`  | Fired when the selection changes.  |

## Selection & validation

- Set `multiple` to make `modelValue` an array. `select(option)` toggles membership and keeps the
  dropdown open; at `max`, adding is blocked (removing still works). `canSelectMore` reflects this.
- Validation is reactive and headless — you render it. `errors` is an array of
  `HeadlessComboboxErrorCode` (`'required' | 'minlength' | 'maxlength'`), `valid` is a boolean, and `validationMessage`
  is a ready-to-show message for the first error (override via `errorMessages`).

## Slot props

State: `isOpen`, `multiple`, `disabled`, `readonly`, `searchQuery` (`Q | undefined`, defaults to `string`), `filteredOptions`, `highlightedIndex`, `alignmentOffset`, `cssAnchorName`, `popupStyle` (`HeadlessComboboxPopupStyle`), `selectedCount`, `canSelectMore`, `isSelected(option)`, `valid`, `errors`, `validationMessage`.

ARIA prop bags (spread with `v-bind`):
- `triggerProps` — `HeadlessComboboxTriggerProps` (select-only trigger as `role="combobox"`)
- `inputProps` — `HeadlessComboboxInputProps` (in-popup filter input as `role="searchbox"`)
- `comboboxInputProps` — `HeadlessComboboxComboboxInputProps` (typeahead input as `role="combobox"`)
- `listboxProps` — `HeadlessComboboxListboxProps`
- `getOptionProps(option, index)` → `HeadlessComboboxOptionProps`

Each ARIA interface is exported for precise typing. The `disabled`/`readonly` flags and all `aria-*` attributes are included.

Actions: `toggle`, `open`, `close(returnFocus?)`, `select(option)`, `clear()`, `setSearchQuery(value: Q | undefined)`, `setHighlightedIndex(index)`, `focusInput()`, `handleKeydown(event)`.

Ref setters (assign with `:ref`): `setContainerRef`, `setTriggerRef`, `setDropdownRef`, `setInputRef`, `setListRef`, `setOptionRef(option, el)`.

> Tip: wire `setHighlightedIndex(index)` to each option's `@mousemove` so the mouse-hovered option
> uses the same highlight style as the keyboard-active one.

## Popup positioning & the Popover API

`popupStyle` (`HeadlessComboboxPopupStyle`) is a ready-to-apply style object for the dropdown:

```
{ position: 'absolute', positionAnchor: cssAnchorName, top: 'anchor(bottom)', left: 'anchor(left)', width: 'anchor-size(width)' }
```

Apply it directly (`:style="popupStyle"`) or merge overrides (`:style="[popupStyle, { top: '…' }]"`).

If you mark the dropdown element as a popover (`popover="manual"`), the component drives it with the
native **Popover API** (`showPopover()` / `hidePopover()`) so it renders in the top layer — no `v-if`
needed. Otherwise, toggle the element yourself with `v-if="isOpen"`.

## Keyboard

| Key                     | Behavior                                  |
|-------------------------|-------------------------------------------|
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` (closed) | Open the dropdown.           |
| `ArrowDown` / `ArrowUp` (open) | Move the highlight.                |
| `Enter` (open)          | Select the highlighted option.            |
| `Escape`                | Close and return focus to the trigger.    |

Clicking outside the container closes the dropdown.

## Distribution

This package ships both compiled output and raw source:

- `@pdanpdan/headless-combobox` → compiled ESM/CJS + types (`dist/`).
- `@pdanpdan/headless-combobox/source` → raw `src/index.ts`.
- `@pdanpdan/headless-combobox/HeadlessCombobox.vue` → the raw SFC.

## License

MIT
