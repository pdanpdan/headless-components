<script setup lang="ts">
import { mdiGithub } from '@mdi/js';

import CodeBlock from '#/components/CodeBlock.vue';
import MdiIcon from '#/components/MdiIcon.vue';
import PropTable from '#/components/PropTable.vue';
import {
  ACTION_ROWS,
  ARIA_ROWS,
  BASE_PROPS,
  KEYBOARD_ROWS,
  REF_ROWS,
  STATE_ROWS,
} from '#/lib/adapter-docs';

import CoreUsageSource from '../snippets/core-usage.ts?highlight';
import CoreInstallSource from '../snippets/install-core.bash?highlight';

const factoryRows = [
  { name: 'props', type: 'HeadlessComboboxProps<O, V, Q>', description: 'Initial props: options, modelValue, selection mode, filtering, validation, and behavior flags.' },
  { name: 'onChange', type: '(value: V | V[] | null) => void', description: 'Called for every selection change.' },
  { name: 'runtime', type: 'ComboboxRuntimeOverrides', description: 'Host hooks for nextTick, unwrap, createId, and document lookup.' },
];

const runtimeRows = [
  { name: 'nextTick', type: '() => Promise<void>', description: 'Resolve after the host has committed the DOM. Defaults to Promise.resolve().' },
  { name: 'unwrap', type: '<T>(value: T) => T', description: 'Strip framework proxies before identity comparisons. Defaults to identity.' },
  { name: 'createId', type: '() => string', description: 'Stable id source for accessibility attributes.' },
  { name: 'getDocument', type: '() => Document | null', description: 'Document access for listeners. Defaults to the global document when available.' },
];

const propRows = [
  {
    name: 'modelValue',
    type: 'V | V[] | null',
    default: 'undefined',
    description: 'Selected value(s). Omit it to let the store keep the selection internally.',
  },
  ...BASE_PROPS,
];

const groups = [
  { title: 'State', description: 'Values for the current selection and popup.', rows: STATE_ROWS },
  { title: 'ARIA prop bags', description: 'Attributes and handlers for your markup.', rows: ARIA_ROWS },
  { title: 'Actions', description: 'Methods that drive the state machine.', rows: ACTION_ROWS },
  { title: 'Ref setters', description: 'Attach DOM elements to the store.', rows: REF_ROWS },
];
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-bold">Combobox core</h1>
        <span class="badge badge-soft badge-primary">framework-independent</span>
      </div>
      <a
        href="https://github.com/pdanpdan/headless-components/tree/main/packages/headless-combobox-core"
        target="_blank"
        rel="noopener noreferrer"
        class="flex link items-center gap-1.5 text-sm link-primary"
      >
        <MdiIcon :path="mdiGithub" class="size-5" />
        @pdanpdan/headless-combobox-core
      </a>
      <p class="max-w-3xl text-base-content/80">
        The state machine used by every adapter. It owns selection, filtering,
        validation, keyboard navigation, popup lifecycle, anchoring, and focus
        management. It does not render anything and does not import a framework.
      </p>
    </header>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Install</h2>
      <CodeBlock
        :code="CoreInstallSource.html"
        :raw="CoreInstallSource.raw"
        lang="bash"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Usage</h2>
      <p class="text-sm text-base-content/80">
        Create the store, push props with <code>setProps</code>, and call
        <code>mount()</code> when the DOM is available. The snapshot contains
        state, actions, ARIA prop bags, and ref setters. Call
        <code>destroy()</code> when the host unmounts.
      </p>
      <CodeBlock
        :code="CoreUsageSource.html"
        :raw="CoreUsageSource.raw"
        lang="ts"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Keyboard</h2>
      <PropTable :rows="KEYBOARD_ROWS" />
      <p class="text-sm text-base-content/80">
        Clicking the trigger toggles the popup. Hovering or focusing an option
        highlights it, clicking selects it, and clicking outside the container
        closes the popup. Escape works from anywhere inside the widget.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Factory options</h2>
      <div
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <PropTable :rows="factoryRows" />
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Props</h2>
      <p class="text-sm text-base-content/80">
        These fields go inside the <code>props</code> object. Reactive adapters
        call <code>setProps</code> whenever their inputs change.
      </p>
      <div
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <PropTable :rows="propRows" show-default />
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Snapshot</h2>
      <div
        v-for="group in groups"
        :key="group.title"
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <h3 class="card-title text-base">{{ group.title }}</h3>
          <p class="text-xs text-base-content/60">{{ group.description }}</p>
          <PropTable :rows="group.rows" />
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Runtime</h2>
      <p class="text-sm text-base-content/80">
        Adapters override these hooks so the core can wait for a framework
        render, unwrap proxies, and use the framework's id generator.
      </p>
      <div
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <PropTable :rows="runtimeRows" />
        </div>
      </div>
    </section>
  </div>
</template>
