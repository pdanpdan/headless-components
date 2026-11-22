<script setup lang="ts">
import CodeBlock from '#/components/CodeBlock.vue';
import PropTable from '#/components/PropTable.vue';

import PopupCssSource from '../snippets/popup.css?highlight';

const stylingRows = [
  { name: 'isOpen', type: 'boolean', description: 'Show the popup, or drive `popover.showPopover()` and `hidePopover()`.' },
  { name: 'cssAnchorName', type: 'string', description: 'Put it on the trigger as `anchor-name`. The popup uses `position-anchor` from `popupStyle`.' },
  { name: 'popupStyle', type: 'HeadlessComboboxPopupStyle', description: 'Positioning values for the popup: position-anchor, inset, margin, and width.' },
  { name: 'isSelected(option)', type: 'boolean', description: 'Style the selected option.' },
  { name: 'highlightedIndex', type: 'number', description: 'Style the keyboard and hover highlight. Compare it with the option index.' },
  { name: 'selectedCount', type: 'number', description: 'Show a count, a badge, or disabled state.' },
  { name: 'valid', type: 'boolean', description: 'Style the field and validation message.' },
  { name: 'errors', type: 'HeadlessComboboxErrorCode[]', description: 'Render a specific message for each error code.' },
];
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex max-w-3xl flex-col gap-3">
      <h1 class="text-3xl font-bold">Styling</h1>
      <p class="text-base-content/80">
        The packages do not ship styles. Classes, attributes, and popup
        positioning belong to your markup. The core exposes the state and the
        anchor values; the adapter leaves the DOM to you.
      </p>
    </header>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Popup positioning</h2>
      <p class="text-sm text-base-content/80">
        For a popup in the browser top layer, put
        <code>cssAnchorName</code> on the trigger as <code>anchor-name</code>,
        then put <code>popupStyle</code> on the popup and set the
        <code>popover</code> attribute to <code>manual</code>. The style object
        contains the anchor reference, insets, and margins. The exact binding
        syntax depends on the adapter.
      </p>
      <p class="text-sm text-base-content/80">
        If you render the popup conditionally instead of using the Popover API,
        skip <code>popover</code>. Position it with the same anchor values or
        with your own layout.
      </p>
      <CodeBlock
        :code="PopupCssSource.html"
        :raw="PopupCssSource.raw"
        lang="css"
      />
      <p class="text-sm text-base-content/80">
        The selector is arbitrary. The important parts are
        <code>position-try: flip-block</code>, hiding the popup unless it is
        <code>:popover-open</code>, and animating the entry with
        <code>@starting-style</code>. The <code>overlay</code> and
        <code>display</code> transitions keep the top-layer switch animatable.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">State for classes</h2>
      <p class="text-sm text-base-content/80">
        Use the scope values to choose classes or attributes. The examples use
        daisyUI classes, but any CSS works.
      </p>
      <div
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <PropTable :rows="stylingRows" />
        </div>
      </div>
    </section>

    <section class="flex max-w-3xl flex-col gap-3">
      <h2 class="text-xl font-semibold">Keep the behavior accessible</h2>
      <p class="text-sm text-base-content/80">
        Do not replace the ARIA prop bags with your own roles or handlers.
        Spread <code>triggerProps</code>, <code>comboboxInputProps</code>,
        <code>inputProps</code>, <code>listboxProps</code>, and
        <code>getOptionProps</code> onto the matching elements, then add classes
        and styles around them.
      </p>
      <p class="text-sm text-base-content/80">
        For a typeahead, the input receives <code>comboboxInputProps</code> and
        also acts as the trigger. For a button trigger, use
        <code>triggerProps</code>. Do not put both on the same element.
      </p>
    </section>
  </div>
</template>
