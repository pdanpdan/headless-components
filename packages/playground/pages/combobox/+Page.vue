<script setup lang="ts">
import { mdiGithub } from '@mdi/js';
import ComposableProgrammatic, { description as composableProgrammaticDescription, title as composableProgrammaticTitle } from '@pdanpdan/headless-combobox/examples/ComposableProgrammatic.vue';
import composableProgrammaticSource from '@pdanpdan/headless-combobox/examples/ComposableProgrammatic.vue?highlight';
import ComposableSingle, { description as composableSingleDescription, title as composableSingleTitle } from '@pdanpdan/headless-combobox/examples/ComposableSingle.vue';
import composableSingleSource from '@pdanpdan/headless-combobox/examples/ComposableSingle.vue?highlight';
import NiceSelect, { description as niceSelectDescription, title as niceSelectTitle } from '@pdanpdan/headless-combobox/examples/NiceSelect.vue';
import niceSource from '@pdanpdan/headless-combobox/examples/NiceSelect.vue?highlight';
import ObjectMultipleValidated, { description as objectMultipleValidatedDescription, title as objectMultipleValidatedTitle } from '@pdanpdan/headless-combobox/examples/ObjectMultipleValidated.vue';
import objectMultipleSource from '@pdanpdan/headless-combobox/examples/ObjectMultipleValidated.vue?highlight';
import ObjectSingle, { description as objectSingleDescription, title as objectSingleTitle } from '@pdanpdan/headless-combobox/examples/ObjectSingle.vue';
import objectSingleSource from '@pdanpdan/headless-combobox/examples/ObjectSingle.vue?highlight';
import ObjectValueSingle, { description as objectValueSingleDescription, title as objectValueSingleTitle } from '@pdanpdan/headless-combobox/examples/ObjectValueSingle.vue';
import objectValueSingleSource from '@pdanpdan/headless-combobox/examples/ObjectValueSingle.vue?highlight';
import TextInternal, { description as textInternalDescription, title as textInternalTitle } from '@pdanpdan/headless-combobox/examples/TextInternal.vue';
import textInternalSource from '@pdanpdan/headless-combobox/examples/TextInternal.vue?highlight';
import TextMultiple, { description as textMultipleDescription, title as textMultipleTitle } from '@pdanpdan/headless-combobox/examples/TextMultiple.vue';
import textMultipleSource from '@pdanpdan/headless-combobox/examples/TextMultiple.vue?highlight';
import TextMultipleChips, { description as textMultipleChipsDescription, title as textMultipleChipsTitle } from '@pdanpdan/headless-combobox/examples/TextMultipleChips.vue';
import textMultipleChipsSource from '@pdanpdan/headless-combobox/examples/TextMultipleChips.vue?highlight';
import TextMultipleCustom, { description as textMultipleCustomDescription, title as textMultipleCustomTitle } from '@pdanpdan/headless-combobox/examples/TextMultipleCustom.vue';
import textMultipleCustomSource from '@pdanpdan/headless-combobox/examples/TextMultipleCustom.vue?highlight';
import TextSelectOnTab, { description as textSelectOnTabDescription, title as textSelectOnTabTitle } from '@pdanpdan/headless-combobox/examples/TextSelectOnTab.vue';
import textSelectOnTabSource from '@pdanpdan/headless-combobox/examples/TextSelectOnTab.vue?highlight';
import TextSingle, { description as textSingleDescription, title as textSingleTitle } from '@pdanpdan/headless-combobox/examples/TextSingle.vue';
import textSingleSource from '@pdanpdan/headless-combobox/examples/TextSingle.vue?highlight';
import TextTypeahead, { description as textTypeaheadDescription, title as textTypeaheadTitle } from '@pdanpdan/headless-combobox/examples/TextTypeahead.vue';
import textTypeaheadSource from '@pdanpdan/headless-combobox/examples/TextTypeahead.vue?highlight';
import TextTypeaheadChips, { description as textTypeaheadChipsDescription, title as textTypeaheadChipsTitle } from '@pdanpdan/headless-combobox/examples/TextTypeaheadChips.vue';
import textTypeaheadChipsSource from '@pdanpdan/headless-combobox/examples/TextTypeaheadChips.vue?highlight';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleShowcase from '#/components/ExampleShowcase.vue';
import MdiIcon from '#/components/MdiIcon.vue';
import PropTable from '#/components/PropTable.vue';

import SnippetComposableSource from './SnippetComposable.vue?highlight';
import SnippetInstallSource from './SnippetInstall.bash?highlight';

import SnippetPopupCssSource from './SnippetPopupCss.css?highlight';

const props = [
  { name: 'modelValue', type: 'V | V[] | null', default: 'internal', description: 'Selected value(s) (v-model). Optional: without v-model the component keeps the selection internally.' },
  { name: 'options', type: 'O[]', default: '—', description: 'List of options.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Enable multiple selection.' },
  { name: 'minLength', type: 'number', default: '—', description: 'Multiple: minimum number of selected options (validation).' },
  { name: 'maxLength', type: 'number', default: '—', description: 'Multiple: maximum selected. Blocks adding beyond it.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Require a selection (single: a value; multiple: >= 1).' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the control: not focusable, cannot open or change.' },
  { name: 'readonly', type: 'boolean', default: 'false', description: 'Read-only: focusable, shows the value, but cannot open or change.' },
  { name: 'closeOnSelect', type: 'boolean | null', default: '!multiple', description: 'Close the dropdown after selecting.' },
  { name: 'closeOnClickOutside', type: 'boolean', default: 'true', description: 'Close when clicking outside the widget boundary.' },
  { name: 'clickOutsideFilter', type: '(target: EventTarget | null) => boolean', default: '—', description: 'Return false to keep the dropdown open for a specific outside target.' },
  { name: 'selectOnTab', type: 'boolean', default: 'false', description: 'On Tab, when focus leaves the widget: select the highlighted option and close the popup.' },
  { name: 'optionValue', type: '(option: O) => V', default: 'option itself', description: 'Maps an option to the value stored in modelValue / emitted on select.' },
  { name: 'optionLabel', type: '(option: O) => string', default: 'String(option)', description: 'Maps an option to a string for filtering / rendering.' },
  { name: 'optionFilter', type: '(option: O, query: Q) => boolean', default: 'substring', description: 'Custom filter function. Q defaults to string.' },
  { name: 'id', type: 'string', default: 'useId()', description: 'Base id for accessibility attributes.' },
  { name: 'alignSelected', type: 'boolean', default: 'false', description: 'Align the dropdown so the selected option covers the trigger.' },
  { name: 'errorMessages', type: 'Partial<Record<HeadlessComboboxErrorCode, string>>', default: '—', description: 'Override default validation messages.' },
];

const emits = [
  { name: 'update:modelValue', type: 'V | V[] | null', description: 'Emitted when the selection changes.' },
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
      { name: 'selectedList', type: 'V[]', description: 'The selected values (single mode: a single-element array).' },
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

const interactionRows = [
  { name: 'Enter / Space / ArrowDown / ArrowUp', type: 'popup closed', description: 'Open the dropdown.' },
  { name: 'ArrowDown / ArrowUp', type: 'popup open', description: 'Move the highlight; wraps around and skips disabled options.' },
  { name: 'PageDown / PageUp', type: 'popup open', description: 'Move the highlight a full page (visible options), clamped at the ends.' },
  { name: 'Home / End', type: 'popup open', description: 'Jump to the first/last selectable option (native caret behavior in inputs).' },
  { name: 'Enter', type: 'popup open', description: 'Select the highlighted option.' },
  { name: 'Tab / Shift+Tab', type: 'popup open', description: 'Skip the options list to the next focusable element; closes when focus leaves the widget (selectOnTab selects the highlighted option first).' },
  { name: 'Escape', type: 'popup open', description: 'Close the popup and return focus to the trigger.' },
];

const structureRows = [
  { name: 'wrapper element', type: 'setContainerRef', description: 'Widget boundary for click-outside and focus. Optional, recommended.' },
  { name: 'trigger button', type: 'triggerProps, setTriggerRef', description: 'role="combobox" — toggles the popup, keyboard navigation.' },
  { name: 'typeahead input', type: 'comboboxInputProps, setTriggerRef, setInputRef', description: 'The input is the combobox: typing reopens and filters.' },
  { name: 'search input (in popup)', type: 'inputProps, setInputRef', description: 'role="searchbox" — filters while the popup stays open.' },
  { name: 'popup element', type: 'popupStyle, setDropdownRef', description: 'Positioning; add popover="manual" to use the native Popover API.' },
  { name: 'list element', type: 'listboxProps, setListRef', description: 'role="listbox" — the options container.' },
  { name: 'each option element', type: 'getOptionProps(option, index), setOptionRef(option, el)', description: 'Option semantics + select/highlight handlers.' },
];
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
      <p class="text-base-content/70">An accessible, renderless combobox. It renders nothing on its own &mdash; the default scoped slot exposes state, ARIA prop bags, and actions so you own 100% of the markup and styling. The same state machine is also available as the <code>useHeadlessCombobox</code> composable. Supports single or multiple selection (with min/max counts) and reactive validation.</p>
    </header>

    <section class="flex flex-col gap-2">
      <h2 class="text-xl font-semibold">Installation</h2>
      <CodeBlock
        :code="SnippetInstallSource.html"
        :raw="SnippetInstallSource.raw"
        lang="bash"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Structure</h2>
      <p class="text-sm text-base-content/70">The component renders nothing on its own — you build the markup and bind the slot scope to it. The markup follows the ARIA combobox pattern: a <strong>trigger</strong> that opens a <strong>popup</strong> listing the <strong>options</strong>, optionally with a search input. This is where each slot prop is designed to be used:</p>

      <p class="text-sm font-semibold">Trigger + popup — a button opens a list below it; most examples use this layout.</p>
      <div class="overflow-x-auto rounded-box bg-[#0d1117] p-5 font-mono text-sm leading-6 text-[#e6edf3]">
        <pre class="min-w-0"><code>HeadlessCombobox (default slot scope)
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
           v-bind="inputProps"</code></pre>
      </div>
      <p class="text-sm font-semibold">Typeahead — the text input itself is the combobox; typing reopens the popup and filters.</p>
      <div class="overflow-x-auto rounded-box bg-[#0d1117] p-5 font-mono text-sm leading-6 text-[#e6edf3]">
        <pre class="min-w-0"><code>HeadlessCombobox (default slot scope)
└─ div :ref="setContainerRef"                       widget boundary (optional)
   ├─ input :ref="setTriggerRef"                    the combobox input
   │  │       v-bind="comboboxInputProps"
   └─ ul :ref="setDropdownRef"                      the popup
      │      v-bind="listboxProps" :style="popupStyle"
      │      popover="manual"                       optional: native Popover API
      └─ li v-for="(option, i) in filteredOptions"
         └─ button :ref="setOptionRef(option, el)"  one option
                 v-bind="getOptionProps(option, i)"</code></pre>
      </div>

      <div class="card border border-base-content/10 bg-base-content/2 overflow-x-auto">
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Markup &rarr; slot props</h3>
          <PropTable :rows="structureRows" />
        </div>
      </div>

      <p class="text-sm text-base-content/70">Ref setters are wired with <code>:ref</code> and are optional; <code>setOptionRef</code> enables <code>alignSelected</code> and scroll-into-view, and <code>setContainerRef</code> extends the click-outside boundary (e.g. to external chips).</p>

      <p class="text-sm text-base-content/70">The popup is positioned with CSS anchor positioning: the trigger needs <code>:style="{ anchorName: cssAnchorName }"</code>, and the popup gets <code>:style="popupStyle"</code> plus <code>popover="manual"</code> — the component then drives it with the native Popover API (top-layer rendering, no <code>v-if</code>). Animate the open state with CSS transitions on <code>:popover-open</code>, like the examples do.</p>

      <p class="text-sm text-base-content/70">A simple popup style: hidden unless open, with a slide + fade entry animation (the <code>@starting-style</code> block plays the entry; the <code>overlay</code>/<code>display</code> transitions make the top-layer appearance and the <code>display: none</code> switch animatable):</p>
      <CodeBlock
        :code="SnippetPopupCssSource.html"
        :raw="SnippetPopupCssSource.raw"
        lang="css"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Keyboard</h2>
      <PropTable :rows="interactionRows" />
      <p class="text-sm text-base-content/70">Mouse interactions: clicking the trigger toggles the dropdown, hovering or focusing an option highlights it (the same highlight the keyboard drives), clicking an option selects it, and clicking outside the widget closes the dropdown. <code>Escape</code> works from anywhere inside the widget.</p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Examples</h2>
      <p class="text-sm text-base-content/70">Each popup uses the native <strong>Popover API</strong> (top-layer, via <code>popover="manual"</code>) with the exposed <code>popupStyle</code> for anchor positioning. The keyboard-active and mouse-hovered option share the same highlight (via <code>setHighlightedIndex</code> on hover); the selection is shown separately with a check.</p>

      <ExampleShowcase
        :title="textSingleTitle"
        :description="textSingleDescription"
        :source="textSingleSource"
      >
        <TextSingle />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textInternalTitle"
        :description="textInternalDescription"
        :source="textInternalSource"
      >
        <TextInternal />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textSelectOnTabTitle"
        :description="textSelectOnTabDescription"
        :source="textSelectOnTabSource"
      >
        <TextSelectOnTab />
      </ExampleShowcase>

      <ExampleShowcase
        :title="objectSingleTitle"
        :description="objectSingleDescription"
        :source="objectSingleSource"
      >
        <ObjectSingle />
      </ExampleShowcase>

      <ExampleShowcase
        :title="objectValueSingleTitle"
        :description="objectValueSingleDescription"
        :source="objectValueSingleSource"
      >
        <ObjectValueSingle />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textMultipleTitle"
        :description="textMultipleDescription"
        :source="textMultipleSource"
      >
        <TextMultiple />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textMultipleChipsTitle"
        :description="textMultipleChipsDescription"
        :source="textMultipleChipsSource"
      >
        <TextMultipleChips />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textMultipleCustomTitle"
        :description="textMultipleCustomDescription"
        :source="textMultipleCustomSource"
      >
        <TextMultipleCustom />
      </ExampleShowcase>

      <ExampleShowcase
        :title="objectMultipleValidatedTitle"
        :description="objectMultipleValidatedDescription"
        :source="objectMultipleSource"
      >
        <ObjectMultipleValidated />
      </ExampleShowcase>

      <ExampleShowcase
        :title="niceSelectTitle"
        :description="niceSelectDescription"
        :source="niceSource"
      >
        <NiceSelect />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textTypeaheadTitle"
        :description="textTypeaheadDescription"
        :source="textTypeaheadSource"
      >
        <TextTypeahead />
      </ExampleShowcase>

      <ExampleShowcase
        :title="textTypeaheadChipsTitle"
        :description="textTypeaheadChipsDescription"
        :source="textTypeaheadChipsSource"
      >
        <TextTypeaheadChips />
      </ExampleShowcase>

      <ExampleShowcase
        :title="composableSingleTitle"
        :description="composableSingleDescription"
        :source="composableSingleSource"
      >
        <ComposableSingle />
      </ExampleShowcase>

      <ExampleShowcase
        :title="composableProgrammaticTitle"
        :description="composableProgrammaticDescription"
        :source="composableProgrammaticSource"
      >
        <ComposableProgrammatic />
      </ExampleShowcase>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Composable</h2>
      <p class="text-sm text-base-content/70">Two APIs, one state machine: the component renders its default slot with the scope below, and <code>useHeadlessCombobox</code> exposes the exact same state, ARIA prop bags, actions, and ref setters directly — the component is a thin wrapper around it. Use the component for slot-driven templates; use the composable for programmatic control, wrapper components, or non-slot layouts. Call it from <code>setup()</code>.</p>
      <p class="text-sm text-base-content/70">Props accept plain values, refs, or a getter — pass your <code>modelValue</code> ref directly (unwrapped and tracked internally). The second argument receives every <code>update:modelValue</code> payload; write it back to your state.</p>
      <CodeBlock
        :code="SnippetComposableSource.html"
        :raw="SnippetComposableSource.raw"
        lang="vue"
      />
      <p class="text-sm text-base-content/70">The <em>Composable · single · typeahead</em> and <em>Composable · programmatic control</em> examples above show full usage. The returned <code>HeadlessComboboxScope&lt;O, V, Q&gt;</code> mirrors the slot scope — refs for state, plain functions for actions and ref setters.</p>
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
