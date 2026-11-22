<script setup lang="ts">
import type { Component } from 'vue';

import { mdiGithub } from '@mdi/js';
import adapterExamples from 'virtual:adapter-examples';
import { computed } from 'vue';

import type { AdapterId } from '#/lib/adapter-examples';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleShowcase from '#/components/ExampleShowcase.vue';
import MdiIcon from '#/components/MdiIcon.vue';
import PropTable from '#/components/PropTable.vue';
import { ADAPTER_DOCS, scopeGroups, valueProps } from '#/lib/adapter-docs';
import { COMPOSABLE_NOTES } from '#/lib/composable-docs';
import { STRUCTURE_TREES } from '#/lib/structure-docs';
import { normalizeHref } from '#/lib/url';

import AngularBindingSource from './snippets/binding-angular.ts?highlight';
import ReactBindingSource from './snippets/binding-react.tsx?highlight';
import SolidBindingSource from './snippets/binding-solid.tsx?highlight';
import SvelteBindingSource from './snippets/binding-svelte.svelte?highlight';
import VueBindingSource from './snippets/binding-vue.vue?highlight';
import AngularComposableSource from './snippets/composable-angular.ts?highlight';
import ReactComposableSource from './snippets/composable-react.tsx?highlight';
import SolidComposableSource from './snippets/composable-solid.tsx?highlight';
import SvelteComposableSource from './snippets/composable-svelte.svelte?highlight';
import VueComposableSource from './snippets/composable-vue.vue?highlight';
import AngularInstallSource from './snippets/install-angular.bash?highlight';
import ReactInstallSource from './snippets/install-react.bash?highlight';
import SolidInstallSource from './snippets/install-solid.bash?highlight';
import SvelteInstallSource from './snippets/install-svelte.bash?highlight';
import VueInstallSource from './snippets/install-vue.bash?highlight';

const props = defineProps<{
  adapter: AdapterId;
  previews?: Record<string, Component>;
}>();

const EXAMPLE_ORDER = [
  'TextSingle',
  'TextInternal',
  'TextSelectOnTab',
  'ObjectSingle',
  'GroupedOptions',
  'ObjectValueSingle',
  'TextMultiple',
  'TextMultipleChips',
  'TextMultipleCustom',
  'ObjectMultipleValidated',
  'NiceSelect',
  'TextTypeahead',
  'TextTypeaheadCreatable',
  'TextTypeaheadChips',
  'ComposableSingle',
  'ComposableProgrammatic',
];

const doc = computed(() => ADAPTER_DOCS[ props.adapter ]);

const install = computed(() => ({
  vue: VueInstallSource,
  react: ReactInstallSource,
  svelte: SvelteInstallSource,
  solid: SolidInstallSource,
  angular: AngularInstallSource,
})[ props.adapter ]);

const binding = computed(() => ({
  vue: { source: VueBindingSource, lang: 'vue' },
  react: { source: ReactBindingSource, lang: 'tsx' },
  svelte: { source: SvelteBindingSource, lang: 'svelte' },
  solid: { source: SolidBindingSource, lang: 'tsx' },
  angular: { source: AngularBindingSource, lang: 'ts' },
})[ props.adapter ]);

const composable = computed(() => ({
  vue: { source: VueComposableSource, lang: 'vue' },
  react: { source: ReactComposableSource, lang: 'tsx' },
  svelte: { source: SvelteComposableSource, lang: 'svelte' },
  solid: { source: SolidComposableSource, lang: 'tsx' },
  angular: { source: AngularComposableSource, lang: 'ts' },
})[ props.adapter ]);

const composableNotes = computed(() => COMPOSABLE_NOTES[ props.adapter ]);

const examples = computed(() => EXAMPLE_ORDER.map((name) => {
  const example = adapterExamples[ name ]!;
  return {
    name,
    ...example,
    source: example.sources[ props.adapter ],
    lang: {
      vue: 'vue',
      react: 'tsx',
      svelte: 'svelte',
      solid: 'tsx',
      angular: 'ts',
    }[ props.adapter ],
  };
}));

const structureRows = [
  { name: 'wrapper element', type: 'setContainerRef', description: 'Widget boundary for click-outside and focus. Optional, recommended.' },
  { name: 'trigger button', type: 'triggerProps, setTriggerRef', description: 'role="combobox". Toggles the popup and handles keyboard navigation.' },
  { name: 'typeahead input', type: 'comboboxInputProps, setTriggerRef, setInputRef', description: 'The input is the combobox: typing reopens and filters. Native autocomplete is off.' },
  { name: 'search input', type: 'inputProps, setInputRef', description: 'role="searchbox". Filters while the popup stays open. Native autocomplete is off.' },
  { name: 'popup element', type: 'popupStyle, setDropdownRef', description: 'Positioning; add popover="manual" to use the native Popover API.' },
  { name: 'list element', type: 'listboxProps, setListRef', description: 'role="listbox". The options container.' },
  { name: 'each option element', type: 'getOptionProps(option, index?), setOptionRef(option, el)', description: 'Option semantics and select/highlight handlers. The index is the position in filteredOptions; omit it to derive that position in grouped or virtualized lists.' },
];

const propsRows = computed(() => valueProps(props.adapter));
const emits = computed(() => doc.value.emits ?? []);
const groups = computed(() => scopeGroups(props.adapter));
const trees = computed(() => STRUCTURE_TREES[ props.adapter ]);

function previewFor(name: string): Component | undefined {
  return props.previews?.[ name ];
}

function formatInline(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/`([^`]+)`/g, '<code class="rounded-sm bg-base-200 px-1 py-0.5 font-mono text-xs">$1</code>');
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-bold">HeadlessCombobox</h1>
        <span class="badge badge-soft badge-primary">{{ doc.label }}</span>
      </div>
      <a
        :href="doc.repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex link items-center gap-1.5 text-sm link-primary"
      >
        <MdiIcon :path="mdiGithub" class="size-5" />
        {{ doc.packageName }}
      </a>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="max-w-3xl text-base-content/80" v-html="formatInline(doc.summary)" />
    </header>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Install</h2>
      <CodeBlock
        :code="install.html"
        :raw="install.raw"
        lang="bash"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Binding</h2>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="text-sm text-base-content/80" v-html="formatInline(doc.apiNote)" />
      <CodeBlock
        :code="binding.source.html"
        :raw="binding.source.raw"
        :lang="binding.lang"
      />
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Structure</h2>
      <p class="text-sm text-base-content/80">
        Each part of the markup receives a piece of the scope. Bind only the
        parts you render.
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="formatInline(doc.spread)" />
      </p>

      <p class="text-sm font-semibold">
        Trigger + popup: a button opens a list below it. Most examples use this
        layout.
      </p>
      <div
        class="
          overflow-x-auto rounded-box bg-neutral p-5 font-mono text-sm/6
          text-neutral-content
        "
      >
        <pre class="min-w-0"><code>{{ trees.popup }}</code></pre>
      </div>

      <p class="text-sm font-semibold">
        Typeahead: the text input itself is the combobox. Typing reopens the
        popup and filters.
      </p>
      <div
        class="
          overflow-x-auto rounded-box bg-neutral p-5 font-mono text-sm/6
          text-neutral-content
        "
      >
        <pre class="min-w-0"><code>{{ trees.typeahead }}</code></pre>
      </div>

      <div
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Markup &rarr; scope</h3>
          <PropTable :rows="structureRows" />
        </div>
      </div>

      <p class="text-sm text-base-content/80">
        Ref setters are optional. <code>setOptionRef</code> enables
        <code>alignSelected</code> and scroll-into-view;
        <code>setContainerRef</code> extends the click-outside boundary, for
        example to chips outside the field.
      </p>
      <p class="text-sm text-base-content/80">
        For CSS anchor positioning and the popover entry animation, see
        <a :href="normalizeHref('/combobox/styling')" class="link link-primary">Styling</a>.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Examples</h2>
      <p class="text-sm text-base-content/80">
        <template v-if="adapter !== 'vue'">
          The preview runs the Vue implementation. The code tab shows the same
          example for {{ doc.label }}.
        </template>
        <template v-else>
          The preview and the code use the same Vue component.
        </template>
      </p>
      <p class="text-sm text-base-content/80">
        The preview uses the native Popover API. Keyboard and hover share the
        same highlight, and the selected option is marked with a check.
      </p>

      <ExampleShowcase
        v-for="example in examples"
        :key="example.name"
        :title="example.title"
        :description="example.description"
        :source="example.source"
        :lang="example.lang"
        :preview="Boolean(previewFor(example.name))"
      >
        <component :is="previewFor(example.name)" v-if="previewFor(example.name)" />
      </ExampleShowcase>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">{{ doc.composable }}</h2>
      <template v-for="note in composableNotes" :key="note">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="text-sm text-base-content/80" v-html="formatInline(note)" />
      </template>
      <CodeBlock
        :code="composable.source.html"
        :raw="composable.source.raw"
        :lang="composable.lang"
      />
      <p class="text-sm text-base-content/80">
        <template v-if="adapter === 'angular'">
          The <em>Composable · programmatic control</em> example drives the
          store from buttons outside the widget.
        </template>
        <template v-else>
          The <em>Composable · single · typeahead</em> and
          <em>Composable · programmatic control</em> examples above show full
          usage.
        </template>
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">API</h2>

      <div
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <h3 class="card-title text-base">
            {{ adapter === 'angular' ? 'Store options' : 'Props' }}
          </h3>
          <p class="text-xs text-base-content/60">
            <template v-if="adapter === 'angular'">
              The value and behavior fields go inside the <code>props</code>
              object passed to <code>{{ doc.composable }}</code>.
              <code>onChange</code> and <code>injector</code> are options on the
              helper itself.
            </template>
            <template v-else>
              These are component and hook options. The value binding is listed
              first.
            </template>
          </p>
          <PropTable :rows="propsRows" show-default />
        </div>
      </div>

      <div
        v-if="emits.length > 0"
        class="
          card overflow-x-auto border border-base-content/5 bg-base-content/2
        "
      >
        <div class="card-body gap-3">
          <h3 class="card-title text-base">Emits</h3>
          <PropTable :rows="emits" />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold">Scope</h3>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="text-sm text-base-content/80" v-html="formatInline(doc.scopeNote)" />
      </div>

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
  </div>
</template>
