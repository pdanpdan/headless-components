<script setup lang="ts">
import { mdiGithub } from '@mdi/js';
import NiceSelect from '@pdanpdan/headless-combobox/examples/NiceSelect.vue';
import niceSource from '@pdanpdan/headless-combobox/examples/NiceSelect.vue?highlight';
import ObjectMultipleValidated from '@pdanpdan/headless-combobox/examples/ObjectMultipleValidated.vue';
import objectMultipleSource from '@pdanpdan/headless-combobox/examples/ObjectMultipleValidated.vue?highlight';
import ObjectSingle from '@pdanpdan/headless-combobox/examples/ObjectSingle.vue';
import objectSingleSource from '@pdanpdan/headless-combobox/examples/ObjectSingle.vue?highlight';
import TextMultiple from '@pdanpdan/headless-combobox/examples/TextMultiple.vue';
import textMultipleSource from '@pdanpdan/headless-combobox/examples/TextMultiple.vue?highlight';
import TextMultipleChips from '@pdanpdan/headless-combobox/examples/TextMultipleChips.vue';
import textMultipleChipsSource from '@pdanpdan/headless-combobox/examples/TextMultipleChips.vue?highlight';
import TextMultipleCustom from '@pdanpdan/headless-combobox/examples/TextMultipleCustom.vue';
import textMultipleCustomSource from '@pdanpdan/headless-combobox/examples/TextMultipleCustom.vue?highlight';
import TextSingle from '@pdanpdan/headless-combobox/examples/TextSingle.vue';
import textSingleSource from '@pdanpdan/headless-combobox/examples/TextSingle.vue?highlight';
import TextTypeahead from '@pdanpdan/headless-combobox/examples/TextTypeahead.vue';
import textTypeaheadSource from '@pdanpdan/headless-combobox/examples/TextTypeahead.vue?highlight';
import TextTypeaheadChips from '@pdanpdan/headless-combobox/examples/TextTypeaheadChips.vue';
import textTypeaheadChipsSource from '@pdanpdan/headless-combobox/examples/TextTypeaheadChips.vue?highlight';

import CopyButton from '#/components/CopyButton.vue';
import ExampleShowcase from '#/components/ExampleShowcase.vue';
import MdiIcon from '#/components/MdiIcon.vue';
import PropTable from '#/components/PropTable.vue';

const props = [
  { name: 'modelValue', type: 'T | T[] | null', default: '—', description: 'Selected option(s) (v-model). Array in multiple mode.' },
  { name: 'options', type: 'T[]', default: '—', description: 'List of options.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Enable multiple selection.' },
  { name: 'minLength', type: 'number', default: '—', description: 'Multiple: minimum number of selected options (validation).' },
  { name: 'maxLength', type: 'number', default: '—', description: 'Multiple: maximum selected. Blocks adding beyond it.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Require a selection (single: a value; multiple: >= 1).' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the control: not focusable, cannot open or change.' },
  { name: 'readonly', type: 'boolean', default: 'false', description: 'Read-only: focusable, shows the value, but cannot open or change.' },
  { name: 'closeOnSelect', type: 'boolean | null', default: '!multiple', description: 'Close the dropdown after selecting.' },
  { name: 'displayValue', type: '(option: T) => string', default: 'String(option)', description: 'Maps an option to a string for filtering / rendering.' },
  { name: 'filterFn', type: '(option: T, query: Q) => boolean', default: 'substring', description: 'Custom filter function. Q defaults to string.' },
  { name: 'id', type: 'string', default: 'useId()', description: 'Base id for accessibility attributes.' },
  { name: 'alignSelected', type: 'boolean', default: 'false', description: 'Align the dropdown so the selected option covers the trigger.' },
  { name: 'errorMessages', type: 'Partial<Record<HeadlessComboboxErrorCode, string>>', default: '—', description: 'Override default validation messages.' },
];

const emits = [
  { name: 'update:modelValue', type: 'T | T[] | null', description: 'Emitted when the selection changes.' },
];

const methods: { name: string; type?: string; description: string; }[] = [];

const slotGroups = [
  {
    title: 'State',
    description: 'Reactive values describing the current state.',
    rows: [
      { name: 'isOpen', type: 'boolean', description: 'Whether the dropdown is open.' },
      { name: 'multiple', type: 'boolean', description: 'Whether multiple selection is enabled.' },
      { name: 'disabled', type: 'boolean', description: 'Whether the control is disabled.' },
      { name: 'readonly', type: 'boolean', description: 'Whether the control is read-only.' },
      { name: 'searchQuery', type: 'Q | undefined', description: 'Current search query. Q defaults to string.' },
      { name: 'filteredOptions', type: 'T[]', description: 'Options after applying the filter.' },
      { name: 'highlightedIndex', type: 'number', description: 'Index of the highlighted option (-1 when none).' },
      { name: 'alignmentOffset', type: 'number', description: 'Pixel offset used for alignment.' },
      { name: 'cssAnchorName', type: 'string', description: 'Unique CSS anchor-name for popover positioning.' },
      { name: 'popupStyle', type: 'HeadlessComboboxPopupStyle', description: 'Default popup positioning style — spread/merge onto the dropdown.' },
      { name: 'selectedCount', type: 'number', description: 'Number of selected options.' },
      { name: 'canSelectMore', type: 'boolean', description: 'False when at `maxLength` (multiple).' },
      { name: 'isSelected', type: '(option: T) => boolean', description: 'Whether an option is selected.' },
      { name: 'valid', type: 'boolean', description: 'Whether the current selection passes validation.' },
      { name: 'errors', type: 'HeadlessComboboxErrorCode[]', description: `Active validation errors ('required' | 'minlength' | 'maxlength').` },
      { name: 'validationMessage', type: 'string', description: 'Human-readable message for the first error.' },
    ],
  },
  {
    title: 'ARIA prop bags',
    description: 'Spread onto elements with v-bind for accessibility.',
    rows: [
      { name: 'triggerProps', type: 'HeadlessComboboxTriggerProps', description: 'Attributes + toggle/keydown handlers for the trigger (role=combobox, aria-expanded, aria-activedescendant, …).' },
      { name: 'inputProps', type: 'HeadlessComboboxInputProps', description: 'Attributes + input/keydown handlers for an in-popup search/filter input (role=searchbox, aria-activedescendant, …).' },
      { name: 'comboboxInputProps', type: 'HeadlessComboboxComboboxInputProps', description: 'Attributes + open/focus/input handlers for a typeahead input that is itself the combobox (role=combobox, aria-expanded, aria-autocomplete, …).' },
      { name: 'listboxProps', type: 'HeadlessComboboxListboxProps', description: 'Attributes for the listbox (role, aria-multiselectable).' },
      { name: 'getOptionProps', type: '(option, index) => HeadlessComboboxOptionProps', description: 'Attributes + select/mouse/focus handlers for an option (role, aria-selected, aria-disabled, …).' },
    ],
  },
  {
    title: 'Actions',
    description: 'Methods to drive the combobox.',
    rows: [
      { name: 'toggle', type: '() => void', description: 'Toggle the dropdown open/closed.' },
      { name: 'open', type: '() => void', description: 'Open the dropdown.' },
      { name: 'close', type: '(returnFocus?: boolean) => void', description: 'Close the dropdown.' },
      { name: 'select', type: '(option: T) => void', description: 'Select (single) or toggle (multiple) an option.' },
      { name: 'clear', type: '() => void', description: 'Clear the selection (null or []).' },
      { name: 'setSearchQuery', type: '(value: Q | undefined) => void', description: 'Update the search query.' },
      { name: 'setHighlightedIndex', type: '(index: number) => void', description: 'Set the highlighted option — wire to hover to match keyboard.' },
      { name: 'focusInput', type: '() => void', description: 'Focus the filter input (keeps focus while the popup stays open).' },
      { name: 'handleKeydown', type: '(event: KeyboardEvent) => void', description: 'Keyboard navigation handler.' },
    ],
  },
  {
    title: 'Ref setters',
    description: 'Assign to elements with :ref to wire up focus and positioning.',
    rows: [
      { name: 'setContainerRef', type: 'ref fn', description: 'The root container element.' },
      { name: 'setTriggerRef', type: 'ref fn', description: 'The trigger button element.' },
      { name: 'setDropdownRef', type: 'ref fn', description: 'The dropdown popup element.' },
      { name: 'setInputRef', type: 'ref fn', description: 'The search input element.' },
      { name: 'setListRef', type: 'ref fn', description: 'The options list element.' },
      { name: 'setOptionRef', type: '(option, el) => void', description: 'Each option element.' },
    ],
  },
];

const slots = [
  {
    name: 'default',
    description: 'Renderless. Receives the scope below to build the entire UI.',
    groups: slotGroups,
  },
];

const install = 'pnpm add @pdanpdan/headless-combobox';
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-bold">HeadlessCombobox</h1>
        <span class="badge badge-soft badge-primary">headless</span>
      </div>
      <a
        href="https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-primary inline-flex items-center gap-1.5 text-sm"
      >
        <MdiIcon :path="mdiGithub" class="size-5" />
        github.com/pdanpdan/headless-components/packages/headless-combobox
      </a>
      <p class="max-w-2xl text-base-content/70">
        An accessible, renderless combobox. It renders nothing on its own &mdash; the default scoped
        slot exposes state, ARIA prop bags, and actions so you own 100% of the markup and styling.
        Supports single or multiple selection (with min/max counts) and reactive validation.
      </p>
    </header>

    <section class="flex flex-col gap-2">
      <h2 class="text-xl font-semibold">Installation</h2>
      <div class="mockup-code relative border border-base-content/10 bg-base-content/2 text-base-content w-full overflow-x-auto">
        <CopyButton :text="install" class="btn-ghost absolute top-2 right-4 z-10" />
        <pre data-prefix="$"><code>{{ install }}</code></pre>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Examples</h2>
      <p class="max-w-2xl text-sm text-base-content/70">
        Each popup uses the native <strong>Popover API</strong> (top-layer, via <code>popover="manual"</code>) with
        the exposed <code>popupStyle</code> for anchor positioning. The keyboard-active and mouse-hovered option share the
        same highlight (via <code>setHighlightedIndex</code> on hover); the selection is shown separately with a check.
      </p>

      <ExampleShowcase
        title="Text options · single · no filter"
        description="A list of plain string options, single selection, no search input."
        :source="textSingleSource"
      >
        <TextSingle />
      </ExampleShowcase>

      <ExampleShowcase
        title="Object options · single · with filter"
        description="Object options with a custom layout and a searchable input."
        :source="objectSingleSource"
      >
        <ObjectSingle />
      </ExampleShowcase>

      <ExampleShowcase
        title="Text options · multiple · with filter"
        description="Multiple selection capped with max; selecting toggles, dropdown stays open."
        :source="textMultipleSource"
      >
        <TextMultiple />
      </ExampleShowcase>

      <ExampleShowcase
        title="Text options · multiple · removable chips"
        description="Selected items as removable chips. The remove buttons live outside the combobox trigger, so the trigger stays a single focusable control."
        :source="textMultipleChipsSource"
      >
        <TextMultipleChips />
      </ExampleShowcase>

      <ExampleShowcase
        title="Text options · multiple · custom options"
        description="Options are fully customizable: the focused option gets a thick left border, and each option shows a checkbox (checked / unchecked) for its selection state."
        :source="textMultipleCustomSource"
      >
        <TextMultipleCustom />
      </ExampleShowcase>

      <ExampleShowcase
        title="Object options · multiple · validated"
        description="Multiple selection with required + min/max validation and a rendered message."
        :source="objectMultipleSource"
      >
        <ObjectMultipleValidated />
      </ExampleShowcase>

      <ExampleShowcase
        title="Select alignment"
        description="No search input; the dropdown aligns so the selected option overlays the trigger."
        :source="niceSource"
      >
        <NiceSelect />
      </ExampleShowcase>

      <ExampleShowcase
        title="Typeahead (editable combobox)"
        description="Canonical APG editable pattern: the text input itself is the combobox (role=combobox); type to filter."
        :source="textTypeaheadSource"
      >
        <TextTypeahead />
      </ExampleShowcase>

      <ExampleShowcase
        title="Typeahead · chips inside the field"
        description="GitHub-style topic input: chips and the text input share one bordered field. The field is a plain container, so each chip can carry a remove button without nesting controls."
        :source="textTypeaheadChipsSource"
      >
        <TextTypeaheadChips />
      </ExampleShowcase>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">API</h2>

      <div v-if="props.length" class="card border border-base-content/10 bg-base-content/2 overflow-x-auto">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Props</h3>
          <PropTable :rows="props" show-default />
        </div>
      </div>

      <div v-if="emits.length" class="card border border-base-content/10 bg-base-content/2 overflow-x-auto">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Emits</h3>
          <PropTable :rows="emits" />
        </div>
      </div>

      <div v-if="methods.length" class="card border border-base-content/10 bg-base-content/2 overflow-x-auto">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Methods</h3>
          <PropTable :rows="methods" />
        </div>
      </div>

      <div
        v-for="slot in slots"
        :key="slot.name"
        class="card border border-base-content/10 bg-base-content/2 overflow-x-auto"
      >
        <div class="card-body gap-4">
          <div class="flex flex-col gap-1">
            <h3 class="card-title text-base">
              Slot
              <code class="rounded bg-base-200 px-1.5 py-0.5 font-mono text-sm font-normal">{{ slot.name }}</code>
            </h3>
            <p class="text-xs text-base-content/60">{{ slot.description }}</p>
          </div>

          <div
            v-for="group in slot.groups"
            :key="group.title"
            class="flex flex-col gap-2"
          >
            <div class="flex flex-col gap-0.5">
              <h4 class="text-sm font-semibold">{{ group.title }}</h4>
              <p class="text-xs text-base-content/60">{{ group.description }}</p>
            </div>
            <PropTable :rows="group.rows" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
